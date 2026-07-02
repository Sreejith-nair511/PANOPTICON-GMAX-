# Theme CSS Variables Reference

This document lists all available CSS custom properties for theming PANOPTICON.

## Color Variables

### Background Colors
```css
--bg-base         /* Main background color */
--bg-surface      /* Surface/card backgrounds */
--bg-elevated     /* Elevated surfaces (modals, etc) */
--bg-overlay      /* Overlay/tooltip backgrounds */
```

### Text Colors
```css
--text-primary    /* Primary text color */
--text-secondary  /* Secondary/muted text */
--text-dim        /* Very dim/faded text */
```

### Accent Colors
```css
--accent          /* Primary accent color */
--accent-dim      /* Dimmed accent (10-15% opacity) */
--accent-glow     /* Glowing accent effect (30-40% opacity) */
--accent-bright   /* Bright/hover accent */
```

### Status Colors
```css
--success         /* Success/positive color */
--warning         /* Warning/caution color */
--danger          /* Danger/error color */
```

### Border Colors
```css
--border          /* Standard border (7% opacity) */
--border-bright   /* Bright border (12% opacity) */
```

## Theme Values by Mode

### 🌙 Dark Mode (Default)

```css
[data-theme="dark"] {
  --bg-base:        #03050d;
  --bg-surface:     #070b16;
  --bg-elevated:    #0c1220;
  --bg-overlay:     #111826;

  --accent:         #00b4d8;    /* Cyan */
  --accent-bright:  #38e1ff;
  
  --primary:        #1565c0;    /* Blue */
  
  --text-primary:   #e8edf5;    /* Near white */
  --text-secondary: #8b96aa;    /* Gray */
  --text-dim:       #505c72;    /* Darker gray */

  --success:        #22c55e;    /* Green */
  --warning:        #f59e0b;    /* Amber */
  --danger:         #ef4444;    /* Red */

  --border:         rgba(255,255,255,0.07);
  --border-bright:  rgba(255,255,255,0.12);
}
```

**Best for:** Night operations, office use, standard investigations

**UI Examples:**
- Header: Dark navy with cyan glow
- Cards: Slightly lighter navy
- Text: Bright near-white
- Accents: Bright cyan highlights

### ☀️ Light Mode

```css
[data-theme="light"] {
  --bg-base:        #f9fafb;      /* Off-white */
  --bg-surface:     #ffffff;      /* Pure white */
  --bg-elevated:    #f3f4f6;
  --bg-overlay:     #e5e7eb;

  --accent:         #0891b2;      /* Teal */
  --accent-bright:  #06b6d4;

  --primary:        #2563eb;      /* Blue */

  --text-primary:   #111827;      /* Near black */
  --text-secondary: #6b7280;      /* Gray */
  --text-dim:       #9ca3af;      /* Light gray */

  --success:        #16a34a;      /* Green */
  --warning:        #d97706;      /* Amber */
  --danger:         #dc2626;      /* Red */

  --border:         rgba(0,0,0,0.06);
  --border-bright:  rgba(0,0,0,0.1);
}
```

**Best for:** Daytime operations, outdoor use, presentations

**UI Examples:**
- Header: White/light gray
- Cards: Pure white
- Text: Near black
- Accents: Teal highlights

### 🚨 Serious Mode (Critical Cases)

```css
[data-theme="serious"] {
  --bg-base:        #0f0203;      /* Deep red-black */
  --bg-surface:     #1a0506;
  --bg-elevated:    #2a0809;
  --bg-overlay:     #3a0c0f;

  --accent:         #dc2626;      /* Bright red */
  --accent-bright:  #f87171;      /* Light red */

  --primary:        #991b1b;      /* Dark red */

  --text-primary:   #fecaca;      /* Light red */
  --text-secondary: #fca5a5;
  --text-dim:       #f87171;      /* Red-tinted gray */

  --success:        #dc2626;      /* Red (urgent) */
  --warning:        #f97316;      /* Orange */
  --danger:         #b91c1c;      /* Dark red */

  --border:         rgba(220,38,38,0.15);
  --border-bright:  rgba(220,38,38,0.25);
}
```

**Best for:** Active crime scenes, critical investigations, time-sensitive cases

**UI Examples:**
- Header: Deep red with bright red accents
- Cards: Slightly lighter red tones
- Text: Light red for urgency
- Accents: Bright red for critical alerts
- Overall feel: Urgent, high-alert atmosphere

### ⚡ High Contrast Mode

```css
[data-theme="high-contrast"] {
  --bg-base:        #000000;      /* Pure black */
  --bg-surface:     #0a0a0a;
  --bg-elevated:    #1a1a1a;
  --bg-overlay:     #2a2a2a;

  --accent:         #00ff00;      /* Bright green */
  --accent-bright:  #00ff00;

  --primary:        #ffff00;      /* Bright yellow */

  --text-primary:   #ffffff;      /* Pure white */
  --text-secondary: #cccccc;      /* Light gray */
  --text-dim:       #999999;      /* Medium gray */

  --success:        #00ff00;      /* Green */
  --warning:        #ffff00;      /* Yellow */
  --danger:         #ff0000;      /* Red */

  --border:         rgba(255,255,255,0.3);
  --border-bright:  rgba(255,255,255,0.5);
}
```

**Best for:** Accessibility, low-vision users, WCAG AAA compliance

**UI Examples:**
- Header: Pure black with bright green
- Cards: Dark gray backgrounds
- Text: Pure white for maximum contrast
- Accents: Bright neon green
- Overall feel: High contrast, minimal distractions

## Using Theme Variables in Components

### CSS

```css
.my-component {
  background: var(--bg-surface);
  color: var(--text-primary);
  border: 1px solid var(--border);
}

.my-button {
  background: var(--accent);
  color: white;
  box-shadow: 0 0 24px var(--accent-glow);
}
```

### Tailwind (with custom utilities)

```tsx
// Add to tailwind.config.js
module.exports = {
  theme: {
    colors: {
      'bg-base': 'var(--bg-base)',
      'bg-surface': 'var(--bg-surface)',
      'text-primary': 'var(--text-primary)',
      // ... etc
    }
  }
}

// Then use in components:
<div className="bg-bg-surface text-text-primary border border-border">
  Content
</div>
```

### React Inline Styles

```tsx
<div style={{
  backgroundColor: 'var(--bg-surface)',
  color: 'var(--text-primary)',
  borderColor: 'var(--border)',
}}>
  Content
</div>
```

## Derived CSS Variables

These are calculated from base theme variables:

```css
--background          /* HSL representation for Tailwind */
--foreground
--surface
--surface-raised
--surface-overlay
--card
--card-foreground
--primary-css
--primary-foreground
--secondary
--secondary-foreground
--muted
--muted-foreground
--accent-css
--accent-foreground
--accent-glow-css
--success-css
--warning-css
--danger-css
--destructive
--destructive-foreground
--border-css
--input
--ring
```

## Component Styling Examples

### Card with Theme Colors

```css
.card {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 16px;
  color: var(--text-primary);
}

.card:hover {
  border-color: var(--accent);
  box-shadow: 0 0 16px var(--accent-glow);
}
```

### Button with Theme

```css
.button-primary {
  background: var(--accent);
  color: white;
  border: 1px solid transparent;
  border-radius: 8px;
  padding: 10px 16px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.button-primary:hover {
  background: var(--accent-bright);
  box-shadow: 0 4px 16px var(--accent-glow);
}

.button-primary:active {
  transform: scale(0.98);
}
```

### Alert with Status Colors

```css
.alert-success {
  background: var(--success);
  opacity: 0.1;
  color: var(--success);
  border: 1px solid;
  border-color: var(--success);
  opacity: 0.3;
}

.alert-warning {
  background: var(--warning);
  opacity: 0.1;
  color: var(--warning);
  border: 1px solid;
  border-color: var(--warning);
  opacity: 0.3;
}

.alert-danger {
  background: var(--danger);
  opacity: 0.1;
  color: var(--danger);
  border: 1px solid;
  border-color: var(--danger);
  opacity: 0.3;
}
```

### Badge with Theme

```css
.badge {
  padding: 4px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid;
}

.badge-active {
  background: rgba(34, 197, 94, 0.14);
  border-color: rgba(34, 197, 94, 0.3);
  color: #4ade80;
}

.badge-pending {
  background: rgba(245, 158, 11, 0.14);
  border-color: rgba(245, 158, 11, 0.3);
  color: #fbbf24;
}

.badge-critical {
  background: rgba(239, 68, 68, 0.14);
  border-color: rgba(239, 68, 68, 0.3);
  color: #f87171;
}
```

## Radius Variables

```css
--radius-sm:  8px;
--radius-md:  12px;
--radius-lg:  16px;
--radius-xl:  20px;
```

Used for:
- `--radius-sm`: Small buttons, badges, inputs
- `--radius-md`: Standard components
- `--radius-lg`: Cards, panels
- `--radius-xl`: Large modals, overlays

## Glass Effect Variables

Pre-calculated glass morphism effects:

```css
.glass {
  background: rgba(var(--background) / 0.8);
  backdrop-filter: blur(20px) saturate(1.2);
  border: 1px solid var(--border);
}

.glass-strong {
  background: rgba(var(--background) / 0.92);
  backdrop-filter: blur(32px) saturate(1.5);
  border: 1px solid var(--border-bright);
}
```

## Dynamic Color Opacity

```css
/* Using CSS custom properties with opacity */
.semi-transparent {
  background: rgba(var(--bg-surface), 0.5);
}

.very-dim {
  color: rgba(var(--text-primary), 0.4);
}
```

## Animation & Transition Timing

```css
/* Smooth transitions */
transition: all 0.15s ease;          /* Snappy UI changes */
transition: all 0.3s ease;           /* Smooth animations */
transition: color 0.2s ease;         /* Color changes */

/* Durations */
0.13s   /* Popup/dropdown open/close */
0.15s   /* Button hover/focus */
0.2s    /* Color transitions */
0.22s   /* Panel open/close */
0.3s    /* Page transitions */
```

## Theme Persistence

The current theme is stored in:
```javascript
localStorage.getItem('panopticon-theme')
// Returns: 'dark' | 'light' | 'serious' | 'high-contrast'
```

## Switching Themes Programmatically

```typescript
import { setTheme } from '@/lib/theme';

// Set theme
setTheme('dark');
setTheme('light');
setTheme('serious');
setTheme('high-contrast');

// Get current theme
import { getTheme } from '@/lib/theme';
const current = getTheme();
```

## Testing Themes

In browser DevTools console:

```javascript
// Test each theme
['dark', 'light', 'serious', 'high-contrast'].forEach(theme => {
  document.documentElement.setAttribute('data-theme', theme);
  console.log(`Testing ${theme}...`);
});

// Get current CSS values
getComputedStyle(document.documentElement).getPropertyValue('--accent');
// Example output: " #00b4d8"
```

## Accessibility Considerations

### Contrast Ratios

| Variable          | Dark Mode | Light Mode | Serious Mode | High Contrast |
|-------------------|-----------|-----------|--------------|---------------|
| Text on Background | 4.5:1+ ✓ | 4.5:1+ ✓ | 4.5:1+ ✓    | 21:1 ✓✓✓      |
| Accent on Background | 3:1+ | 3:1+ | 3:1+ | 7:1+           |

### Color Blindness

- Serious Mode: Red/Orange for urgency (avoids pure red-green conflict)
- High Contrast: Yellow + Green for clarity
- All modes: Sufficient shape/pattern differentiation

### Recommended Accessibility Practices

1. Never rely on color alone for meaning
2. Always provide text labels for colored elements
3. Use icons/symbols in addition to colors
4. Maintain minimum 3:1 contrast ratio
5. Test with ColorOracle or similar tools

## Performance Notes

- CSS variables are parsed once at load
- Changing `data-theme` attribute triggers repaint
- No JavaScript overhead for color lookups
- Theme switch is typically <50ms
- Smooth hardware-accelerated transitions

---

**Reference Version:** 1.1.0  
**Last Updated:** July 2, 2026
