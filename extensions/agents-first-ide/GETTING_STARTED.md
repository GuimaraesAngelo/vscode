# Getting Started - Agents First IDE

## 🚀 Como Acessar e Testar a Extensão

### Pré-requisitos
1. **Node.js** (v18 ou superior)
2. **VS Code** instalado
3. **OpenAI API Key** (necessária para os agentes funcionarem)

---

## 📦 Instalação e Configuração

### 1. Instalar Dependências
```bash
cd extensions/agents-first-ide
npm install
```

### 2. Gerar Cliente Prisma
```bash
npm run generate:prisma
```

### 3. Compilar o Código TypeScript
```bash
npm run compile
```

### 4. Configurar OpenAI API Key
Crie ou edite o arquivo de configurações do VS Code:

**Opção A - Via Settings UI:**
1. Abra VS Code Settings (`Ctrl+,`)
2. Procure por `agents-first.openaiApiKey`
3. Cole sua API key

**Opção B - Via settings.json:**
```json
{
  "agents-first.openaiApiKey": "sk-your-api-key-here"
}
```

---

## 🎯 Executar a Extensão

### Método 1: Via Debug (Recomendado)
1. Abra a pasta `extensions/agents-first-ide` no VS Code
2. Pressione `F5` ou vá em **Run > Start Debugging**
3. Uma nova janela do VS Code será aberta com a extensão carregada

### Método 2: Via Command Line
```bash
code --extensionDevelopmentPath=c:\Users\Micro\vscode\vscode\extensions\agents-first-ide
```

---

## 🎨 Acessando os Painéis

Após a extensão iniciar, você verá um novo ícone na **Activity Bar** (barra lateral esquerda):

### 📊 Painéis Disponíveis:

#### 1. **Copilot Chat**
- Interface de conversação com os agentes
- Visualização de mensagens multi-agente
- Timeline de execução em tempo real
- Handoffs visuais entre agentes

#### 2. **Agents Manager**
- Listar todos os agentes (Copilot, Architect, Implementer, Tester)
- Editar modelos (GPT-4 Turbo, GPT-4o, o1-preview)
- Modificar instruções de sistema
- Ativar/desativar ferramentas
- Ver estatísticas de performance

#### 3. **Observability**
- KPIs globais (Total Runs, Success Rate, Avg Latency, Cost)
- Performance por agente
- Uso de ferramentas
- Taxa de erros

#### 4. **Project Intelligence**
- Análise automática do workspace
- Detecção de frameworks
- Contagem de linguagens
- Lista de dependências

---

## 🧪 Testando Funcionalidades

### Teste 1: Chat Básico
1. Abra o painel **Copilot Chat**
2. Digite: "Olá, me ajude a criar um arquivo README.md"
3. Observe a resposta do agente

### Teste 2: Handoff entre Agentes
1. Digite: "Crie uma API REST em Node.js com Express"
2. O **Copilot** deve fazer handoff para o **Architect**
3. O **Architect** deve fazer handoff para o **Implementer**
4. Observe a timeline visual dos handoffs

### Teste 3: Aplicar Patch
1. Peça ao agente: "Modifique o package.json para adicionar uma nova dependência"
2. O agente usará a tool `apply_patch`
3. Você verá o diff visual no painel

### Teste 4: Scaffold de Projeto
1. Digite: "Crie um novo projeto React"
2. O agente usará `scaffold_project`
3. Arquivos serão criados automaticamente

### Teste 5: Observabilidade
1. Após algumas interações, abra o painel **Observability**
2. Veja estatísticas de uso
3. Analise performance dos agentes

---

## 🔧 Configuração Avançada

### Segurança do Workspace
Crie o arquivo `.vscode/agents-first/security.json`:
```json
{
  "allow_terminal": ["npm test", "npm run build", "ls", "dir"],
  "max_patch_lines": 500,
  "require_confirmation": true
}
```

### Modelos Customizados
Crie o arquivo `.vscode/agents-first/models.json`:
```json
{
  "copilot": "gpt-4-turbo",
  "architect": "gpt-4o",
  "implementer": "gpt-4-turbo",
  "tester": "gpt-4-turbo"
}
```

---

## 🐛 Troubleshooting

### Problema: "Cannot find module '@prisma/client'"
**Solução:**
```bash
npm run generate:prisma
```

### Problema: "OpenAI API Key not configured"
**Solução:**
1. Verifique se a API key está configurada em Settings
2. Reinicie a extensão

### Problema: Extensão não aparece na Activity Bar
**Solução:**
1. Verifique se a compilação foi bem-sucedida
2. Recarregue a janela (`Ctrl+R` na janela de desenvolvimento)

### Problema: Erros de TypeScript
**Solução:**
```bash
npm run compile
```

---

## 📁 Estrutura de Dados

### Banco de Dados (SQLite)
Localização: `extensions/agents-first-ide/prisma/agents.db`

**Tabelas:**
- `Agent` - Agentes registrados
- `Session` - Sessões de chat
- `Message` - Mensagens trocadas
- `Run` - Execuções de agentes
- `ToolCall` - Chamadas de ferramentas
- `RunLog` - Logs detalhados

### Visualizar Banco de Dados
```bash
npx prisma studio
```

---

## 🎓 Próximos Passos

1. **Explore os Agentes**: Teste diferentes tipos de solicitações
2. **Configure Segurança**: Defina políticas de workspace
3. **Monitore Performance**: Use o painel de Observability
4. **Customize Agentes**: Edite instruções no Agents Manager
5. **Crie Templates**: Use scaffold_project para novos projetos

---

## 📚 Documentação Adicional

- [PHASE2_IMPLEMENTATION_PLAN.md](../../architecture/PHASE2_IMPLEMENTATION_PLAN.md) - Agentes e Handoffs
- [PHASE3_UI_COPILOTPANEL.md](../../architecture/PHASE3_UI_COPILOTPANEL.md) - UI Multi-Agente
- [PHASE4_ADMIN_OBSERVABILITY.md](../../architecture/PHASE4_ADMIN_OBSERVABILITY.md) - Admin e Observabilidade

---

## 🆘 Suporte

Se encontrar problemas:
1. Verifique os logs no **Developer Tools** (`Help > Toggle Developer Tools`)
2. Consulte a documentação de arquitetura
3. Revise as configurações de segurança

**Divirta-se explorando a Agents First IDE! 🚀**
