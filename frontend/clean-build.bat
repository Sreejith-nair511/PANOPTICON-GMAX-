@echo off
echo Cleaning Next.js build...
rmdir /s /q .next
rmdir /s /q .turbo
rmdir /s /q node_modules\.cache
echo.
echo Cleaning complete. You can now run:
echo npm run dev
echo or
echo npm run build
