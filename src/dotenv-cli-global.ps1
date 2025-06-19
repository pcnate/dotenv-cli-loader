<#
This script loads variables from a .env file and sets them in the current PowerShell session.
Usage:
    . .\dotenv-cli-global.ps1
or
    . (Join-Path $PSScriptRoot 'dotenv-cli-global.ps1')
#>

$envPath = Join-Path (Get-Location) '.env'
if (Test-Path $envPath) {
    Get-Content $envPath | ForEach-Object {
        $line = $_.Trim()
        if ($line -and -not $line.StartsWith('#') -and $line.Contains('=')) {
            $eqIdx = $line.IndexOf('=')
            $key = $line.Substring(0, $eqIdx).Trim()
            $value = $line.Substring($eqIdx + 1).Trim()
            if (
                ($value.StartsWith('"') -and $value.EndsWith('"')) -or
                ($value.StartsWith("'") -and $value.EndsWith("'"))
            ) {
                $value = $value.Substring(1, $value.Length - 2)
            }
            Set-Item -Path "env:$key" -Value $value
        }
    }
}
