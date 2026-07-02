# Next.js Build Fix Guide

## Problem
```
Error: Cannot find module './682.js'
```

This error occurs when the Next.js build cache is corrupted and webpack cannot find compiled modules.

---

## Solution (Choose One)

### Option 1: Quick Clean (Windows PowerShell) ⭐ RECOMMENDED

Run from `frontend` directory:

```powershell
.\clean-build.ps1
npm run dev
```

**What it does:**
- Removes `.next` directory (build cache)
- Removes `.turbo` directory (turbo cache)
- Clears `node_modules/.cache`
- Preserves `node_modules` (saves time)

---

### Option 2: Manual Clean (Windows CMD)

```cmd
cd c:\2026proj\SIC CAPSTONE\frontend
rmdir /s /q .next
rmdir /s /q .turbo
rmdir /s /q node_modules\.cache
npm run dev
```

---

### Option 3: Complete Reinstall (Nuclear Option)

**Only if Options 1-2 don't work:**

```powershell
# From frontend directory
rm -recurse -force .next, .turbo, node_modules
npm install
npm run dev
```

⚠️ This takes 5-10 minutes but guarantees a clean state.

---

## Step-by-Step Fix

### 1. Stop Dev Server
Press `Ctrl+C` in terminal if dev server is running

### 2. Clean Build Artifacts
```powershell
# Open PowerShell in frontend directory
.\clean-build.ps1
```

### 3. Start Dev Server
```powershell
npm run dev
```

### 4. Test in Browser
```
http://localhost:3000
```

---

## What Each Command Does

| Command | Effect | Speed |
|---------|--------|-------|
| `.\clean-build.ps1` | Removes caches, keeps node_modules | ⚡ Fast (~1s) |
| Clean & npm install | Removes everything, reinstalls | 🐢 Slow (~5-10m) |
| npm run build | Production build | 🐢 Medium (~2-3m) |

---

## Why This Happens

Next.js webpack compilation creates modules and caches them. If:
- ❌ Process is interrupted during build
- ❌ Webpack cache becomes corrupted
- ❌ Module resolution fails

Then the cache contains invalid references (like missing `682.js`)

---

## Prevention

### Enable Auto-Clean
Add to `package.json` scripts:

```json
"scripts": {
  "clean": "rm -rf .next .turbo",
  "dev": "npm run clean && next dev -p 3000",
  "build": "npm run clean && next build",
  "start": "next start -p 3000",
  "lint": "next lint",
  "type-check": "tsc --noEmit"
}
```

Then use:
```powershell
npm run dev
```

---

## Troubleshooting

### Still getting module errors?

1. **Check Node version:**
   ```powershell
   node --version  # Should be 18+
   npm --version   # Should be 9+
   ```

2. **Verify file structure:**
   ```powershell
   ls src/app/     # Should see layout.tsx, page.tsx, etc
   ls src/lib/     # Should see theme.ts, media-search.ts
   ```

3. **Check for syntax errors:**
   ```powershell
   npm run type-check
   ```

4. **Nuclear option:**
   ```powershell
   rm -recurse -force .next, node_modules
   npm install
   npm run dev
   ```

---

## For Different Commands

### Development
```powershell
.\clean-build.ps1
npm run dev
# Runs on http://localhost:3000
# Hot reload enabled
```

### Production Build
```powershell
.\clean-build.ps1
npm run build
npm run start
# Production-optimized
```

### Type Checking Only
```powershell
npm run type-check
# Just TypeScript, no build
```

---

## Included Scripts

### `clean-build.ps1`
PowerShell script to clean build artifacts. Run with:
```powershell
.\clean-build.ps1
```

### `clean-build.bat`
Batch script version. Run with:
```cmd
clean-build.bat
```

---

## Files to Keep

These should NOT be deleted:
- ✅ `src/` - Source code
- ✅ `public/` - Static files
- ✅ `node_modules/` - Dependencies (unless reinstalling)
- ✅ `package.json` - Dependencies list
- ✅ `tsconfig.json` - TypeScript config
- ✅ `next.config.js` - Next.js config

These CAN be deleted (will regenerate):
- ❌ `.next/` - Build output
- ❌ `.turbo/` - Turbo cache
- ❌ `node_modules/.cache/` - Webpack cache

---

## Quick Reference

```powershell
# Clean and dev (FAST)
.\clean-build.ps1; npm run dev

# Clean and build
.\clean-build.ps1; npm run build

# Full reset (SLOW)
rm -r .next, .turbo, node_modules; npm install; npm run dev

# Check health
npm run type-check
```

---

## Success Indicators

When it works:
- ✅ No webpack errors
- ✅ Dev server starts on port 3000
- ✅ Browser loads without 404s
- ✅ Hot reload works (changes reflect immediately)

---

## Common Errors After Fix

If you still see errors, check:

1. **TypeScript errors:**
   ```powershell
   npm run type-check
   ```
   Fix any type issues shown

2. **Missing imports:**
   Look in `src/` for components that might be missing

3. **CSS/Styling issues:**
   Check `src/app/globals.css` is valid

---

## Getting Help

1. Check if `.next` folder exists (it shouldn't after clean)
2. Verify `npm install` completed successfully
3. Ensure Node.js is 18+
4. Try the nuclear option (full reinstall)

---

## Performance After Fix

Expected startup times:

| First Run | Subsequent Runs | Build |
|-----------|-----------------|-------|
| ~5-10s | ~2-3s | ~30-60s |

If slower, check:
- Hard drive space (need 500MB+)
- Antivirus scanning node_modules
- Node process taking too long

---

**Created:** July 2, 2026  
**Status:** ✅ Ready to use
