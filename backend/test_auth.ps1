taskkill /F /IM java.exe /T | Out-Null
Start-Sleep -Seconds 2

Start-Job -Name "Discovery" -ScriptBlock { Set-Location "c:\Users\AHMED\.cursor\projects\airline-system\backend\discovery-service"; mvn spring-boot:run } | Out-Null
Write-Host "Starting Discovery..."
Start-Sleep -Seconds 15

$services = @("auth-service", "api-gateway", "aircraft-service")
foreach ($service in $services) {
    Write-Host "Starting $service..."
    Start-Job -Name $service -ScriptBlock { Set-Location "c:\Users\AHMED\.cursor\projects\airline-system\backend\$args"; mvn spring-boot:run } -ArgumentList $service | Out-Null
    Start-Sleep -Seconds 5
}

Write-Host "Waiting 45 seconds for services to fully start..."
Start-Sleep -Seconds 45

Write-Output "--- TESTS ---"
$body1 = '{"username": "admin", "password": "admin123", "email": "admin@royalairmaroc.ma", "role": "ADMIN"}'
try {
    $res = Invoke-RestMethod -Uri "http://localhost:8085/api/auth/register" -Method Post -Body $body1 -ContentType "application/json" -ErrorAction Stop
    Write-Output "POST register -> SUCCESS"
} catch { Write-Output "POST register -> FAILED ($($_.Exception.Message))" }

$body2 = '{"username": "admin", "password": "admin123"}'
$token = ""
try {
    $res = Invoke-RestMethod -Uri "http://localhost:8085/api/auth/login" -Method Post -Body $body2 -ContentType "application/json" -ErrorAction Stop
    Write-Output "POST login -> SUCCESS"
    $token = $res.token
} catch { Write-Output "POST login -> FAILED ($($_.Exception.Message))" }

if ($token) {
    try {
        $headers = @{"Authorization" = "Bearer $token"}
        $res = Invoke-RestMethod -Uri "http://localhost:8080/api/aircraft" -Method Get -Headers $headers -ErrorAction Stop
        Write-Output "GET protected with token -> SUCCESS"
    } catch { Write-Output "GET protected with token -> FAILED ($($_.Exception.Message))" }
}

try {
    $res = Invoke-RestMethod -Uri "http://localhost:8080/api/aircraft" -Method Get -ErrorAction Stop
    Write-Output "GET protected WITHOUT token -> SUCCESS (This is bad)"
} catch { 
    if ($_.Exception.Response.StatusCode.value__ -eq 401) {
        Write-Output "GET protected WITHOUT token -> 401 Unauthorized (Expected!)"
    } else {
        Write-Output "GET protected WITHOUT token -> FAILED ($($_.Exception.Message))"
    }
}

taskkill /F /IM java.exe /T | Out-Null
