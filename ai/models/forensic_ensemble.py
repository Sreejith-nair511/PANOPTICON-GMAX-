"""
PANOPTICON Forensic Ensemble Model
Combines multiple specialized models for comprehensive forensic analysis
"""

from __future__ import annotations

import logging
from typing import Any, Dict, List, Optional, Tuple
import numpy as np
from dataclasses import dataclass

from .detector import YOLODetector
from .tracker import ByteTracker
from .reid import FastReIDModule
from .segmentor import SAM2Segmentor

logger = logging.getLogger("panopticon.models.forensic_ensemble")


@dataclass
class ForensicAnalysisResult:
    """Complete forensic analysis result"""
    frame_number: int
    timestamp: float
    detections: List[Dict[str, Any]]
    tracks: Dict[int, Any]
    suspects: List[Dict[str, Any]]
    timeline_events: List[Dict[str, Any]]
    confidence_scores: Dict[str, float]
    forensic_flags: List[str]
    processing_time_ms: float


class ForensicEnsemble:
    """
    Combines all forensic models into a unified analysis pipeline
    
    Pipeline:
    1. Detection (YOLOv8) - Find all objects
    2. Segmentation (SAM2) - Get precise boundaries
    3. Tracking (ByteTrack) - Track persons across frames
    4. Re-ID (FastReID) - Match persons across scenes
    5. Forensic Analysis - Generate investigative insights
    """

    def __init__(
        self,
        device: str = "auto",
        confidence_threshold: float = 0.45,
        enable_segmentation: bool = True,
    ):
        self.device = device
        self.confidence_threshold = confidence_threshold
        self.enable_segmentation = enable_segmentation

        # Initialize models
        self.detector = YOLODetector(device=device, confidence_threshold=confidence_threshold)
        self.tracker = ByteTracker()
        self.reid = FastReIDModule(device=device)
        self.segmentor = SAM2Segmentor(device=device) if enable_segmentation else None

        # State tracking
        self.suspect_gallery: Dict[str, Dict[str, Any]] = {}
        self.timeline_events: List[Dict[str, Any]] = []
        self.frame_count = 0
        self.suspicious_patterns: List[str] = []

        self.logger = logging.getLogger("panopticon.forensic_ensemble")

    def load(self) -> ForensicEnsemble:
        """Load all models"""
        self.logger.info("Loading forensic ensemble...")

        self.detector.load()
        self.tracker.load()
        self.reid.load()
        if self.segmentor:
            self.segmentor.load()

        self.logger.info("✓ Forensic ensemble ready")
        return self

    def analyze_frame(
        self,
        frame: np.ndarray,
        timestamp: float = 0.0,
        extract_embeddings: bool = True,
    ) -> ForensicAnalysisResult:
        """
        Complete forensic analysis of a single frame
        """
        import time
        start_time = time.time()

        self.frame_count += 1

        # Stage 1: Detection
        detections = self.detector.infer(
            [frame],
            frame_numbers=[self.frame_count],
            timestamps=[timestamp],
        )[0]

        # Stage 2: Segmentation (optional)
        if self.segmentor and detections:
            detections = self.segmentor.infer(frame, detections)

        # Stage 3: Tracking
        tracked_detections = self.tracker.infer(detections)

        # Stage 4: Extract embeddings for persons
        person_crops = []
        person_indices = []
        for i, det in enumerate(tracked_detections):
            if det.get("label") == "person":
                # Extract person crop
                h, w = frame.shape[:2]
                bbox = det["bbox"]
                x1 = int(bbox["x"] * w)
                y1 = int(bbox["y"] * h)
                x2 = int((bbox["x"] + bbox["width"]) * w)
                y2 = int((bbox["y"] + bbox["height"]) * h)

                # Ensure valid coordinates
                x1, y1 = max(0, x1), max(0, y1)
                x2, y2 = min(w, x2), min(h, y2)

                if x2 > x1 and y2 > y1:
                    crop = frame[y1:y2, x1:x2]
                    person_crops.append(crop)
                    person_indices.append(i)

        # Get embeddings
        if extract_embeddings and person_crops:
            try:
                embeddings = self.reid.infer(person_crops)
                for idx, emb in zip(person_indices, embeddings):
                    tracked_detections[idx]["embedding"] = emb
            except Exception as e:
                self.logger.warning(f"Failed to extract embeddings: {e}")

        # Stage 5: Forensic analysis
        suspects = self._identify_suspects(tracked_detections)
        forensic_flags = self._analyze_forensic_patterns(tracked_detections, suspects)
        timeline_events = self._generate_timeline_events(tracked_detections, suspects, timestamp)

        processing_time = (time.time() - start_time) * 1000

        return ForensicAnalysisResult(
            frame_number=self.frame_count,
            timestamp=timestamp,
            detections=tracked_detections,
            tracks=self.tracker.get_active_tracks(),
            suspects=suspects,
            timeline_events=timeline_events,
            confidence_scores=self._compute_confidence_scores(tracked_detections),
            forensic_flags=forensic_flags,
            processing_time_ms=processing_time,
        )

    def _identify_suspects(self, detections: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Identify and track suspects"""
        suspects = []

        for det in detections:
            if det.get("label") == "person" and det.get("track_id"):
                track_id = det["track_id"]
                key = f"person_{track_id}"

                if key not in self.suspect_gallery:
                    self.suspect_gallery[key] = {
                        "track_id": track_id,
                        "label": f"Suspect-{track_id}",
                        "detections": [],
                        "embeddings": [],
                        "first_seen": self.frame_count,
                        "last_seen": self.frame_count,
                        "confidence": det.get("confidence", 0),
                    }

                suspect = self.suspect_gallery[key]
                suspect["detections"].append(det)
                suspect["last_seen"] = self.frame_count

                if "embedding" in det:
                    suspect["embeddings"].append(det["embedding"])

                suspects.append({
                    "id": key,
                    "track_id": track_id,
                    "label": suspect["label"],
                    "confidence": det.get("confidence", 0),
                    "appearances": len(suspect["detections"]),
                    "bbox": det["bbox"],
                })

        return suspects

    def _analyze_forensic_patterns(
        self,
        detections: List[Dict[str, Any]],
        suspects: List[Dict[str, Any]],
    ) -> List[str]:
        """Analyze for forensic suspicious patterns"""
        flags = []

        # Pattern 1: Weapon/knife detection
        weapons = [d for d in detections if d.get("label") in ["knife", "gun", "weapon"]]
        if weapons:
            flags.append(f"WEAPON_DETECTED: {len(weapons)} weapons")

        # Pattern 2: Loitering (person stays in frame for long time)
        persons = [d for d in detections if d.get("label") == "person"]
        if len(persons) > 0:
            avg_confidence = np.mean([p.get("confidence", 0) for p in persons])
            if avg_confidence < 0.3:
                flags.append("LOW_CONFIDENCE_DETECTION: Partial occlusion detected")

        # Pattern 3: Group gathering
        if len(persons) >= 5:
            flags.append(f"GROUP_GATHERING: {len(persons)} persons in frame")

        # Pattern 4: Vehicle detection
        vehicles = [d for d in detections if d.get("label") in ["car", "truck", "bus", "motorcycle"]]
        if vehicles:
            flags.append(f"VEHICLE_DETECTED: {len(vehicles)} vehicles")

        # Pattern 5: High-value item detection
        valuable_items = [d for d in detections if d.get("label") in ["laptop", "phone", "backpack", "suitcase"]]
        if valuable_items:
            flags.append(f"VALUABLE_ITEMS_DETECTED: {len(valuable_items)} items")

        # Pattern 6: Suspicious behavior - rapid movement
        if len(suspects) > 0:
            moving_suspects = [s for s in suspects if s.get("appearances", 0) > 10]
            if moving_suspects:
                flags.append(f"RAPID_MOVEMENT: {len(moving_suspects)} suspects moving quickly")

        return flags

    def _generate_timeline_events(
        self,
        detections: List[Dict[str, Any]],
        suspects: List[Dict[str, Any]],
        timestamp: float,
    ) -> List[Dict[str, Any]]:
        """Generate timeline events for investigative report"""
        events = []

        # Event 1: Suspect appearance
        for suspect in suspects:
            if suspect.get("appearances") == 1:
                events.append({
                    "timestamp": timestamp,
                    "type": "suspect_first_appearance",
                    "description": f"{suspect['label']} first appears",
                    "confidence": suspect.get("confidence", 0),
                    "track_id": suspect.get("track_id"),
                })

        # Event 2: Weapon/item interaction
        for det in detections:
            if det.get("label") in ["knife", "gun", "laptop", "phone"]:
                events.append({
                    "timestamp": timestamp,
                    "type": "item_detection",
                    "description": f"{det['label']} detected",
                    "confidence": det.get("confidence", 0),
                    "bbox": det["bbox"],
                })

        # Event 3: Unexpected behavior
        persons_with_backpacks = [
            d for d in detections
            if d.get("label") == "person"
            and any(d2.get("label") == "backpack" for d2 in detections)
        ]
        if persons_with_backpacks:
            events.append({
                "timestamp": timestamp,
                "type": "suspicious_interaction",
                "description": f"Person with backpack detected",
                "confidence": np.mean([p.get("confidence", 0) for p in persons_with_backpacks]),
            })

        return events

    def _compute_confidence_scores(self, detections: List[Dict[str, Any]]) -> Dict[str, float]:
        """Compute overall confidence metrics"""
        if not detections:
            return {
                "overall": 0.0,
                "detection": 0.0,
                "tracking": 0.0,
                "forensic": 0.0,
            }

        detection_confidence = np.mean([d.get("confidence", 0) for d in detections])
        tracked = [d for d in detections if d.get("track_id")]
        tracking_confidence = len(tracked) / max(len(detections), 1)

        forensic_confidence = min(detection_confidence * tracking_confidence, 1.0)

        return {
            "overall": (detection_confidence + tracking_confidence + forensic_confidence) / 3,
            "detection": float(detection_confidence),
            "tracking": float(tracking_confidence),
            "forensic": float(forensic_confidence),
        }

    def match_suspect_across_scenes(
        self,
        query_embedding: np.ndarray,
        threshold: float = 0.6,
    ) -> List[Dict[str, Any]]:
        """Match a suspect across multiple scenes using ReID"""
        matches = []

        for suspect_key, suspect_data in self.suspect_gallery.items():
            if not suspect_data["embeddings"]:
                continue

            # Compute similarity with all embeddings for this suspect
            similarities = [
                self.reid.similarity(query_embedding, emb)
                for emb in suspect_data["embeddings"]
            ]

            max_similarity = max(similarities)

            if max_similarity >= threshold:
                matches.append({
                    "suspect_id": suspect_key,
                    "similarity": float(max_similarity),
                    "track_id": suspect_data["track_id"],
                    "label": suspect_data["label"],
                    "appearance_count": len(suspect_data["detections"]),
                })

        # Sort by similarity
        matches.sort(key=lambda x: x["similarity"], reverse=True)
        return matches

    def generate_forensic_report(self) -> Dict[str, Any]:
        """Generate comprehensive forensic investigation report"""
        total_frames_analyzed = self.frame_count
        unique_suspects = len(self.suspect_gallery)
        total_suspicious_events = len([e for e in self.timeline_events if "suspicious" in e.get("type", "")])

        return {
            "summary": {
                "total_frames_analyzed": total_frames_analyzed,
                "unique_suspects_identified": unique_suspects,
                "total_suspicious_events": total_suspicious_events,
                "timeline_events": len(self.timeline_events),
            },
            "suspects": [
                {
                    "id": key,
                    "track_id": data["track_id"],
                    "label": data["label"],
                    "first_seen_frame": data["first_seen"],
                    "last_seen_frame": data["last_seen"],
                    "total_appearances": len(data["detections"]),
                    "confidence": float(data["confidence"]),
                }
                for key, data in self.suspect_gallery.items()
            ],
            "timeline": self.timeline_events,
            "suspicious_patterns": self.suspicious_patterns,
            "high_risk_frames": [
                f for f in range(1, total_frames_analyzed + 1)
                if any(t.get("frame") == f for t in self.timeline_events)
            ],
        }

    def reset(self) -> None:
        """Reset ensemble state for new video/case"""
        self.tracker.reset()
        self.suspect_gallery.clear()
        self.timeline_events.clear()
        self.frame_count = 0
        self.suspicious_patterns.clear()
        self.logger.info("Forensic ensemble reset")
