# Guia: Como Gerar o Build Windows do VS Code

## Situação Atual
- ✓ Container Docker configurado
- ✓ VS Code compilado (modo dev)
- ✓ Extensão agents-first-ide instalada
- ✗ Build Windows (Code.exe) **NÃO GERADO AINDA**

## Problema Identificado
O Docker está travado/lento, provavelmente devido ao alto consumo de memória dos builds anteriores.

## Solução: Passo a Passo

### 1. Reiniciar o Docker Desktop
1. Abra o Docker Desktop no Windows
2. Clique em "Restart" ou feche e abra novamente
3. Aguarde até que o Docker esteja totalmente iniciado (ícone verde)

### 2. Verificar o Container
Abra o PowerShell e rode:
```powershell
docker ps -a
```

Você deve ver o container `agents-ide-build`. Se o STATUS for "Exited", inicie-o:
```powershell
docker start agents-ide-build
```

### 3. Rodar o Build Windows
Execute o script de build:
```powershell
docker exec agents-ide-build bash /workspace/vscode/vscode/build_windows_final.sh
```

**IMPORTANTE:** Este processo vai demorar entre 15 a 30 minutos. Não interrompa!

### 4. Monitorar o Progresso
Em outro terminal PowerShell, você pode acompanhar:
```powershell
docker exec agents-ide-build bash -c "ls -lh /workspace/agents-ide-build/VSCode-win32-x64 2>/dev/null || echo 'Ainda não criado'"
```

### 5. Verificar o Resultado
Quando terminar, rode o script de verificação:
```powershell
powershell -ExecutionPolicy Bypass -File c:\Users\Micro\vscode\vscode\check_build.ps1
```

Se mostrar "CODE.EXE ENCONTRADO", você pode prosseguir para os testes!

## Localização Final
Após o build bem-sucedido:
- **Pasta:** `C:\Users\Micro\agents-ide-build\VSCode-win32-x64`
- **Executável:** `C:\Users\Micro\agents-ide-build\VSCode-win32-x64\Code.exe`

## Troubleshooting

### Se o Docker continuar travando:
1. Aumente a memória do Docker Desktop:
   - Settings → Resources → Memory → 8GB ou mais
2. Reinicie o Docker
3. Tente novamente

### Se o build falhar com erro de memória:
Entre no container manualmente e rode com menos paralelismo:
```bash
docker exec -it agents-ide-build bash
cd /workspace/agents-ide-build/vscode-custom
nvm use 22.20.0
export NODE_OPTIONS="--max-old-space-size=8192"
npx gulp vscode-win32-x64-min --max-old-space-size=8192
```

### Build alternativo (mais lento mas mais estável):
Se tudo falhar, você pode tentar o build sem minificação:
```bash
npx gulp vscode-win32-x64
```
