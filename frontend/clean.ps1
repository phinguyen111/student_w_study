# Clean Next.js build files and cache
# Usage: .\clean.ps1

Write-Host "🧹 Cleaning Next.js build files..." -ForegroundColor Cyan

# Stop all node processes (optional - uncomment if needed)
# Write-Host "Stopping Node processes..." -ForegroundColor Yellow
# Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
# Start-Sleep -Seconds 2

# Remove .next directory
if (Test-Path .next) {
    Write-Host "Removing .next directory..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
    Write-Host "✅ .next removed" -ForegroundColor Green
} else {
    Write-Host "ℹ️  .next directory not found" -ForegroundColor Gray
}

# Remove cache
if (Test-Path node_modules\.cache) {
    Write-Host "Removing cache..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force node_modules\.cache -ErrorAction SilentlyContinue
    Write-Host "✅ Cache removed" -ForegroundColor Green
} else {
    Write-Host "ℹ️  Cache not found" -ForegroundColor Gray
}

Write-Host "`n✨ Clean complete! You can now run: npm run dev" -ForegroundColor Green

