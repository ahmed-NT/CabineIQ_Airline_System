taskkill /F /IM java.exe /T
Start-Sleep -Seconds 2
Start-Job -Name "Seat" -ScriptBlock { Set-Location "c:\Users\AHMED\.cursor\projects\airline-system\backend\seat-service"; mvn spring-boot:run }
Start-Sleep -Seconds 30

try {
    $res = Invoke-RestMethod -Uri "http://localhost:8082/api/seats/aircraft/1" -Method Get -ErrorAction Stop
    $res | ConvertTo-Json -Depth 10 | Out-File "seat_map.json" -Encoding utf8
    Write-Output "SUCCESS"
} catch {
    Write-Output "FAILED ($($_.Exception.Message))"
}

taskkill /F /IM java.exe /T
