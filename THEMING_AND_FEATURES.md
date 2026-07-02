# PANOPTICON UI/UX Enhancements

## Theme System

PANOPTICON now supports 4 professional themes optimized for different investigation contexts:

### 1. **Dark Mode** (Default)
- Professional cyan accents (`#00b4d8`)
- High contrast for standard operations
- Reduced eye strain during extended use
- **Best for:** Regular investigations, office environments

### 2. **Light Mode**
- Clean, professional light interface
- Cyan accents (`#0891b2`)
- High visibility for outdoor/bright environments
- **Best for:** Daytime operations, presentations

### 3. **Serious Mode** 🚨
- **CRITICAL CASE** indicator mode
- Deep red accents (`#dc2626`) with warning tones
- Emphasizes urgency and high-priority cases
- Pulsing status indicators
- **Best for:** Active crime scenes, critical investigations, time-sensitive cases

**Usage:** Switch to Serious Mode when handling:
- Active crime scenes
- Homicide investigations
- Time-critical cases
- High-priority suspects

### 4. **High Contrast Mode** ⚡
- Maximum contrast (black/bright green)
- WCAG AAA compliance
- Accessibility-focused design
- **Best for:** Accessibility requirements, low-vision operators

### Switching Themes

Theme switcher is located in the header (top-right). Click the theme icon and select your preferred mode:

```
🌙 Dark Mode
☀️ Light Mode  
🚨 Serious Mode
⚡ High Contrast
```

Themes persist across sessions via browser localStorage.

---

## Real Media Search Integration

PANOPTICON integrates with live public databases for evidence discovery:

### Image Search
- **Source:** Pexels API (high-quality stock images)
- **Use case:** Reference materials for scene reconstruction, suspect profiles
- **Features:**
  - Keyword search ("crime scene", "weapons", "evidence")
  - Photographer attribution
  - Free license verification

### Video Search
- **Source:** Pixabay API (free surveillance-style footage)
- **Use case:** CCTV reference footage, timeline analysis
- **Features:**
  - Duration display
  - Preview thumbnails
  - Direct download links

### How to Use

1. Go to **Evidence** tab
2. Select **"Search Database"**
3. Enter search query (e.g., "interior crime scene", "suspect apprehension")
4. Choose media type: **All** / **Images** / **Videos**
5. Click search icon or press Enter
6. Click on result to add to case evidence library

#### Recommended Search Queries

**For Scene Reconstruction:**
- "crime scene interior photographed"
- "forensic evidence markers"
- "investigation scene layout"

**For Suspect Profiling:**
- "suspect apprehension tactics"
- "crowd control evidence"
- "surveillance footage quality"

**For Training:**
- "forensic scene photography"
- "evidence collection procedures"
- "chain of custody photography"

---

## 3D Crime Scene Reconstruction (Enhanced)

The Scene3DEnhanced component provides advanced visualization:

### Features

#### Visualization
- Real-time 3D rendering with Three.js
- Dynamic lighting with multiple light sources
- Realistic material properties and shadows
- Grid floor for spatial reference
- Camera frustum visualization for multi-camera setups

#### Evidence Markers
Four marker types with distinct visualizations:

1. **Generic Markers** (Cyan octahedron)
   - General evidence points
   - Click to view details

2. **Suspect Markers** (Orange rotating sphere)
   - Animated rotation to draw attention
   - Confidence percentage display
   - Cross-camera tracking support

3. **Weapon Markers** (Red pulsing cone)
   - Pulsing animation for urgency
   - Automated detection confidence
   - Chain of evidence tracking

4. **Evidence Markers** (Green cube)
   - Static positioning
   - Multiple views supported
   - Metadata popup on selection

#### Performance Features
- Hardware acceleration via WebGL
- Optimized shadow mapping
- Frame rate monitoring (Debug mode)
- Dynamic LOD (Level of Detail)
- Anti-aliasing and post-processing

#### Debug Mode
Click the eye icon in the top-right to toggle debug panel showing:
- Current FPS
- Triangle count
- Active marker count
- Scene statistics

#### Scene Interaction
- **Auto-rotate:** Scene rotates slowly for passive viewing
- **Click markers:** Select to view evidence details
- **Download:** Screenshot current view as PNG
- **Full-screen:** Maximize scene for detail analysis

---

## UI Components

### MediaSearchPanel
Dedicated media search component with:
- Real-time search across multiple APIs
- Filter by media type
- Thumbnail previews
- Attribution tracking
- External link support

### Scene3DEnhanced
Advanced 3D visualization with:
- Multiple evidence types
- Interactive markers
- Performance monitoring
- Export capabilities

### ThemeSwitcher
Global theme selector with:
- Four theme options
- Persistent selection
- Visual theme preview

### EvidenceLibrary
Unified evidence management:
- Local file upload
- Real-time search integration
- Status tracking
- Drag-and-drop support (future)

---

## Configuration

### Environment Variables

```env
# Frontend theme (can be overridden by user)
NEXT_PUBLIC_DEFAULT_THEME=dark

# Media search API keys (optional)
PEXELS_API_KEY=<your-key>
PIXABAY_API_KEY=<your-key>
```

### Theme Configuration

Themes are defined in `/src/lib/theme.ts`:

```typescript
export const THEMES: ThemeConfig[] = [
  {
    id: 'dark',
    name: 'Dark',
    description: 'Professional dark mode...',
    icon: '🌙',
  },
  // ...
];
```

CSS variables for each theme are in `globals.css`:

```css
:root, [data-theme="dark"] {
  --bg-base: #03050d;
  --accent: #00b4d8;
  /* ... */
}

[data-theme="serious"] {
  --bg-base: #0f0203;
  --accent: #dc2626;
  /* ... */
}
```

---

## Implementation Details

### Theme Persistence
- Stored in `localStorage` as `panopticon-theme`
- Auto-loads on app startup
- Falls back to `dark` if not set

### Media Search Architecture
- Service layer: `/src/lib/media-search.ts`
- No backend required (client-side APIs)
- Error handling and fallbacks
- Rate limiting considerations

### 3D Scene Architecture
- Three.js renderer in container
- Automatic resize handling
- Efficient memory management
- Click detection with Raycaster

---

## Future Enhancements

### Planned Features
- [ ] Custom theme builder
- [ ] Color-blind-friendly modes
- [ ] Real-time collaborative 3D marking
- [ ] Volumetric lighting effects
- [ ] Point cloud integration for 3D scans
- [ ] Advanced physics-based marker interactions
- [ ] Scene timeline playback with marker animation
- [ ] Multi-camera synchronized viewing
- [ ] AR integration for mobile investigations
- [ ] PDF export with scene snapshots

### Performance Optimizations
- [ ] Occlusion culling for complex scenes
- [ ] Scene graph optimization
- [ ] Geometry instancing for repeated markers
- [ ] Worker thread processing
- [ ] Progressive image loading

---

## Accessibility

### WCAG Compliance
- High Contrast mode meets WCAG AAA
- Keyboard navigation throughout
- ARIA labels on interactive elements
- Screen reader support

### Accessibility Features
- Color-blind friendly palettes
- High-contrast mode toggle
- Keyboard shortcuts (CMD+K for search)
- Focus indicators on all inputs

---

## Troubleshooting

### Theme Not Persisting
- Check browser localStorage is enabled
- Clear browser cache and try again
- Check `localStorage.getItem('panopticon-theme')`

### Media Search Returning No Results
- Try simpler search terms
- Check internet connection
- Verify API limits not exceeded
- Check browser console for CORS errors

### 3D Scene Performance Issues
- Reduce marker count
- Disable auto-rotate
- Disable lighting effects
- Check GPU drivers up-to-date
- Try High Contrast theme (simpler rendering)

### Missing Images/Videos in Library
- Refresh browser
- Check evidence upload status
- Verify file formats supported
- Check disk space for uploads

---

## API Reference

### Theme Functions (`/src/lib/theme.ts`)

```typescript
// Get current theme
getTheme(): Theme

// Set new theme
setTheme(theme: Theme): void

// Initialize theme on app load
initializeTheme(): void

// List all available themes
THEMES: ThemeConfig[]
```

### Media Search (`/src/lib/media-search.ts`)

```typescript
// Search forensic images
searchForensicImages(query: string, limit?: number): Promise<MediaSearchResult[]>

// Search forensic videos
searchForensicVideos(query: string, limit?: number): Promise<MediaSearchResult[]>

// Combined search
searchComprehensiveEvidence(query: string): Promise<{
  images: MediaSearchResult[]
  videos: MediaSearchResult[]
}>

// Scene reference images
searchSceneReferences(sceneType: string): Promise<MediaSearchResult[]>
```

### Component Props

#### Scene3DEnhanced

```typescript
interface Scene3DEnhancedProps {
  evidenceMarkers?: Evidence3D[]
  cameraCount?: number
  onMarkerSelect?: (marker: Evidence3D) => void
  showGrid?: boolean
  showLights?: boolean
  autoRotate?: boolean
}

interface Evidence3D {
  id: string
  position: [number, number, number]
  type: 'marker' | 'suspect' | 'weapon' | 'evidence'
  label: string
  color?: string
  confidence?: number
  timestamp?: string
}
```

#### MediaSearchPanel

```typescript
interface MediaSearchPanelProps {
  onSelectMedia?: (media: MediaSearchResult) => void
  initialQuery?: string
}
```

#### EvidenceLibrary

```typescript
interface EvidenceLibraryProps {
  caseId?: string
  onSelectEvidence?: (evidence: EvidenceItem) => void
}
```

---

## Support & Documentation

For issues or feature requests:
1. Check this documentation
2. Review code comments in `/src/lib/theme.ts`
3. Check component JSDoc comments
4. Review console errors in browser DevTools

---

**Last Updated:** 2026-07-02
**Version:** 1.1.0
