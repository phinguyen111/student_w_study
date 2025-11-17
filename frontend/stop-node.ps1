# Stop all Node.js processes
# Usage: .\stop-node.ps1

Write-Host "🛑 Stopping all Node.js processes..." -ForegroundColor Yellow

$processes = Get-Process node -ErrorAction SilentlyContinue

if ($processes) {
    $count = $processes.Count
    Write-Host "Found $count Node.js process(es)" -ForegroundColor Cyan
    
    foreach ($proc in $processes) {
        Write-Host "  Stopping PID: $($proc.Id)..." -ForegroundColor Gray
        Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
    }
    
    Start-Sleep -Seconds 1
    Write-Host "✅ All Node.js processes stopped" -ForegroundColor Green
} else {
    Write-Host "ℹ️  No Node.js processes found" -ForegroundColor Gray
}

