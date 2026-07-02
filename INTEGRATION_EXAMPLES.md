# Integration Examples - How to Use New Components

## 1. Adding Theme Switcher to Your Pages

### Current Location
The ThemeSwitcher is already integrated into the main Header component at:
- `/src/components/layout/Header.tsx`

It appears in the top-right corner and is visible on all pages.

### If You Want to Add It Elsewhere

```tsx
// Any page or component
import { ThemeSwitcher } from '@/components/theme/ThemeSwitcher';

export function MyPage() {
  return (
    <div>
      <div className="flex justify-between items-center">
        <h1>My Page</h1>
        <ThemeSwitcher />
      </div>
    </div>
  );
}
```

---

## 2. Integrating Media Search into Evidence Page

### Complete Example

**File:** `/src/app/(app)/evidence/page.tsx`

```tsx
'use client';

import { useState } from 'react';
import { EvidenceLibrary } from '@/components/evidence/EvidenceLibrary';
import type { MediaSearchResult } from '@/lib/media-search';

interface EvidenceItem {
  id: string;
  type: 'image' | 'video';
  title: string;
  size: number;
  uploadedAt: Date;
  status: 'processing' | 'ready' | 'analyzed';
  caseId: string;
  url: string;
}

export default function EvidencePage() {
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceItem | null>(null);

  const handleEvidenceSelect = (evidence: EvidenceItem) => {
    setSelectedEvidence(evidence);
    console.log('Selected evidence:', evidence);
    
    // TODO: Update case with selected evidence
    // TODO: Trigger AI processing
    // TODO: Update 3D scene markers
  };

  return (
    <div className="h-full flex flex-col gap-4 p-6">
      <div>
        <h1 className="text-2xl font-bold text-var(--text-primary)">Evidence Management</h1>
        <p className="text-var(--text-secondary)">Upload or search for case evidence</p>
      </div>

      <div className="flex-1 grid grid-cols-3 gap-4">
        {/* Main evidence library */}
        <div className="col-span-2">
          <EvidenceLibrary
            caseId="case-001"
            onSelectEvidence={handleEvidenceSelect}
          />
        </div>

        {/* Selected evidence details */}
        {selectedEvidence && (
          <div className="p-4 rounded-lg bg-var(--bg-surface) border border-var(--border)">
            <h3 className="font-semibold text-var(--text-primary) mb-4">
              Selected Evidence
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-var(--text-dim)">File</p>
                <p className="text-var(--text-primary)">{selectedEvidence.title}</p>
              </div>
              <div>
                <p className="text-var(--text-dim)">Type</p>
                <p className="text-var(--text-primary)">
                  {selectedEvidence.type === 'video' ? '🎬 Video' : '🖼️ Image'}
                </p>
              </div>
              <div>
                <p className="text-var(--text-dim)">Size</p>
                <p className="text-var(--text-primary)">
                  {selectedEvidence.size.toFixed(1)} MB
                </p>
              </div>
              <div>
                <p className="text-var(--text-dim)">Status</p>
                <p className="text-var(--accent)">{selectedEvidence.status}</p>
              </div>
              <button className="w-full mt-4 px-4 py-2 bg-var(--accent) hover:bg-var(--accent-bright) text-white rounded-lg transition-colors">
                Analyze Evidence
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## 3. Adding 3D Crime Scene to Investigation Page

### Complete Example

**File:** `/src/app/(app)/investigation/page.tsx`

```tsx
'use client';

import { useState, useCallback } from 'react';
import { Scene3DEnhanced } from '@/components/investigation/Scene3DEnhanced';
import type { Evidence3D } from '@/components/investigation/Scene3DEnhanced';
import { Settings2, Maximize2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function InvestigationPage() {
  // Sample evidence markers for the scene
  const [markers, setMarkers] = useState<Evidence3D[]>([
    {
      id: 'suspect-1',
      position: [-5, 0, -3],
      type: 'suspect',
      label: 'Suspect Alpha',
      color: '#f97316',
      confidence: 0.94,
      timestamp: '14:23:45',
    },
    {
      id: 'weapon-1',
      position: [2, 0, 1],
      type: 'weapon',
      label: 'Weapon (Gun)',
      color: '#ef4444',
      confidence: 0.87,
      timestamp: '14:24:12',
    },
    {
      id: 'evidence-1',
      position: [-1, 0, 3],
      type: 'evidence',
      label: 'Shell Casing',
      color: '#22c55e',
      confidence: 0.92,
      timestamp: '14:24:30',
    },
    {
      id: 'marker-1',
      position: [4, 0, -2],
      type: 'marker',
      label: 'Point of Entry',
      color: '#00b4d8',
      confidence: 1.0,
    },
  ]);

  const [selectedMarker, setSelectedMarker] = useState<Evidence3D | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const handleMarkerSelect = useCallback((marker: Evidence3D) => {
    setSelectedMarker(marker);
    console.log('Marker selected:', marker);
    
    // TODO: Update timeline
    // TODO: Show evidence details
    // TODO: Highlight related case files
  }, []);

  const addMarker = (type: Evidence3D['type']) => {
    const newMarker: Evidence3D = {
      id: `${type}-${Date.now()}`,
      position: [Math.random() * 10 - 5, 0, Math.random() * 10 - 5],
      type,
      label: `New ${type}`,
      color: type === 'suspect' ? '#f97316' : type === 'weapon' ? '#ef4444' : '#22c55e',
      confidence: 0.5,
    };
    setMarkers([...markers, newMarker]);
  };

  return (
    <div className="h-full flex flex-col gap-4 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-var(--text-primary)">
            Crime Scene Investigation
          </h1>
          <p className="text-var(--text-secondary)">
            Interactive 3D reconstruction with multi-camera evidence
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="px-4 py-2 rounded-lg border border-var(--border) hover:bg-var(--bg-overlay) transition-colors flex items-center gap-2"
          >
            <Settings2 className="w-4 h-4" />
            Settings
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-4 gap-4 min-h-0">
        {/* 3D Scene - 3 columns */}
        <div className="col-span-3 flex flex-col gap-4">
          <Scene3DEnhanced
            evidenceMarkers={markers}
            cameraCount={2}
            onMarkerSelect={handleMarkerSelect}
            showGrid={true}
            showLights={true}
            autoRotate={true}
          />
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4">
          {/* Marker Controls */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-lg bg-var(--bg-surface) border border-var(--border) space-y-3"
          >
            <h3 className="font-semibold text-var(--text-primary)">Add Markers</h3>
            <div className="space-y-2">
              <button
                onClick={() => addMarker('suspect')}
                className="w-full px-3 py-2 bg-var(--warning)/10 border border-var(--warning)/25 hover:bg-var(--warning)/20 text-var(--warning) rounded-lg text-sm font-medium transition-colors"
              >
                🟠 Add Suspect
              </button>
              <button
                onClick={() => addMarker('weapon')}
                className="w-full px-3 py-2 bg-var(--danger)/10 border border-var(--danger)/25 hover:bg-var(--danger)/20 text-var(--danger) rounded-lg text-sm font-medium transition-colors"
              >
                🔴 Add Weapon
              </button>
              <button
                onClick={() => addMarker('evidence')}
                className="w-full px-3 py-2 bg-var(--success)/10 border border-var(--success)/25 hover:bg-var(--success)/20 text-var(--success) rounded-lg text-sm font-medium transition-colors"
              >
                🟢 Add Evidence
              </button>
              <button
                onClick={() => addMarker('marker')}
                className="w-full px-3 py-2 bg-var(--accent)/10 border border-var(--accent)/25 hover:bg-var(--accent)/20 text-var(--accent) rounded-lg text-sm font-medium transition-colors"
              >
                🔵 Add Marker
              </button>
            </div>
          </motion.div>

          {/* Selected Marker Details */}
          {selectedMarker && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-lg bg-var(--bg-overlay) border border-var(--accent)/25 space-y-3"
            >
              <h3 className="font-semibold text-var(--text-primary)">
                {selectedMarker.label}
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <p className="text-var(--text-dim)">Type</p>
                  <p className="text-var(--text-primary) capitalize">
                    {selectedMarker.type}
                  </p>
                </div>
                {selectedMarker.confidence && (
                  <div>
                    <p className="text-var(--text-dim)">Confidence</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-var(--bg-base) rounded-full overflow-hidden">
                        <div
                          className="h-full bg-var(--accent)"
                          style={{ width: `${selectedMarker.confidence * 100}%` }}
                        />
                      </div>
                      <p className="text-var(--text-primary) font-mono">
                        {Math.round(selectedMarker.confidence * 100)}%
                      </p>
                    </div>
                  </div>
                )}
                {selectedMarker.timestamp && (
                  <div>
                    <p className="text-var(--text-dim)">Time</p>
                    <p className="text-var(--text-primary) font-mono">
                      {selectedMarker.timestamp}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-var(--text-dim)">Position</p>
                  <p className="text-var(--text-primary) font-mono text-xs">
                    X: {selectedMarker.position[0].toFixed(1)}, Y:{' '}
                    {selectedMarker.position[1].toFixed(1)}, Z:{' '}
                    {selectedMarker.position[2].toFixed(1)}
                  </p>
                </div>
              </div>
              <button className="w-full px-3 py-2 bg-var(--accent) hover:bg-var(--accent-bright) text-white rounded-lg text-sm font-medium transition-colors">
                View Evidence Details
              </button>
            </motion.div>
          )}

          {/* Marker List */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-lg bg-var(--bg-surface) border border-var(--border) overflow-y-auto flex-1"
          >
            <h3 className="font-semibold text-var(--text-primary) mb-3">
              Scene Objects ({markers.length})
            </h3>
            <div className="space-y-2">
              {markers.map((marker) => (
                <button
                  key={marker.id}
                  onClick={() => handleMarkerSelect(marker)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-all ${
                    selectedMarker?.id === marker.id
                      ? 'bg-var(--accent)/20 border border-var(--accent) text-var(--accent)'
                      : 'border border-var(--border) text-var(--text-secondary) hover:bg-var(--bg-overlay)'
                  }`}
                >
                  <p className="text-sm font-medium truncate">{marker.label}</p>
                  <p className="text-xs opacity-60 capitalize">{marker.type}</p>
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="p-4 rounded-lg bg-var(--bg-overlay) border border-var(--border) grid grid-cols-4 gap-4 text-sm"
        >
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" defaultChecked className="rounded" />
            <span>Show Grid</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" defaultChecked className="rounded" />
            <span>Show Lights</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" defaultChecked className="rounded" />
            <span>Auto-Rotate</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="rounded" />
            <span>Debug Mode</span>
          </label>
        </motion.div>
      )}
    </div>
  );
}
```

---

## 4. Using Media Search in a Custom Component

```tsx
'use client';

import { useCallback, useState } from 'react';
import { MediaSearchPanel } from '@/components/evidence/MediaSearchPanel';
import type { MediaSearchResult } from '@/lib/media-search';

export function CustomMediaViewer() {
  const [selectedMedia, setSelectedMedia] = useState<MediaSearchResult | null>(null);

  const handleMediaSelect = useCallback((media: MediaSearchResult) => {
    setSelectedMedia(media);
    console.log('Media selected:', media);
    
    // Do something with the media
    // e.g., display in image viewer, add to evidence, etc.
  }, []);

  return (
    <div className="grid grid-cols-3 gap-4 h-full">
      <div className="col-span-2">
        <MediaSearchPanel 
          onSelectMedia={handleMediaSelect}
          initialQuery="suspect identification evidence"
        />
      </div>
      
      {selectedMedia && (
        <div className="p-4 rounded-lg bg-var(--bg-surface) border border-var(--border)">
          <h3 className="font-bold mb-4">{selectedMedia.title}</h3>
          
          {selectedMedia.type === 'image' ? (
            <img 
              src={selectedMedia.url} 
              alt={selectedMedia.title}
              className="w-full rounded-lg mb-4"
            />
          ) : (
            <video 
              src={selectedMedia.url}
              controls
              className="w-full rounded-lg mb-4"
            />
          )}
          
          <div className="space-y-2 text-sm">
            <p className="text-var(--text-secondary)">{selectedMedia.credit}</p>
            <p className="text-var(--text-dim)">{selectedMedia.license}</p>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## 5. Programmatic Theme Switching

```tsx
'use client';

import { setTheme, THEMES } from '@/lib/theme';
import { Button } from '@/components/ui/button';

export function ThemeControls() {
  return (
    <div className="flex gap-2">
      {THEMES.map((theme) => (
        <Button
          key={theme.id}
          onClick={() => setTheme(theme.id)}
          variant="outline"
        >
          {theme.icon} {theme.name}
        </Button>
      ))}
    </div>
  );
}
```

### Auto-Switch to Serious Mode for Critical Cases

```tsx
import { setTheme } from '@/lib/theme';

// When case severity is updated
if (case.severity === 'critical') {
  setTheme('serious');
} else {
  setTheme('dark');
}
```

---

## 6. Real-Time Evidence Updates

```tsx
'use client';

import { useEffect, useState } from 'react';
import { Scene3DEnhanced } from '@/components/investigation/Scene3DEnhanced';
import type { Evidence3D } from '@/components/investigation/Scene3DEnhanced';

export function RealtimeInvestigation({ caseId }: { caseId: string }) {
  const [markers, setMarkers] = useState<Evidence3D[]>([]);

  useEffect(() => {
    // Simulate real-time evidence updates
    const interval = setInterval(async () => {
      // Fetch latest evidence from API
      const response = await fetch(`/api/cases/${caseId}/evidence`);
      const evidence = await response.json();

      // Convert to 3D markers
      const newMarkers = evidence.map((e: any) => ({
        id: e.id,
        position: e.position || [0, 0, 0],
        type: e.type || 'marker',
        label: e.label,
        color: e.color,
        confidence: e.confidence,
        timestamp: e.timestamp,
      }));

      setMarkers(newMarkers);
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [caseId]);

  return (
    <Scene3DEnhanced
      evidenceMarkers={markers}
      cameraCount={2}
      autoRotate={false}
    />
  );
}
```

---

## 7. Export Scene as Report

```tsx
'use client';

import { useRef } from 'react';
import { Scene3DEnhanced } from '@/components/investigation/Scene3DEnhanced';
import html2pdf from 'html2pdf.js';

export function SceneReport({ markers }: { markers: Evidence3D[] }) {
  const sceneRef = useRef<HTMLDivElement>(null);

  const handleExport = async () => {
    if (!sceneRef.current) return;

    // Capture scene screenshot
    const canvas = sceneRef.current.querySelector('canvas');
    if (!canvas) return;

    const imageData = canvas.toDataURL('image/png');

    // Generate PDF with report
    const pdf = html2pdf.getPdf({
      margin: 10,
      filename: `crime-scene-report-${Date.now()}.pdf`,
      image: { type: 'png', quality: 0.98 },
      html: `
        <div>
          <h1>Crime Scene Investigation Report</h1>
          <p>Generated: ${new Date().toISOString()}</p>
          <img src="${imageData}" style="width: 100%;" />
          <h2>Evidence Markers</h2>
          <ul>
            ${markers.map((m) => `<li>${m.label} (${m.type})</li>`).join('')}
          </ul>
        </div>
      `,
    });

    pdf.save(`report-${Date.now()}.pdf`);
  };

  return (
    <div>
      <div ref={sceneRef}>
        <Scene3DEnhanced evidenceMarkers={markers} />
      </div>
      <button onClick={handleExport} className="mt-4 px-4 py-2 bg-accent text-white rounded">
        Export as PDF
      </button>
    </div>
  );
}
```

---

## 8. Case Workflow Integration

```tsx
'use client';

import { useEffect } from 'react';
import { setTheme } from '@/lib/theme';
import { EvidenceLibrary } from '@/components/evidence/EvidenceLibrary';
import { Scene3DEnhanced } from '@/components/investigation/Scene3DEnhanced';

interface CaseStatus {
  status: 'open' | 'active' | 'critical' | 'closed';
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export function CaseWorkflow({ caseId, caseStatus }: { caseId: string; caseStatus: CaseStatus }) {
  // Auto-switch theme based on case severity
  useEffect(() => {
    if (caseStatus.severity === 'critical') {
      setTheme('serious');
    } else {
      setTheme('dark');
    }
  }, [caseStatus.severity]);

  return (
    <div className="h-full flex flex-col gap-4 p-6">
      {/* Status indicator */}
      <div
        className={`p-4 rounded-lg border text-sm font-medium ${
          caseStatus.severity === 'critical'
            ? 'bg-var(--danger)/10 border-var(--danger)/25 text-var(--danger)'
            : 'bg-var(--accent)/10 border-var(--accent)/25 text-var(--accent)'
        }`}
      >
        Case Status: <span className="capitalize">{caseStatus.severity}</span>
      </div>

      {/* Main workflow */}
      <div className="flex-1 grid grid-cols-2 gap-4">
        <EvidenceLibrary caseId={caseId} />
        <Scene3DEnhanced autoRotate={true} />
      </div>
    </div>
  );
}
```

---

## Quick Integration Checklist

- [ ] Theme switcher in header (already done)
- [ ] Add `EvidenceLibrary` to Evidence page
- [ ] Add `Scene3DEnhanced` to Investigation page
- [ ] Connect markers to real API data
- [ ] Connect file upload to backend
- [ ] Add marker selection handlers
- [ ] Integrate with case state management
- [ ] Add 3D to PDF export
- [ ] Test theme switching
- [ ] Test media search
- [ ] Performance optimization

---

**For more details, see:** `THEMING_AND_FEATURES.md`
