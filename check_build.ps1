# Verificar se o build Windows foi gerado

$buildPath = "C:\Users\Micro\agents-ide-build\VSCode-win32-x64"

Write-Host "Verificando: $buildPath"

if (Test-Path $buildPath) {
	Write-Host "PASTA ENCONTRADA"
	$exePath = "$buildPath\Code.exe"
	if (Test-Path $exePath) {
		Write-Host "CODE.EXE ENCONTRADO EM: $exePath"
	}
 else {
		Write-Host "CODE.EXE NAO ENCONTRADO"
	}
	Write-Host "Conteudo da pasta:"
	Get-ChildItem $buildPath | Select-Object -First 20
}
else {
	Write-Host "PASTA NAO ENCONTRADA"
	Write-Host "Verificando pasta pai..."
	if (Test-Path "C:\Users\Micro\agents-ide-build") {
		Write-Host "Pasta pai existe. Conteudo:"
		Get-ChildItem "C:\Users\Micro\agents-ide-build"
	}
 else {
		Write-Host "Pasta pai tambem nao existe"
	}
}
