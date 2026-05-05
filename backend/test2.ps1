taskkill /F /IM java.exe /T
Start-Sleep -Seconds 2

Start-Job -Name "Discovery" -ScriptBlock { Set-Location "c:\Users\AHMED\.cursor\projects\airline-system\backend\discovery-service"; mvn spring-boot:run }
Write-Host "Starting Discovery..."
Start-Sleep -Seconds 20

$services = @("aircraft-service", "seat-service", "passenger-service", "flight-service", "api-gateway")
foreach ($service in $services) {
    Write-Host "Starting $service..."
    Start-Job -Name $service -ScriptBlock { Set-Location "c:\Users\AHMED\.cursor\projects\airline-system\backend\$args"; mvn spring-boot:run } -ArgumentList $service
    Start-Sleep -Seconds 5
}

Write-Host "Waiting 60 seconds for services to fully start..."
Start-Sleep -Seconds 60

$body1 = '{"aircraftCode": "AT-B737-01", "model": "Boeing 737-800", "registration": "CN-RNV", "totalRows": 30, "seatsPerRow": 6, "totalSeats": 162, "status": "ACTIVE"}'
try {
    Invoke-RestMethod -Uri "http://localhost:8081/api/aircraft" -Method Post -Body $body1 -ContentType "application/json" -ErrorAction Stop | Out-Null
    Write-Output "POST aircraft -> SUCCESS"
} catch { Write-Output "POST aircraft -> FAILED ($($_.Exception.Message))" }

$body2 = '{"aircraftId": 1, "totalRows": 30, "layoutType": "NARROW", "aircraftCode": "AT-B737-01"}'
try {
    Invoke-RestMethod -Uri "http://localhost:8082/api/seats/generate" -Method Post -Body $body2 -ContentType "application/json" -ErrorAction Stop | Out-Null
    Write-Output "POST seats -> SUCCESS"
} catch { Write-Output "POST seats -> FAILED ($($_.Exception.Message))" }

try {
    $res = Invoke-RestMethod -Uri "http://localhost:8082/api/seats/aircraft/1" -Method Get -ErrorAction Stop
    Write-Output "GET seats map -> SUCCESS"
    $res | ConvertTo-Json -Depth 10 | Out-File "seat_map_response.json" -Encoding utf8
} catch { Write-Output "GET seats map -> FAILED ($($_.Exception.Message))" }

$body3 = '{"flightNumber": "AT 200", "origin": "CMN", "destination": "CDG", "departureTime": "2026-04-26T08:30:00", "arrivalTime": "2026-04-26T12:45:00", "status": "SCHEDULED", "aircraftId": 1, "gate": "B12"}'
try {
    Invoke-RestMethod -Uri "http://localhost:8084/api/flights" -Method Post -Body $body3 -ContentType "application/json" -ErrorAction Stop | Out-Null
    Write-Output "POST flight -> SUCCESS"
} catch { Write-Output "POST flight -> FAILED ($($_.Exception.Message))" }

$body4 = '{"firstName": "Youssef", "lastName": "Benali", "email": "youssef@gmail.com", "passportNumber": "MA123456", "nationality": "Moroccan", "flightId": 1, "seatId": "3A", "aircraftId": 1}'
try {
    Invoke-RestMethod -Uri "http://localhost:8083/api/passengers" -Method Post -Body $body4 -ContentType "application/json" -ErrorAction Stop | Out-Null
    Write-Output "POST passenger -> SUCCESS"
} catch { Write-Output "POST passenger -> FAILED ($($_.Exception.Message))" }

try {
    Invoke-RestMethod -Uri "http://localhost:8083/api/passengers/search?name=Youssef" -Method Get -ErrorAction Stop | Out-Null
    Write-Output "GET passenger search -> SUCCESS"
} catch { Write-Output "GET passenger search -> FAILED ($($_.Exception.Message))" }

taskkill /F /IM java.exe /T
