# PANOPTICON AI Models - Detailed Architecture

## Overview
The PANOPTICON system implements a comprehensive computer vision pipeline for forensic analysis, featuring four core AI models orchestrated through a unified `ModelRegistry`. Each model is designed for production inference with GPU/CPU fallback support.

---

## 1. YOLOv8 Object Detector (`detector.py`)

### Purpose
Real-time multi-object detection optimized for forensic-relevant classes (persons, vehicles, items, weapons).

### Architecture
- **Base Model**: YOLOv8 (Ultralytics) with three-tier fallback strategy
  - Primary: `yolov8x` (82M parameters, ~640x640 input)
  - Secondary: `yolov8l` (43M parameters, resource lighter)
  - Tertiary: `yolov8n` (11M parameters, CPU-safe)
  - Fallback: Mock detections (development mode)

### Key Features
- **Auto-device switching**: Detects CUDA/CPU and configures accordingly
- **FP16 inference**: Half-precision on GPU for ~2x speedup
- **torch.compile()**: PyTorch 2+ optimization when available
- **Batch processing**: Process multiple frames in single forward pass
- **Normalized outputs**: Coordinates and confidence in 0-1 range

### Forensic Classes Detected
```
person, car, truck, bus, motorcycle, bicycle,
backpack, laptop, cell phone, knife,
bottle, suitcase, chair
```

### Output Format (per detection)
```python
{
    "label": "person",                          # Class name
    "confidence": 0.87,                         # 0-1 score
    "class_id": 0,                              # COCO class ID
    "bbox": {
        "x": 0.2,                               # Normalized left
        "y": 0.1,                               # Normalized top
        "width": 0.15,                          # Normalized width
        "height": 0.55                          # Normalized height
    },
    "bbox_xyxy": [128.0, 64.0, 224.0, 416.0],  # Pixel corners
    "frame_number": 42,
    "timestamp": 1.4,                           # Seconds
    "track_id": None                            # Filled by tracker
}
```

### Performance (benchmark on RTX 3090)
- YOLOv8x: ~30 FPS @ 640×640 (FP16)
- YOLOv8l: ~60 FPS @ 640×640 (FP16)
- YOLOv8n: ~150 FPS @ 640×640 (FP16)
- CPU fallback: ~3-5 FPS (yolov8n)

### Configuration Parameters
```python
YOLODetector(
    model_key="yolov8x",           # Model size
    confidence_threshold=0.45,      # Detection confidence
    iou_threshold=0.45,            # NMS IoU threshold
    device="auto",                 # "cuda", "cpu", or "auto"
    img_size=640,                  # Input resolution
    fp16=True                       # Half-precision on GPU
)
```

---

## 2. ByteTrack Multi-Object Tracker (`tracker.py`)

### Purpose
Cross-frame identity persistence for detected persons, enabling suspect tracking across video sequences.

### Algorithm
Simple yet effective IoU-based Hungarian-style matching:
1. Match current detections to existing tracks by Intersection-over-Union (IoU)
2. Unmatched detections → spawn new provisional tracks
3. Unmatched tracks → mark for expiration after `max_age` frames
4. Confirmed tracks require `min_hits` consecutive matches

### Track Structure
```python
@dataclass
class Track:
    track_id: int                               # Unique ID (incremental)
    class_label: str                            # Always "person"
    detections: List[Dict]                      # Historical detections
    last_detection_frame: int                   # Frame count reference
    appearance_embedding: Optional[np.ndarray]  # For REID integration
    age: int                                    # Frames since last match
    hits: int                                   # Confirmed detections
    confidence: float                           # Mean detection confidence
```

### Key Features
- **IoU matching**: Detects spatial continuity across frames
- **Provisional tracks**: New tracks must survive `min_hits` frames to be "confirmed"
- **Track expiration**: Tracks are deleted if not detected for `max_age` frames
- **Stateful**: Maintains track dictionary across frame sequences
- **Batch-compatible**: Processes all frame detections in single call

### Configuration Parameters
```python
ByteTracker(
    iou_threshold=0.3,             # IoU threshold for matching
    min_hits=3,                    # Frames to confirm track
    max_age=30,                    # Frames until expiration
    device="cpu"                   # CPU-based (no GPU needed)
)
```

### Output Enhancement
Adds `track_id` to each detection:
```python
{
    ...detector output...,
    "track_id": 5  # Persistent ID across frames, or None for non-persons
}
```

### Performance
- Processing: O(M×N) where M=tracks, N=detections
- Typical: <1ms per frame (CPU)
- CCTV video (25 FPS): <1% CPU overhead

---

## 3. FastReID + CLIP Person Re-ID (`reid.py`)

### Purpose
Compute appearance embeddings for person crops, enabling cross-camera identity matching and gallery-based suspect search.

### Architecture
**Primary**: FastReID ResNet50 (MSMT17 pretrained)
- Output: 512-dimensional embedding vector
- Training data: ~110K images from 1,501 pedestrians (Market-1501 + additional)
- Optimized for: Person appearance in surveillance footage

**Fallback**: OpenAI CLIP ViT-B/32
- Output: 768-dimensional embedding vector
- Universal vision model (not pedestrian-specific)
- Better on novel appearance variations

### Key Features
- **Two-tier loading**: Try FastReID first, fall back to CLIP if unavailable
- **L2 normalization**: Embeddings normalized to unit norm (cosine similarity)
- **Similarity metrics**:
  - Cosine: dot product (for normalized vectors)
  - Euclidean: distance-to-similarity conversion
- **Batch processing**: Extract embeddings from multiple crops in parallel

### Embedding Usage
```python
# Extract embeddings for person crops
embeddings = reid.infer(person_crops)  # Shape: (N, 512)

# Compute similarity
similarity = reid.similarity(emb1, emb2, metric="cosine")  # 0-1 score
```

### Configuration Parameters
```python
FastReIDModule(
    model_key="fastreid_msmt17",    # Model variant
    device="auto",
    embedding_dim=512,               # Adjusted to 768 if using CLIP
    normalize=True                   # L2 normalization
)
```

### Use Cases
1. **Gallery Matching**: Compare query person to known suspect gallery
2. **Clustering**: Group detections from same person across scenes
3. **Cross-Camera Tracking**: Link people across non-overlapping camera views
4. **Anomaly Detection**: Identify unusual appearance patterns

### Performance
- FastReID: ~2-5ms per person crop (GPU), ~50ms (CPU)
- CLIP: ~10-20ms per crop (GPU), ~100ms (CPU)
- Memory: ~2GB (FastReID) or ~3GB (CLIP) on GPU

---

## 4. SAM 2 Instance Segmentation (`segmentor.py`)

### Purpose
Precise pixel-level segmentation masks for detected objects, enabling detailed forensic analysis (object boundaries, partial occlusion handling).

### Architecture
**Segment Anything Model 2** (Meta AI)
- Backbone: Vision Transformer (ViT)
- Output: Binary mask per bounding box
- Two model sizes:
  - Large: ~600M parameters, ~980 MHz
  - Base: ~100M parameters, lighter but acceptable quality

### Inference Modes
1. **Bounding Box Mode** (default): SAM receives bbox → outputs mask
   ```
   Input: [x1, y1, x2, y2] in pixels
   Output: Binary mask (H×W)
   ```
2. **Point Mode** (optional): SAM receives click coordinates
3. **Multi-mask**: Returns multiple mask hypotheses (we use best)

### Key Features
- **Interactive**: Can refine masks with additional prompts
- **Flexible**: Works with any category (not trained on specific classes)
- **Real-time**: ~100-200ms per frame with 5-10 objects
- **Fallback**: Mock masks (solid white) for development

### Output Enhancement
Adds segmentation fields to detections:
```python
{
    ...detection output...,
    "mask": np.ndarray(H, W, dtype=uint8),  # Binary mask
    "mask_area": 5000,                      # Number of foreground pixels
    "mask_iou": 0.92                        # SAM confidence score
}
```

### Configuration Parameters
```python
SAM2Segmentor(
    model_key="sam2_large",         # "sam2_large" or "sam2_base"
    device="auto"
)
```

### Use Cases
1. **Object Isolation**: Extract precise object boundaries
2. **Occlusion Handling**: Detect partial visibility scenarios
3. **Forensic Documentation**: High-quality evidence visualization
4. **Scene Analysis**: Detailed layout and object placement

### Performance
- Large model: ~150-200ms per frame (5 objects, GPU)
- Base model: ~80-100ms per frame (5 objects, GPU)
- CPU: ~1-2 seconds per frame (avoid in real-time)

---

## 5. ModelRegistry - Central Orchestrator (`__init__.py`)

### Purpose
Unified initialization, device management, and inference coordination for all models.

### Initialization Flow
```python
registry = ModelRegistry(device="auto")
startup_results = registry.startup(
    skip_models=["segmentor"],      # Optional: skip expensive models
    progress_cb=lambda pct, msg: print(f"{pct}%: {msg}")
)
```

**Startup Sequence**:
1. Detect GPU availability (CUDA, Apple MPS)
2. Load YOLOv8 detector (largest weights)
3. Load SAM2 segmentor (if not skipped)
4. Load ByteTracker (instantiation only)
5. Load FastReID/CLIP ReID model
6. Print device info (GPU name, VRAM)

### Unified Inference Interface
```python
# Single-frame inference with all models
results = registry.infer_batch(
    frames=[frame1, frame2],        # List of BGR images
    detections_only=False,          # Include segmentation?
    track=True,                     # Enable tracking?
    compute_reid=True               # Extract person embeddings?
)
```

### Output Structure
```python
{
    "frames": [frame1, frame2],
    "detections": [                 # Per-frame
        [                           # Frame 1
            {
                "label": "person",
                "confidence": 0.92,
                "bbox": {...},
                "track_id": 1,
                "mask": np.ndarray,         # If segmentation enabled
                "embeddings": np.ndarray    # If ReID enabled
            },
            ...
        ],
        [                           # Frame 2
            ...
        ]
    ],
    "tracks": {
        1: <Track object>,          # Active tracks only
        2: <Track object>
    },
    "inference_time_ms": 42.5
}
```

### Device Management
```
Auto-detection priority:
1. CUDA (NVIDIA GPU) → use FP16 + torch.compile
2. MPS (Apple Silicon) → use FP32
3. CPU (fallback) → use FP32, reduce batch size

Users can override: ModelRegistry(device="cpu")
```

### Batch Processing
- Detector: Native batch support (all frames together)
- Segmentor: Per-frame (SAM2 slower, process sequentially)
- ReID: Batch extraction (extract all person crops, then embed)
- Tracker: Sequential (stateful, frame-by-frame)

### Error Handling
- Graceful degradation: Failed models don't crash pipeline
- Partial inference: Can run detector-only or detector+tracker
- Fallback modes: Mock outputs for development/testing
- Logging: Comprehensive INFO/WARNING/ERROR logs

### Configuration Example
```python
from ai.models import ModelRegistry

# Initialize with auto-detected device
registry = ModelRegistry()

# Custom startup: skip expensive segmentation for speed
loaded = registry.startup(skip_models=["segmentor"])
print(f"Loaded models: {loaded}")

# Run inference on video frames
for frame in video_frames:
    results = registry.infer_batch(
        frames=[frame],
        detections_only=False,  # Include masks
        track=True,             # Update tracking
        compute_reid=True       # Get embeddings
    )
    
    # Process results
    for detection in results["detections"][0]:
        if detection["label"] == "person":
            track_id = detection["track_id"]
            embedding = detection.get("embeddings")
            mask = detection.get("mask")
            # ... forensic analysis
```

---

## Performance Summary

| Model | Device | Speed | Memory | Quality |
|-------|--------|-------|--------|---------|
| YOLOv8x | GPU | 30 FPS | 6 GB | Excellent |
| YOLOv8x | CPU | 3-5 FPS | 2 GB | Excellent |
| ByteTracker | CPU | <1ms/frame | 50 MB | Good |
| FastReID | GPU | 2-5ms/crop | 2 GB | Excellent |
| FastReID | CPU | 50ms/crop | 2 GB | Excellent |
| SAM2 Large | GPU | 150-200ms/frame | 4 GB | Excellent |
| SAM2 Large | CPU | 1-2s/frame | 4 GB | Excellent |

---

## Integration with Backend

### API Routes (`backend/app/api/routes/ai.py`)
- `POST /api/ai/detect` - Run detection on video/image
- `POST /api/ai/track` - Get tracking results
- `POST /api/ai/search` - Search person gallery by ReID embedding
- `POST /api/ai/segment` - Get segmentation masks

### Celery Tasks (`backend/app/tasks/video_processing.py`)
- Async video processing pipeline
- Frame extraction → detection → tracking → ReID
- Result caching and report generation

### Dataset Integration
- Inference pipeline validates against COCO, MOT17, Market-1501
- EDA tools provide visual quality checks
- Benchmark evaluator measures performance on standard datasets

---

## Development Notes

### Testing
Unit tests available in `ai/tests/`:
- `test_inference_pipeline.py` - Full pipeline integration
- Model loading validation
- Output format verification
- Device switching tests

### Configuration
All models respect environment variables:
```bash
PANOPTICON_DEVICE=cuda           # Override device
PANOPTICON_BATCH_SIZE=16         # Detector batch size
PANOPTICON_FP16=1                # Force FP16 precision
PANOPTICON_SKIP_MODELS=segmentor # Skip expensive models
```

### Future Extensions
- **Fine-tuning**: BaseModel.train() stub for custom training
- **Quantization**: ONNX export for edge deployment
- **Ensemble**: Multi-model voting for improved accuracy
- **Real-time Streaming**: WebSocket support for live feed analysis

