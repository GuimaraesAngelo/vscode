# Relatório de Teste: Agents First IDE (Windows)

## 1. Localização dos Artefatos
O build para Windows deve gerar uma pasta contendo o executável do VS Code customizado.

*   **Caminho no Host (Windows):**
    `C:\Users\Micro\agents-ide-build\VSCode-win32-x64`
*   **Executável Principal:**
    `Code.exe` (dentro da pasta acima)

> **Nota:** Se a pasta `VSCode-win32-x64` não existir ou estiver vazia, o build no Docker falhou ou ainda não terminou. Nesse caso, reinicie o Docker e rode o script de build novamente.

## 2. Instruções de Execução
1.  Navegue até a pasta `C:\Users\Micro\agents-ide-build\VSCode-win32-x64` pelo Windows Explorer.
2.  Dê um duplo clique em `Code.exe`.
3.  **O que observar:**
    *   O VS Code deve abrir normalmente.
    *   Verifique se o nome da janela ou menus indicam "Agents IDE" (se o branding funcionou).
    *   Procure pelo ícone da **Agents First IDE** na barra lateral (Activity Bar).

## 3. Plano de Teste Manual

Execute os seguintes cenários para validar a integração da extensão:

### Cenário 1: Copilot Básico
1.  Abra o painel "Agent Studio" (ícone da extensão).
2.  Vá para a aba **Copilot Chat**.
3.  Digite: "Crie uma função Python para calcular Fibonacci".
4.  **Verificação:** O Copilot deve responder com o código.
5.  Tente inserir o código em um arquivo novo.
    *   [ ] OK / FALHA

### Cenário 2: Multi-Agente (Architect -> Implementer)
1.  No **Agents Manager**, verifique se os agentes padrão (Architect, Implementer) estão listados.
2.  No Chat, peça: "Planeje e crie um script simples de 'Hello World' em Node.js".
3.  **Verificação:**
    *   O agente **Architect** deve analisar o pedido.
    *   O agente **Implementer** deve gerar o código.
    *   [ ] OK / FALHA

### Cenário 3: Project Intelligence & Scaffold
1.  Abra uma pasta vazia no VS Code.
2.  Abra o painel **Project Intelligence**.
3.  Verifique se ele identifica que o projeto está vazio.
4.  No Chat, peça: "Scaffold a new React project here".
5.  **Verificação:**
    *   O sistema deve sugerir ou executar a criação de arquivos.
    *   [ ] OK / FALHA

## 4. Troubleshooting
Se o Docker estiver travado (erro 500 ou timeout):
1.  Reinicie o Docker Desktop no Windows.
2.  Inicie o container novamente: `docker start agents-ide-build`
3.  Entre no container e refaça o build se necessário:
    ```bash
    docker exec -it agents-ide-build bash
    cd /workspace/agents-ide-build/vscode-custom
    nvm use 22
    export NODE_OPTIONS="--max-old-space-size=8192"
    npx gulp vscode-win32-x64-min
    ```
