# 🚀 Guia de Deploy - Form Rhema

## 📋 **Pré-requisitos**

1. **Conta no GitHub** (gratuita)
2. **Código na pasta atual** ✅
3. **Node.js funcionando** ✅

---

## 🥇 **OPÇÃO 1: VERCEL (RECOMENDADO)**

### **Passo a Passo:**

#### 1. **Subir código para GitHub**
```bash
# Inicializar Git (se ainda não foi feito)
git init

# Adicionar todos os arquivos
git add .

# Fazer commit
git commit -m "Deploy inicial - Form Rhema com OAuth2 RD Station"

# Criar repositório no GitHub e conectar
git remote add origin https://github.com/SEU_USUARIO/form-rhema.git
git push -u origin main
```

#### 2. **Deploy no Vercel**
1. **Acesse:** [vercel.com](https://vercel.com)
2. **Clique em:** "Sign up" ou "Login" com GitHub
3. **Clique em:** "New Project"
4. **Selecione:** seu repositório `form-rhema`
5. **Configure:**
   - Framework Preset: `Create React App`
   - Build Command: `npm run vercel-build`
   - Output Directory: `build`
6. **Clique em:** "Deploy"

#### 3. **Configurar Variáveis de Ambiente**
1. **No dashboard do Vercel:** Settings → Environment Variables
2. **Adicione:**
   ```
   NODE_ENV = production
   PORT = 3000
   ```

#### 4. **URL Final:**
```
https://form-rhema.vercel.app
```

---

## 🥈 **OPÇÃO 2: RENDER**

### **Passo a Passo:**

#### 1. **Subir código para GitHub** (mesmo do Vercel)

#### 2. **Deploy no Render**
1. **Acesse:** [render.com](https://render.com)
2. **Clique em:** "Sign up" com GitHub
3. **Clique em:** "New +" → "Web Service"
4. **Conecte:** seu repositório `form-rhema`
5. **Configure:**
   - Name: `form-rhema`
   - Runtime: `Node`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run server`

#### 3. **URL Final:**
```
https://form-rhema.onrender.com
```

---

## 🥉 **OPÇÃO 3: NETLIFY + RAILWAY**

### **Frontend (Netlify):**
1. **Acesse:** [netlify.com](https://netlify.com)
2. **Arraste a pasta `build`** para o deploy
3. **Configure:** redirects no arquivo `netlify.toml`

### **Backend (Railway):**
1. **Acesse:** [railway.app](https://railway.app)
2. **Deploy:** apenas a pasta `server/`
3. **Configure:** variáveis de ambiente

---

## ✅ **Verificação Pós-Deploy**

### **Testando a aplicação:**

1. **Frontend funcionando:**
   ```
   https://sua-url.vercel.app
   ```

2. **API funcionando:**
   ```
   https://sua-url.vercel.app/api/auth/status
   ```

3. **OAuth2 funcionando:**
   ```
   https://sua-url.vercel.app/api/dashboard
   ```

4. **Busca de leads:**
   ```
   https://sua-url.vercel.app/api/lead?email=teste@exemplo.com
   ```

---

## 🔧 **Configurações Extras**

### **Domínio Personalizado:**
- **Vercel:** Settings → Domains → Add domain
- **Render:** Settings → Custom Domain

### **HTTPS Automático:**
- ✅ **Vercel:** Automático
- ✅ **Render:** Automático  
- ✅ **Netlify:** Automático

### **Monitoramento:**
- **Logs:** Dashboard de cada plataforma
- **Analytics:** Vercel Analytics (gratuito)

---

## 📱 **Resultado Final**

Depois do deploy você terá:

1. **✅ Site funcionando:** `https://form-rhema.vercel.app`
2. **✅ API OAuth2:** Integração RD Station completa
3. **✅ HTTPS:** Certificado automático
4. **✅ Performance:** CDN global
5. **✅ Zero custo:** Plano gratuito suficiente

---

## 🆘 **Solução de Problemas**

### **Build falhando?**
```bash
# Testar build local
npm run build

# Se der erro, corrigir e tentar novamente
```

### **API não funcionando?**
- Verificar variáveis de ambiente
- Verificar logs do servidor
- Testar endpoints localmente

### **OAuth2 não funcionando?**
- Atualizar URLs de callback no RD Station
- Verificar credenciais
- Testar com dashboard

---

## 🎉 **Pronto!**

Sua aplicação estará **100% funcional** na internet!

**Link para acessar:** Será fornecido após o deploy
**Tempo total:** ~10 minutos 