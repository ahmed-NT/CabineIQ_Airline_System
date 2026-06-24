# Load environment variables from root .env file
$envFile = Join-Path $PSScriptRoot "..\..\..env"
Get-Content $envFile | ForEach-Object {
    if ($_ -match "^\s*([^#][^=]+)=(.*)$") {
        [System.Environment]::SetEnvironmentVariable($matches[1].Trim(), $matches[2].Trim(), "Process")
    }
}

mvn spring-boot:run
