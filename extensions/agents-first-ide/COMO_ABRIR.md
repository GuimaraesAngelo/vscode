# 🚀 GUIA RÁPIDO - Como Abrir a Extensão

## ✅ Pré-requisitos (JÁ CONCLUÍDOS)
- ✅ Dependências instaladas
- ✅ Prisma Client gerado
- ✅ Código compilado

---

## 📍 PASSO A PASSO PARA ABRIR

### **Opção 1: Via F5 (MAIS FÁCIL)** ⭐

1. **Abra a pasta da extensão no VS Code:**
   - No VS Code atual, vá em: `File > Open Folder`
   - Navegue até: `c:\Users\Micro\vscode\vscode\extensions\agents-first-ide`
   - Clique em "Select Folder"

2. **Pressione F5:**
   - Ou vá em: `Run > Start Debugging`
   - Ou clique no ícone de "play" verde na barra lateral de Debug

3. **Uma NOVA janela do VS Code abrirá:**
   - Esta é a "Extension Development Host"
   - A extensão estará ativa nesta janela

4. **Procure o ícone na Activity Bar:**
   - Na barra lateral ESQUERDA da nova janela
   - Procure por "Agent Studio" ou um ícone de robô
   - Clique nele para ver os painéis

---

### **Opção 2: Via Command Palette**

1. Pressione `Ctrl+Shift+P`
2. Digite: `Debug: Start Debugging`
3. Selecione a configuração "Run Agents First IDE"

---

### **Opção 3: Via Terminal**

Abra um terminal na pasta da extensão e execute:
```powershell
code --extensionDevelopmentPath=.
```

---

## 🎯 O QUE VOCÊ DEVE VER

Após abrir, na **NOVA JANELA** você verá:

### Na Activity Bar (barra lateral esquerda):
```
┌─────────────┐
│  📁 Files   │
│  🔍 Search  │
│  🌿 Git     │
│  🐛 Debug   │
│  🤖 Agent   │ ← NOVO! Clique aqui
│     Studio  │
└─────────────┘
```

### Ao clicar em "Agent Studio", você verá 4 painéis:
1. **Copilot Chat** - Interface de chat
2. **Agents Manager** - Gerenciar agentes
3. **Observability** - Métricas
4. **Project Intelligence** - Análise do projeto

---

## ⚙️ CONFIGURAR API KEY (IMPORTANTE!)

**ANTES de usar, configure sua OpenAI API Key:**

1. Na janela de desenvolvimento, pressione `Ctrl+,`
2. Procure por: `agents-first.openaiApiKey`
3. Cole sua **NOVA** API key (a que você criou após revogar a antiga)
4. Feche as configurações

---

## 🧪 PRIMEIRO TESTE

1. Clique no painel **Copilot Chat**
2. Digite na caixa de texto:
   ```
   Olá! Me ajude a criar um arquivo README.md
   ```
3. Pressione Enter ou clique em "Send"
4. Observe a resposta do agente!

---

## 🐛 TROUBLESHOOTING

### Problema: "Não vejo o ícone Agent Studio"
**Solução:**
- Certifique-se de que está olhando na NOVA janela que abriu
- Pressione `Ctrl+R` para recarregar a janela
- Verifique se não há erros no console (`Help > Toggle Developer Tools`)

### Problema: "Extension Host terminated unexpectedly"
**Solução:**
```powershell
npm run compile
```
Depois pressione F5 novamente

### Problema: "Cannot find module '@prisma/client'"
**Solução:**
```powershell
npx prisma generate
npm run compile
```

### Problema: Erro de API Key
**Solução:**
- Verifique se configurou a API key em Settings
- Certifique-se de que a key é válida e não foi revogada

---

## 📹 FLUXO VISUAL

```
Você está aqui          →    Pressione F5    →    Nova Janela Abre
(Pasta da extensão)          (ou Debug)           (Extension Host)
                                                          ↓
                                                   Clique em 🤖
                                                   Agent Studio
                                                          ↓
                                                   Veja os 4 painéis
                                                          ↓
                                                   Use Copilot Chat!
```

---

## 💡 DICAS

- **Janela Original** = Onde você edita o código da extensão
- **Janela Nova (Extension Host)** = Onde você USA a extensão
- Você pode ter ambas abertas ao mesmo tempo
- Mudanças no código requerem recompilar (`npm run compile`) e recarregar (`Ctrl+R` na janela de desenvolvimento)

---

## 🎉 PRONTO!

Se seguiu todos os passos, você deve estar vendo a extensão funcionando!

**Próximos passos:**
1. Explore os diferentes painéis
2. Teste comandos no Copilot Chat
3. Veja as métricas em Observability
4. Configure agentes em Agents Manager

Divirta-se! 🚀
