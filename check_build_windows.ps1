# Script para verificar se o build Windows foi gerado

$buildPath = "C:\Users\Micro\agents-ide-build\VSCode-win32-x64"

Write-Host "=== Verificando Build do VS Code para Windows ===" -ForegroundColor Cyan
Write-Host ""

if (Test-Path $buildPath) {
    Write-Host "✓ Pasta encontrada: $buildPath" -ForegroundColor Green
    Write-Host ""

    $exePath = Join-Path $buildPath "Code.exe"
    if (Test-Path $exePath) {
        Write-Host "✓ Executável encontrado: $exePath" -ForegroundColor Green
        $fileInfo = Get-Item $exePath
        Write-Host "  Tamanho: $($fileInfo.Length / 1MB) MB"
        Write-Host "  Data: $($fileInfo.LastWriteTime)"
    } else {
        Write-Host "✗ Code.exe NÃO encontrado!" -ForegroundColor Red
    }

    Write-Host ""
    Write-Host "Conteúdo da pasta (primeiros 20 itens):" -ForegroundColor Yellow
    Get-ChildItem $buildPath | Select-Object -First 20 | Format-Table Name, Length, LastWriteTime

} else {
    Write-Host "✗ Pasta NÃO encontrada: $buildPath" -ForegroundColor Red
    Write-Host ""
    Write-Host "Verificando se a pasta pai existe..." -ForegroundColor Yellow

    $parentPath = "C:\Users\Micro\agents-ide-build"
    if (Test-Path $parentPath) {
        Write-Host "✓ Pasta pai existe: $parentPath" -ForegroundColor Green
        Write-Host "Conteúdo:" -ForegroundColor Yellow
        Get-ChildItem $parentPath | Format-Table Name, LastWriteTime
    } else {
        Write-Host "✗ Pasta pai também NÃO existe: $parentPath" -ForegroundColor Red
        Write-Host ""
        Write-Host "O build ainda não foi gerado ou o volume Docker não está montado corretamente." -ForegroundColor Yellow
    }
}
