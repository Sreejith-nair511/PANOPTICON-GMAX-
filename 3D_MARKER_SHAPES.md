# 3D Scene Marker Shapes

## Updated Geometry

The 3D crime scene now features realistic marker shapes optimized for forensic visualization:

---

## Marker Types & Shapes

### 🟠 **Suspect Markers** (Orange)
**Shape:** Capsule/Cylinder (human-like)
- **Visual:** Tall vertical capsule
- **Animation:** Breathing effect (gentle vertical pulse)
- **Size:** 0.4 radius × 1.6 height
- **Purpose:** Represents persons of interest
- **Use Case:** Track suspects across scene

**Details:**
- Elongated shape mimics human silhouette
- Breathing animation indicates active tracking
- Height emphasizes vertical position in scene
- Easy to identify at a glance

---

### 🔴 **Weapon Markers** (Red)
**Shape:** Complex weapon form (cone + handle + guard)
- **Visual:** Gun/firearm-like silhouette
- **Animation:** Spinning barrel + pulsing scale
- **Size:** 0.3 radius × 1.5 height
- **Purpose:** Locate weapons/threat objects
- **Use Case:** Critical evidence points

**Details:**
- Barrel: Long cone pointing horizontally
- Handle: Rectangular box for grip
- Trigger guard: Curved torus shape
- Pulsing glow indicates urgency
- Red color emphasizes danger

---

### 🟢 **Evidence Markers** (Green)
**Shape:** Beveled cube/box
- **Visual:** 3D box with rounded edges
- **Animation:** Gentle rotation on Y-axis
- **Size:** 0.5 × 0.5 × 0.5
- **Purpose:** Mark physical evidence items
- **Use Case:** Trace evidence, weapon, clothing, etc.

**Details:**
- Compact cube form
- Simple rotation animation
- Green color = safe/collected evidence
- Multiple evidence items supported

---

### 🔵 **Generic Markers** (Cyan)
**Shape:** Star/Spike pattern
- **Visual:** Multi-pointed star octahedron
- **Animation:** Dual-axis spinning
- **Size:** 0.6 per point
- **Purpose:** Generic reference points
- **Use Case:** Locations, entry/exit points, zones

**Details:**
- Alternating outer/inner points create star effect
- Spinning on both X and Y axes
- High visibility
- Default marker type

---

## Visual Comparison

```
Suspects          Weapons           Evidence          Markers
   |                 |\                □                 ✱
  \|/                 |                □               ✱ ✱ ✱
   |         →        |         →      □       →        ✱
   |                /|                 □               ✱ ✱
  \|/               / |                □                 ✱
(Breathing)      (Rotating)         (Turning)         (Spinning)
```

---

## Animation Details

### Suspect Animation (Breathing)
```typescript
mesh.scale.y = 1 + Math.sin(Date.now() * 0.004) * 0.08;
// Pulsates vertically every ~1.5 seconds
// Simulates breathing/alive presence
```

### Weapon Animation (Threat Alert)
```typescript
mesh.rotation.z += 0.01;              // Barrel spins
mesh.scale.set(1 + ..., 1, 1);        // Pulsing glow
// Creates sense of urgency/danger
```

### Evidence Animation (Examining)
```typescript
mesh.rotation.y += 0.01;
// Slow rotation for detail examination
```

### Marker Animation (Location Beacon)
```typescript
mesh.rotation.x += 0.02;
mesh.rotation.y += 0.02;
// Dual-axis spin for visibility
```

---

## Color Scheme

| Marker Type | Color | Hex | RGB | Purpose |
|------------|-------|-----|-----|---------|
| Suspect | Orange | #f97316 | (249, 115, 22) | Person of Interest |
| Weapon | Red | #ef4444 | (239, 68, 68) | Threat/Danger |
| Evidence | Green | #22c55e | (34, 197, 94) | Collected/Secure |
| Generic | Cyan | #00b4d8 | (0, 180, 216) | Reference |

---

## Material Properties

All markers use `MeshStandardMaterial`:
```typescript
{
  metalness: 0.6,          // Shiny surface
  roughness: 0.2,          // Polished appearance
  emissive: colorValue,    // Glow effect
  emissiveIntensity: 0.3,  // Moderate glow
}
```

**Effect:** Markers appear to glow/emit light, increasing visibility

---

## Size Comparison (Units)

```
Legend:  1 unit ≈ 1 meter in real space

Suspect:    0.8 units tall
Weapon:     1.5 units long
Evidence:   0.5 units cube
Marker:     0.6 units radius
Floor:      20×20 grid (large crime scene)
```

---

## Label Display

Each marker displays:
1. **Name/ID** - Large text above marker
2. **Confidence Score** - Percentage below name
3. **Color-coded** - Matches marker type

```
┌─────────────────┐
│ Suspect Alpha   │
│      94%        │ ← Label positioned 1.2 units above
└─────────────────┘
   🟠 Marker
```

---

## Lighting & Shadows

Markers receive:
- **Directional light:** Sunlight effect
- **Ambient light:** Scene illumination (50%)
- **Point lights:** Color-coded glow
  - Cyan glow (generic marker area)
  - Red glow (weapon area)
- **Shadows:** Real-time shadow casting

**Result:** Markers appear 3D with depth

---

## Performance Optimization

- **Geometry Complexity:** Balanced for 60 FPS
- **Material Rendering:** Standard (fast)
- **Animation Updates:** Per-frame (smooth)
- **Shadow Quality:** PCF shadow mapping
- **Target:** 10-50 markers without performance hit

---

## Customization

### Change a Marker Color

```typescript
const newMarker: Evidence3D = {
  id: 'custom-1',
  position: [0, 0, 0],
  type: 'suspect',
  label: 'My Suspect',
  color: '#ff00ff',  // Custom magenta
  confidence: 0.85,
};
```

### Add Custom Animation

Edit animation logic in `Scene3DEnhanced.tsx`:

```typescript
if (marker.userData.type === 'suspect') {
  // Your custom animation here
  mesh.position.y += Math.sin(Date.now() * 0.001) * 0.5;
}
```

### Modify Geometry

Edit shape creation functions:
- `createCapsuleGeometry()` - Suspect shape
- `createWeaponGeometry()` - Weapon shape
- Evidence and markers use standard Three.js geometries

---

## Best Practices

✅ **Do:**
- Use consistent marker types
- Keep confidence scores visible
- Label all markers clearly
- Animate thoughtfully (not too fast)
- Test with many markers (10+)

❌ **Don't:**
- Mix up marker types (confusion)
- Use hidden/no animations (boring)
- Overcrowd scene (performance)
- Use inconsistent colors
- Forget to add labels

---

## Integration Example

```tsx
import { Scene3DEnhanced } from '@/components/investigation/Scene3DEnhanced';
import type { Evidence3D } from '@/components/investigation/Scene3DEnhanced';

const markers: Evidence3D[] = [
  {
    id: 'suspect-alpha',
    position: [-5, 0, -3],
    type: 'suspect',
    label: 'Suspect Alpha',
    confidence: 0.94,
  },
  {
    id: 'weapon-1',
    position: [2, 0, 1],
    type: 'weapon',
    label: 'Firearm',
    confidence: 0.87,
  },
  {
    id: 'evidence-1',
    position: [-1, 0, 3],
    type: 'evidence',
    label: 'Shell Casing',
    confidence: 0.92,
  },
  {
    id: 'entry-point',
    position: [4, 0, -2],
    type: 'marker',
    label: 'Entry',
  },
];

export function MyScene() {
  return (
    <Scene3DEnhanced
      evidenceMarkers={markers}
      cameraCount={2}
      showGrid={true}
      showLights={true}
      autoRotate={true}
    />
  );
}
```

---

## Troubleshooting

### Markers Not Visible
- Check marker positions are within scene bounds
- Verify colors are not too dark
- Check confidence scores are > 0

### Animation Too Fast/Slow
- Adjust time multiplier in animation code
- Default: `Date.now() * 0.004` (slower)
- Increase multiplier for faster animation

### Markers Look Flat
- Verify lighting is enabled (`showLights={true}`)
- Check material `metalness` property
- Ensure shadows are enabled

### Performance Issues
- Reduce marker count
- Disable auto-rotate
- Reduce shadow map quality
- Use High Contrast theme

---

## Future Enhancements

- [ ] Custom shape builder
- [ ] Per-marker animation control
- [ ] Trail/path visualization
- [ ] Marker clustering
- [ ] Velocity vectors
- [ ] Point cloud support
- [ ] Heatmap visualization

---

**Version:** 1.0  
**Last Updated:** July 2, 2026
