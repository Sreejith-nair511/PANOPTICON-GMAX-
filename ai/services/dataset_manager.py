"""
PANOPTICON Dataset Manager
Integrates MOT17, Market-1501, and COCO datasets for enhanced AI capabilities

DATASET DISSECTION:
1. MOT17 — Multi-Object Tracking for pedestrian tracking in CCTV sequences
2. Market-1501 — Person Re-Identification for cross-camera identity matching
3. COCO — General object detection and segmentation for comprehensive scene understanding

All datasets support real CCTV footage demonstration and validation.
"""

import logging
import os
from typing import Dict, List, Any, Optional, Tuple
from pathlib import Path
from dataclasses import dataclass
import json
import numpy as np

logger = logging.getLogger("panopticon.datasets")


@dataclass
class MOT17Track:
    """MOT17: Multi-Object Tracking Track representation"""
    track_id: int
    class_id: int  # 1 = pedestrian
    start_frame: int
    end_frame: int
    frames: List[Dict[str, Any]]  # [{frame_no, bbox, confidence}]
    video_id: str
    
    def duration(self) -> int:
        return self.end_frame - self.start_frame + 1
    
    def average_confidence(self) -> float:
        if not self.frames:
            return 0.0
        confs = [f.get("confidence", 1.0) for f in self.frames]
        return sum(confs) / len(confs)


@dataclass
class Market1501Person:
    """Market-1501: Person Re-Identification record"""
    person_id: int
    camera_id: int
    sequence_id: int
    image_path: str
    embedding: Optional[np.ndarray] = None
    attributes: Dict[str, str] = None
    
    def __post_init__(self):
        if self.attributes is None:
            self.attributes = {
                "gender": "unknown",
                "age_group": "unknown",
                "color_top": "unknown",
                "color_bottom": "unknown",
                "bags": "no"
            }


@dataclass
class COCODetection:
    """COCO: Object Detection record"""
    image_id: int
    category_id: int
    category_name: str
    bbox: Tuple[float, float, float, float]  # [x, y, w, h]
    area: float
    iscrowd: bool
    segmentation: Optional[List] = None
    confidence: float = 1.0


class MOT17DatasetHandler:
    """
    Handler for MOT17 (Multi-Object Tracking Challenge 2017) dataset.
    
    MOT17 provides:
    - 14 video sequences (7 train, 7 test)
    - Pedestrian-centric tracking with ground truth annotations
    - Dense frame-level tracking data for CCTV-like scenarios
    - Ideal for validating ByteTrack and tracker consistency
    
    Citation: MOT17 — https://motchallenge.net/data/MOT17/
    """
    
    def __init__(self, dataset_path: str):
        self.dataset_path = Path(dataset_path)
        self.sequences: Dict[str, List[MOT17Track]] = {}
        logger.info(f"MOT17 Dataset initialized at {dataset_path}")
    
    def load_sequence(self, sequence_name: str) -> List[MOT17Track]:
        """
        Load MOT17 sequence (e.g., 'MOT17-02-FRCNN')
        
        GT format: <frame>, <id>, <x>, <y>, <w>, <h>, <conf>, <class>, <visibility>
        """
        gt_file = self.dataset_path / sequence_name / "gt" / "gt.txt"
        if not gt_file.exists():
            logger.warning(f"GT file not found: {gt_file}")
            return []
        
        tracks_dict: Dict[int, MOT17Track] = {}
        
        try:
            with open(gt_file, 'r') as f:
                for line in f:
                    parts = line.strip().split(',')
                    if len(parts) < 9:
                        continue
                    
                    frame_no = int(parts[0])
                    track_id = int(parts[1])
                    x, y, w, h = map(float, parts[2:6])
                    conf = float(parts[6])
                    class_id = int(parts[7])
                    visibility = float(parts[8]) if len(parts) > 8 else 1.0
                    
                    # Skip low-visibility tracks
                    if visibility < 0.5 or class_id != 1:
                        continue
                    
                    if track_id not in tracks_dict:
                        tracks_dict[track_id] = MOT17Track(
                            track_id=track_id,
                            class_id=class_id,
                            start_frame=frame_no,
                            end_frame=frame_no,
                            frames=[],
                            video_id=sequence_name
                        )
                    
                    track = tracks_dict[track_id]
                    track.end_frame = max(track.end_frame, frame_no)
                    track.frames.append({
                        "frame_no": frame_no,
                        "bbox": [x, y, w, h],
                        "confidence": conf
                    })
            
            tracks = list(tracks_dict.values())
            self.sequences[sequence_name] = tracks
            logger.info(f"Loaded MOT17 sequence '{sequence_name}': {len(tracks)} tracks")
            return tracks
            
        except Exception as e:
            logger.error(f"Failed to load MOT17 sequence {sequence_name}: {e}")
            return []
    
    def get_statistics(self, sequence_name: str) -> Dict[str, Any]:
        """Compute MOT17 statistics for a sequence"""
        tracks = self.sequences.get(sequence_name, [])
        if not tracks:
            return {}
        
        frame_counts = [len(t.frames) for t in tracks]
        durations = [t.duration() for t in tracks]
        
        return {
            "total_tracks": len(tracks),
            "total_frames_annotated": sum(frame_counts),
            "avg_track_duration": sum(durations) / len(durations),
            "min_track_duration": min(durations),
            "max_track_duration": max(durations),
            "avg_confidence": sum(t.average_confidence() for t in tracks) / len(tracks),
            "use_case": "Multi-object pedestrian tracking in CCTV sequences"
        }


class Market1501ReIDHandler:
    """
    Handler for Market-1501 (Person Re-Identification) dataset.
    
    Market-1501 provides:
    - 1,501 identities tracked across 6 cameras
    - 32,668 gallery images, 19,732 probe images
    - Cross-camera identity matching ground truth
    - Ideal for validating FastReID and re-identification accuracy
    
    Citation: Market-1501 — https://zheng-lab.cecs.anu.edu.au/Project/project_reid.html
    """
    
    def __init__(self, dataset_path: str):
        self.dataset_path = Path(dataset_path)
        self.persons: Dict[int, List[Market1501Person]] = {}
        self.embeddings_cache: Dict[str, np.ndarray] = {}
        logger.info(f"Market-1501 ReID Dataset initialized at {dataset_path}")
    
    def load_identities(self) -> Dict[int, List[Market1501Person]]:
        """
        Load Market-1501 identity and image mappings.
        
        Filename format: <person_id>_<camera_id>_<sequence_id>.jpg
        E.g., 0001_c1s1_001_01.jpg => person 1, camera 1, sequence 1
        """
        bounding_box_train = self.dataset_path / "bounding_box_train"
        bounding_box_test = self.dataset_path / "bounding_box_test"
        
        for img_dir in [bounding_box_train, bounding_box_test]:
            if not img_dir.exists():
                logger.warning(f"Directory not found: {img_dir}")
                continue
            
            for img_file in img_dir.glob("*.jpg"):
                parts = img_file.stem.split('_')
                if len(parts) < 4:
                    continue
                
                try:
                    person_id = int(parts[0])
                    camera_id = int(parts[1][1])  # c1 -> 1
                    sequence_id = int(parts[2].split('s')[1])  # s1 -> 1
                    
                    person = Market1501Person(
                        person_id=person_id,
                        camera_id=camera_id,
                        sequence_id=sequence_id,
                        image_path=str(img_file)
                    )
                    
                    if person_id not in self.persons:
                        self.persons[person_id] = []
                    self.persons[person_id].append(person)
                    
                except (ValueError, IndexError) as e:
                    logger.debug(f"Skipped file {img_file}: {e}")
        
        logger.info(f"Loaded {len(self.persons)} identities from Market-1501")
        return self.persons
    
    def compute_reid_metrics(self) -> Dict[str, Any]:
        """Compute cross-camera re-identification metrics"""
        if not self.persons:
            return {}
        
        # Count cross-camera appearances
        cross_camera_count = 0
        single_camera_count = 0
        
        for person_id, images in self.persons.items():
            cameras = set(img.camera_id for img in images)
            if len(cameras) > 1:
                cross_camera_count += 1
            else:
                single_camera_count += 1
        
        return {
            "total_identities": len(self.persons),
            "cross_camera_identities": cross_camera_count,
            "single_camera_identities": single_camera_count,
            "total_images": sum(len(imgs) for imgs in self.persons.values()),
            "use_case": "Cross-camera person re-identification for suspect tracking"
        }


class COCODatasetHandler:
    """
    Handler for COCO (Common Objects in Context) dataset.
    
    COCO provides:
    - 330K images with 2.5M instances
    - 80 object categories (person, vehicle, weapon, etc.)
    - Instance segmentation masks for precise object boundaries
    - Ideal for comprehensive scene understanding and weapon detection
    
    Citation: COCO — https://cocodataset.org/
    """
    
    def __init__(self, dataset_path: str, annotations_file: str = "instances.json"):
        self.dataset_path = Path(dataset_path)
        self.annotations_file = self.dataset_path / annotations_file
        self.categories: Dict[int, str] = {}
        self.detections: List[COCODetection] = []
        logger.info(f"COCO Dataset initialized at {dataset_path}")
    
    def load_annotations(self) -> Dict[str, Any]:
        """Load COCO annotations from JSON"""
        if not self.annotations_file.exists():
            logger.warning(f"Annotations not found: {self.annotations_file}")
            return {}
        
        try:
            with open(self.annotations_file, 'r') as f:
                data = json.load(f)
            
            # Map category IDs to names
            for cat in data.get("categories", []):
                self.categories[cat["id"]] = cat["name"]
            
            # Load detections
            for ann in data.get("annotations", []):
                detection = COCODetection(
                    image_id=ann["image_id"],
                    category_id=ann["category_id"],
                    category_name=self.categories.get(ann["category_id"], "unknown"),
                    bbox=tuple(ann["bbox"]),
                    area=ann["area"],
                    iscrowd=ann.get("iscrowd", False),
                    segmentation=ann.get("segmentation")
                )
                self.detections.append(detection)
            
            logger.info(f"Loaded {len(self.detections)} COCO annotations")
            return {"categories": len(self.categories), "detections": len(self.detections)}
            
        except Exception as e:
            logger.error(f"Failed to load COCO annotations: {e}")
            return {}
    
    def get_category_distribution(self) -> Dict[str, int]:
        """Get object category frequency distribution"""
        distribution = {}
        for det in self.detections:
            distribution[det.category_name] = distribution.get(det.category_name, 0) + 1
        return dict(sorted(distribution.items(), key=lambda x: x[1], reverse=True))
