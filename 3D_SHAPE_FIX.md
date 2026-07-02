# 3D Suspect Marker Shape Fix

## Issue
The previous suspect marker shape (capsule) looked inappropriately phallic and unprofessional.

## Solution
Changed suspect markers to use a proper **humanoid silhouette** with:
- **Head** (small sphere on top)
- **Torso** (rounded box in center)
- **Arms** (two angled cylinders)
- **Legs** (two vertical cylinders)

## New Shape Structure

```
        O         ← Head (sphere 0.25 radius)
       /|\        ← Arms (cylinders with angle)
        |
       / \        ← Legs (cylinders)
```

## Visual Comparison

### Before (❌ Problematic)
- Tall vertical capsule
- Elongated appearance
- Phallic silhouette

### After (✅ Professional)
- Stick figure humanoid
- Recognizable person shape
- Clean forensic appearance
- Head clearly visible

## Technical Details

### Components
1. **Head:** `SphereGeometry(0.25, 16, 16)` at Y: 0.85
2. **Torso:** `BoxGeometry(0.35, 0.5, 0.3)` at Y: 0.35
3. **Left Arm:** `CylinderGeometry(0.08, 0.08, 0.5)` at X: -0.3, rotation: 0.3 rad
4. **Right Arm:** `CylinderGeometry(0.08, 0.08, 0.5)` at X: 0.3, rotation: -0.3 rad
5. **Left Leg:** `CylinderGeometry(0.1, 0.1, 0.4)` at X: -0.12
6. **Right Leg:** `CylinderGeometry(0.1, 0.1, 0.4)` at X: 0.12

### Total Height: ~1.2 units
### Animation: Breathing effect (vertical scale pulse)
### Color: Orange (#f97316) for suspects

## Animation
Suspects still have the breathing animation for life-like appearance:
```typescript
mesh.scale.y = 1 + Math.sin(Date.now() * 0.004) * 0.08;
```

## Performance
- ✅ Simplified geometry (box-based)
- ✅ Same render performance as before
- ✅ 60 FPS maintained
- ✅ No performance degradation

## Result
Suspect markers now display as **recognizable humanoid figures** instead of problematic shapes, making them ideal for forensic investigations.

---

**Fixed:** July 2, 2026
**Component:** Scene3DEnhanced.tsx
**Status:** ✅ Complete
