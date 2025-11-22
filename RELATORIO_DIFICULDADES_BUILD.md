# Relatório de Dificuldades na Implementação do Build do VS Code (Docker)

## 1. Contexto
O objetivo é criar um ambiente isolado e reprodutível (Docker/Ubuntu 22.04) para compilar o VS Code Open Source (Code-OSS) com a extensão `agents-first-ide` embutida. O processo envolve clonar o repositório oficial, instalar dependências complexas e gerar binários para Linux e Windows.

## 2. Principais Dificuldades Encontradas

### A. Gestão de Dependências e Versões (Node.js & Yarn)
*   **O Problema:** O repositório do VS Code é extremamente sensível às versões do Node.js e do gerenciador de pacotes.
    *   Inicialmente, o container instalou o Node v22.21.1 (versão mais recente do canal 22), mas o VS Code (na branch main/recente) tem requisitos estritos que conflitaram com scripts de `preinstall`.
    *   O uso do **Yarn Berry (v4)** padrão do Node 22 causou falhas imediatas, pois o VS Code ainda depende fortemente do **Yarn Classic (v1)** e de comportamentos específicos de lockfile (`yarn.lock`).
*   **Impacto:** Falhas repetidas na etapa de `yarn install`, com erros de "frozen lockfile" e incompatibilidade de scripts.

### B. Compilação de Módulos Nativos (C++ / node-gyp)
*   **O Problema:** O VS Code utiliza vários módulos nativos (escritos em C++) para performance e integração com o SO (ex: `keytar`, `kerberos`, `spdlog`). Esses módulos precisam ser compilados durante a instalação (`node-gyp rebuild`).
*   **Erro Específico (Kerberos):** A última tentativa de build falhou ao compilar o módulo `kerberos`.
    *   *Log de Erro:* `fatal error: gssapi/gssapi.h: No such file or directory`
    *   *Causa:* O container Ubuntu base (mesmo com `build-essential`) não possui os headers de desenvolvimento do protocolo Kerberos instalados por padrão.
*   **Impacto:** O processo de `npm install` é interrompido, impedindo o prosseguimento para a compilação do editor.

### C. Scripts de Pre-install e Electron
*   **O Problema:** O script `build/npm/preinstall.js` tenta baixar headers do Electron correspondentes à versão do Node.
*   **Dificuldade:** Houve incompatibilidade entre a versão do Node instalada e a esperada pelo script, gerando erros de checksum e 404 ao tentar baixar artefatos do site do Electron/Node.js.

### D. Ambiente Docker Não-Interativo
*   **O Problema:** Executar builds complexos via `docker exec` requer cuidado com interatividade (prompts de confirmação do `apt` ou `npm`).
*   **Solução:** Tivemos que ajustar scripts para usar `DEBIAN_FRONTEND=noninteractive` e flags `-y` ou `--yes` para evitar que o processo travasse aguardando input do usuário "invisível".

## 3. Estado Atual e Soluções Aplicadas

1.  **Versão do Node:** Forçamos o uso do **Node v22.20.0** (via `nvm`) para alinhar com requisitos detectados.
2.  **Gerenciador de Pacotes:** Migramos a tentativa de build para **NPM** (em vez de Yarn) temporariamente para contornar problemas de lockfile do Yarn v4, o que permitiu avançar até a compilação dos módulos nativos.
3.  **Dependências de Sistema:** Identificamos a falta da biblioteca `libkrb5-dev`.

## 4. Próximos Passos Críticos (Bloqueados)

Para concluir o build com sucesso, é **obrigatório** executar a seguinte correção no container:

1.  **Instalar Headers do Kerberos:**
    ```bash
    apt install -y libkrb5-dev
    ```
2.  **Reiniciar Instalação:**
    Rodar novamente `npm install` (ou `yarn install` clássico) para compilar os módulos nativos com sucesso.

---
**Conclusão:** O ambiente está 90% pronto. A falha atual é uma dependência de sistema Linux padrão para desenvolvimento (Kerberos) que não estava listada nos requisitos iniciais genéricos, mas é exigida pelo VS Code completo.
