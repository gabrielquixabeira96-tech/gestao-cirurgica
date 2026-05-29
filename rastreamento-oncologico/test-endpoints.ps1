try {
    $r = Invoke-WebRequest -Uri 'http://localhost:3000/api/health' -UseBasicParsing
    Write-Host ("HEALTH STATUS: " + $r.StatusCode)
    Write-Host $r.Content
} catch {
    Write-Host ("HEALTH ERROR: " + $_.Exception.Message)
}

try {
    $r2 = Invoke-WebRequest -Uri 'http://localhost:3000/api/stats' -UseBasicParsing
    Write-Host ("STATS STATUS: " + $r2.StatusCode)
    Write-Host $r2.Content
} catch {
    Write-Host ("STATS ERROR (expected without DB): " + $_.Exception.Message)
}

try {
    $r3 = Invoke-WebRequest -Uri 'http://localhost:3000/rastrear' -UseBasicParsing
    Write-Host ("RASTREAR STATUS: " + $r3.StatusCode)
} catch {
    Write-Host ("RASTREAR ERROR: " + $_.Exception.Message)
}

try {
    $r4 = Invoke-WebRequest -Uri 'http://localhost:3000/dashboard' -UseBasicParsing
    Write-Host ("DASHBOARD STATUS: " + $r4.StatusCode)
} catch {
    Write-Host ("DASHBOARD ERROR: " + $_.Exception.Message)
}
