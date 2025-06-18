# 🔒 Configuração de Segurança

## ⚠️ IMPORTANTE: Credenciais de Segurança

**NUNCA** commite credenciais sensíveis no código!

## 📋 Variáveis de Ambiente Necessárias

### Para o Vercel (Produção):
```
RD_CLIENT_ID=seu_client_id_aqui
RD_CLIENT_SECRET=seu_client_secret_aqui
```

### Para desenvolvimento local (.env):
```
REACT_APP_RD_CLIENT_ID=seu_client_id_aqui
REACT_APP_RD_CLIENT_SECRET=seu_client_secret_aqui
RD_CLIENT_ID=seu_client_id_aqui
RD_CLIENT_SECRET=seu_client_secret_aqui
```

## 🔧 Como Configurar

### 1. No Vercel:
1. Acesse https://vercel.com/dashboard
2. Vá no seu projeto "form-rhema"
3. Clique em "Settings" > "Environment Variables"
4. Adicione as variáveis acima

### 2. Localmente:
1. Copie o arquivo `.env.example` para `.env`
2. Preencha com suas credenciais reais
3. O arquivo `.env` está no `.gitignore` e não será commitado

## 🚨 Se suas credenciais foram expostas:

1. **REGENERE imediatamente** o Client Secret no RD Station
2. **Atualize** as variáveis de ambiente no Vercel
3. **Não use** as credenciais antigas

## 📍 Onde obter as credenciais:

1. Acesse https://app.rdstation.com.br/integracoes
2. Vá em "Aplicações" > "Minhas Aplicações"
3. Crie ou edite sua aplicação
4. Copie o Client ID e Client Secret

---

**✅ Com as variáveis de ambiente configuradas, o sistema funcionará de forma segura.** 