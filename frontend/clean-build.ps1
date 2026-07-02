# Clean Next.js build cache
Write-Host "🧹 Cleaning Next.js build artifacts..." -ForegroundColor Cyan

$paths = @('.next', '.turbo', 'node_modules\.cache')

foreach ($path in $paths) {
    if (Test-Path $path) {
        Write-Host "  Removing $path..." -ForegroundColor Yellow
        Remove-Item -Recurse -Force $path -ErrorAction SilentlyContinue
        Write-Host "  ✓ Removed $path" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "✅ Clean complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  npm run dev     # For development"
Write-Host "  npm run build   # For production build"
