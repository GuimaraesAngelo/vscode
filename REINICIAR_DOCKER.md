# AÇÃO URGENTE: Reiniciar Docker Desktop

## Problema
O Docker está retornando erro 500 (Internal Server Error). Isso significa que o daemon do Docker travou.

## Solução Imediata

### 1. Fechar Docker Desktop
- Clique com botão direito no ícone do Docker na bandeja do sistema (system tray)
- Selecione "Quit Docker Desktop"
- Aguarde alguns segundos

### 2. Abrir Docker Desktop novamente
- Procure "Docker Desktop" no menu Iniciar
- Abra o aplicativo
- Aguarde até que o ícone fique verde (Docker rodando)

### 3. Verificar se o container existe
Abra o PowerShell e rode:
```powershell
docker ps -a
```

Você deve ver `agents-ide-build` na lista.

### 4. Iniciar o container
```powershell
docker start agents-ide-build
```

### 5. Rodar o build do Windows
```powershell
docker exec agents-ide-build bash /workspace/vscode/vscode/build_windows_final.sh
```

## Se o container não existir mais

Caso o container tenha sido perdido, você precisará recriá-lo:

```powershell
docker run -d --name agents-ide-build -v "C:/Users/Micro:/workspace" ubuntu:22.04 tail -f /dev/null
```

Depois rode o script de setup completo novamente (mas isso vai demorar muito).

## Alternativa: Verificar se já existe algum build parcial

Antes de fazer tudo de novo, verifique:
```powershell
powershell -ExecutionPolicy Bypass -File c:\Users\Micro\vscode\vscode\check_build.ps1
```

Se mostrar que `vscode-custom` existe, o código fonte está salvo e você só precisa rodar o build novamente.

---

**PRÓXIMO PASSO:** Depois de reiniciar o Docker, me avise e eu continuo o processo de build automaticamente.
