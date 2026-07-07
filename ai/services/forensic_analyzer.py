"""
Forensic Analysis Service
High-level forensic investigation pipeline
"""

import logging
from typing import Any, Dict, List, Optional
import numpy as np
import cv2
from pathlib import Path
from datetime import datetime

from ai.models.forensic_ensemble import ForensicEnsemble, ForensicAnalysisResult

logger = logging.getLogger("panopticon.services.forensic_analyzer")


class ForensicAnalyzer:
    """
    Complete forensic investigation pipeline
    Processes videos and generates investigative reports
    """

    def __init__(
        self,
        device: str = "auto",
        confidence_threshold: float = 0.45,
        enable_segmentation: bool = True,
        case_id: str = "DEFAULT",
    ):
        self.device = device
        self.case_id = case_id
        self.ensemble = ForensicEnsemble(
            device=device,
            confidence_threshold=confidence_threshold,
            enable_segmentation=enable_segmentation,
        )
        self.analysis_results: List[ForensicAnalysisResult] = []
        self.logger = logging.getLogger(f"panopticon.forensic_analyzer.{case_id}")

    def load_models(self) -> ForensicAnalyzer:
        """Load all forensic models"""
        self.logger.info(f"Loading forensic analyzer for case: {self.case_id}")
        self.ensemble.load()
        return self

    def analyze_video(
        self,
        video_path: str,
        sample_rate: int = 1,
        max_frames: Optional[int] = None,
        progress_callback: Optional[callable] = None,
    ) -> Dict[str, Any]:
        """
        Analyze entire video file for forensic evidence

        Args:
            video_path: Path to video file
            sample_rate: Process every Nth frame (1=all frames)
            max_frames: Maximum frames to process
            progress_callback: Callback function for progress updates

        Returns:
            Forensic analysis report
        """
        self.logger.info(f"Starting video analysis: {video_path}")

        # Open video
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            raise ValueError(f"Cannot open video: {video_path}")

        # Get video properties
        fps = cap.get(cv2.CAP_PROP_FPS)
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        frame_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        frame_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

        self.logger.info(f"Video: {frame_width}x{frame_height} @ {fps}fps, {total_frames} frames")

        frame_count = 0
        processed_count = 0
        self.analysis_results = []

        try:
            while True:
                ret, frame = cap.read()
                if not ret:
                    break

                frame_count += 1

                # Skip frames based on sample_rate
                if frame_count % sample_rate != 0:
                    continue

                # Check max_frames limit
                if max_frames and processed_count >= max_frames:
                    break

                # Calculate timestamp
                timestamp = frame_count / fps if fps > 0 else 0

                # Analyze frame
                try:
                    result = self.ensemble.analyze_frame(
                        frame,
                        timestamp=timestamp,
                        extract_embeddings=True,
                    )
                    self.analysis_results.append(result)
                    processed_count += 1

                    # Progress callback
                    if progress_callback:
                        progress = int((processed_count / (total_frames / sample_rate)) * 100)
                        progress_callback(progress, f"Analyzed frame {processed_count}")

                except Exception as e:
                    self.logger.error(f"Error analyzing frame {frame_count}: {e}")
                    continue

        finally:
            cap.release()

        self.logger.info(f"Video analysis complete: {processed_count} frames processed")

        return self._generate_report()

    def analyze_image_batch(
        self,
        image_paths: List[str],
        timestamps: Optional[List[float]] = None,
    ) -> Dict[str, Any]:
        """
        Analyze batch of images

        Args:
            image_paths: List of image file paths
            timestamps: Optional list of timestamps

        Returns:
            Forensic analysis report
        """
        self.logger.info(f"Starting batch image analysis: {len(image_paths)} images")

        timestamps = timestamps or [float(i) for i in range(len(image_paths))]
        self.analysis_results = []

        for idx, image_path in enumerate(image_paths):
            try:
                frame = cv2.imread(image_path)
                if frame is None:
                    self.logger.warning(f"Cannot read image: {image_path}")
                    continue

                result = self.ensemble.analyze_frame(
                    frame,
                    timestamp=timestamps[idx],
                    extract_embeddings=True,
                )
                self.analysis_results.append(result)

            except Exception as e:
                self.logger.error(f"Error analyzing image {image_path}: {e}")
                continue

        self.logger.info(f"Batch analysis complete: {len(self.analysis_results)} images processed")
        return self._generate_report()

    def detect_cross_scene_matches(
        self,
        query_image_path: str,
        similarity_threshold: float = 0.65,
    ) -> Dict[str, Any]:
        """
        Find person matches across different scenes/videos

        Args:
            query_image_path: Path to query image of person
            similarity_threshold: Minimum similarity score

        Returns:
            List of matching suspects
        """
        self.logger.info(f"Searching for cross-scene matches: {query_image_path}")

        # Load and analyze query image
        query_frame = cv2.imread(query_image_path)
        if query_frame is None:
            raise ValueError(f"Cannot read query image: {query_image_path}")

        # Extract person crop from query image
        result = self.ensemble.detector.infer([query_frame])[0]
        persons = [d for d in result if d.get("label") == "person"]

        if not persons:
            return {
                "query_image": query_image_path,
                "matches": [],
                "message": "No persons detected in query image",
            }

        # Extract embeddings from persons in query image
        query_person = persons[0]  # Use first person detected
        h, w = query_frame.shape[:2]
        bbox = query_person["bbox"]
        x1 = int(bbox["x"] * w)
        y1 = int(bbox["y"] * h)
        x2 = int((bbox["x"] + bbox["width"]) * w)
        y2 = int((bbox["y"] + bbox["height"]) * h)

        person_crop = query_frame[y1:y2, x1:x2]
        query_embedding = self.ensemble.reid.infer([person_crop])[0]

        # Find matches in gallery
        matches = self.ensemble.match_suspect_across_scenes(
            query_embedding,
            threshold=similarity_threshold,
        )

        return {
            "query_image": query_image_path,
            "query_confidence": float(query_person.get("confidence", 0)),
            "matches": matches,
            "similarity_threshold": similarity_threshold,
        }

    def _generate_report(self) -> Dict[str, Any]:
        """Generate comprehensive forensic analysis report"""
        if not self.analysis_results:
            return {
                "case_id": self.case_id,
                "status": "no_data",
                "message": "No analysis results available",
            }

        # Aggregate statistics
        all_detections = []
        all_suspects = []
        all_timeline_events = []
        all_flags = []

        for result in self.analysis_results:
            all_detections.extend(result.detections)
            all_suspects.extend(result.suspects)
            all_timeline_events.extend(result.timeline_events)
            all_flags.extend(result.forensic_flags)

        # Compute summary statistics
        total_persons = len([d for d in all_detections if d.get("label") == "person"])
        total_vehicles = len([d for d in all_detections if d.get("label") in ["car", "truck", "bus"]])
        total_weapons = len([d for d in all_detections if d.get("label") in ["knife", "gun"]])
        avg_confidence = np.mean([d.get("confidence", 0) for d in all_detections]) if all_detections else 0

        # High-risk frames (with weapons or suspicious activity)
        high_risk_frames = [
            r for r in self.analysis_results
            if any("WEAPON" in f for f in r.forensic_flags)
            or any("GROUP" in f for f in r.forensic_flags)
        ]

        return {
            "case_id": self.case_id,
            "timestamp_generated": datetime.utcnow().isoformat(),
            "analysis_summary": {
                "total_frames_analyzed": len(self.analysis_results),
                "total_detections": len(all_detections),
                "total_persons": total_persons,
                "total_vehicles": total_vehicles,
                "total_weapons": total_weapons,
                "average_confidence": float(avg_confidence),
                "total_timeline_events": len(all_timeline_events),
                "high_risk_frames_count": len(high_risk_frames),
            },
            "suspects_identified": self._aggregate_suspects(all_suspects),
            "forensic_findings": {
                "weapons_detected": any("WEAPON" in f for f in all_flags),
                "suspicious_patterns": list(set(all_flags)),
                "total_suspicious_events": len(all_timeline_events),
            },
            "timeline_events": all_timeline_events[-100:],  # Last 100 events
            "high_risk_frames": [
                {
                    "frame": r.frame_number,
                    "timestamp": r.timestamp,
                    "flags": r.forensic_flags,
                }
                for r in high_risk_frames[-10:]  # Last 10 high-risk frames
            ],
            "forensic_ensemble_report": self.ensemble.generate_forensic_report(),
        }

    def _aggregate_suspects(self, suspects: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Aggregate and deduplicate suspects"""
        suspect_dict = {}

        for suspect in suspects:
            track_id = suspect.get("track_id")
            if track_id:
                if track_id not in suspect_dict:
                    suspect_dict[track_id] = {
                        "track_id": track_id,
                        "label": suspect["label"],
                        "appearances": 0,
                        "avg_confidence": [],
                    }

                suspect_dict[track_id]["appearances"] += 1
                suspect_dict[track_id]["avg_confidence"].append(suspect.get("confidence", 0))

        # Compute final statistics
        result = []
        for track_id, data in suspect_dict.items():
            result.append({
                "id": f"suspect_{track_id}",
                "track_id": track_id,
                "label": data["label"],
                "total_appearances": data["appearances"],
                "average_confidence": float(np.mean(data["avg_confidence"])),
                "risk_level": self._compute_risk_level(
                    data["appearances"],
                    np.mean(data["avg_confidence"]),
                ),
            })

        return sorted(result, key=lambda x: x["total_appearances"], reverse=True)

    def _compute_risk_level(self, appearances: int, confidence: float) -> str:
        """Compute risk level for a suspect"""
        score = appearances * confidence

        if score >= 30:
            return "critical"
        elif score >= 20:
            return "high"
        elif score >= 10:
            return "medium"
        else:
            return "low"

    def export_report(self, output_path: str) -> None:
        """Export forensic report to JSON file"""
        import json

        report = self._generate_report()

        with open(output_path, "w") as f:
            json.dump(report, f, indent=2, default=str)

        self.logger.info(f"Report exported to: {output_path}")

    def reset(self) -> None:
        """Reset analyzer for new case"""
        self.ensemble.reset()
        self.analysis_results.clear()
        self.logger.info("Forensic analyzer reset")
