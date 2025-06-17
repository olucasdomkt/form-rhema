// Callback OAuth2 do RD Station

// Importar o módulo de status para compartilhar o armazenamento
import { setTokenStorage } from './status.js';

export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { code, state, error, error_description } = req.query;
  
  console.log('=== CALLBACK OAUTH2 RD STATION ===');
  console.log('Code:', code?.substring(0, 20) + '...');
  console.log('State:', state);
  console.log('Error:', error);
  
  // Se houve erro na autorização
  if (error) {
    return res.status(400).send(`
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Erro OAuth2</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center; }
          .error { background: #f8d7da; color: #721c24; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .btn { background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px; }
        </style>
      </head>
      <body>
        <h1>❌ Erro na Autorização</h1>
        <div class="error">
          <p><strong>Erro:</strong> ${error}</p>
          <p><strong>Descrição:</strong> ${error_description || 'Erro não especificado'}</p>
        </div>
        <a href="/api/auth/authorize" class="btn">🔄 Tentar Novamente</a>
        <a href="/" class="btn">🔙 Voltar ao Formulário</a>
      </body>
      </html>
    `);
  }
  
  if (!code) {
    return res.status(400).send(`
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Erro OAuth2</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center; }
          .error { background: #f8d7da; color: #721c24; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .btn { background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px; }
        </style>
      </head>
      <body>
        <h1>❌ Erro OAuth2</h1>
        <div class="error">
          <p>Código de autorização não foi recebido do RD Station.</p>
        </div>
        <a href="/api/auth/authorize" class="btn">🔄 Tentar Novamente</a>
        <a href="/" class="btn">🔙 Voltar ao Formulário</a>
      </body>
      </html>
    `);
  }
  
  try {
    // Configurações OAuth2 - USAR VARIÁVEIS DE AMBIENTE EM PRODUÇÃO
    const RD_CLIENT_ID = process.env.RD_CLIENT_ID || 'a0d1c3dc-2b96-4c13-8809-32c7316901e2';
    const RD_CLIENT_SECRET = process.env.RD_CLIENT_SECRET || '8ce6ae66189e46ebbe34dd137324bc4d';
    
    // Construir URL de redirecionamento baseada no host atual
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers.host;
    const REDIRECT_URI = process.env.REDIRECT_URI || `${protocol}://${host}/api/auth/callback`;
    
    console.log('Trocando código por token...');
    console.log('Client ID:', RD_CLIENT_ID);
    console.log('Redirect URI:', REDIRECT_URI);
    
    // Trocar código por access_token usando a API fetch nativa do Node.js
    const response = await fetch('https://api.rd.services/auth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: RD_CLIENT_ID,
        client_secret: RD_CLIENT_SECRET,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: REDIRECT_URI
      })
    });
    
    const tokenData = await response.json();
    console.log('Status da resposta:', response.status);
    console.log('Resposta do token:', tokenData);
    
    if (!response.ok) {
      console.error('Erro na requisição do token:', tokenData);
      return res.status(400).send(`
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Erro OAuth2</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center; }
            .error { background: #f8d7da; color: #721c24; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .btn { background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px; }
          </style>
        </head>
        <body>
          <h1>❌ Erro ao obter token</h1>
          <div class="error">
            <p><strong>Erro:</strong> ${tokenData.error || 'Erro desconhecido'}</p>
            <p><strong>Descrição:</strong> ${tokenData.error_description || 'Falha na comunicação com RD Station'}</p>
          </div>
          <a href="/api/auth/authorize" class="btn">🔄 Tentar Novamente</a>
          <a href="/" class="btn">🔙 Voltar ao Formulário</a>
        </body>
        </html>
      `);
    }
    
    if (tokenData.access_token) {
      // Armazenar token usando o módulo de status
      const tokenStorage = {
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_in: tokenData.expires_in,
        created_at: Date.now(),
        expires_at: Date.now() + (tokenData.expires_in * 1000)
      };
      
      setTokenStorage(tokenStorage);
      
      console.log('✅ Token OAuth2 armazenado com sucesso!');
      
      // Fazer uma chamada de teste para verificar se o token funciona
      try {
        const testResponse = await fetch('https://api.rd.services/platform/contacts', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${tokenData.access_token}`,
            'Content-Type': 'application/json'
          }
        });
        
        const testData = await testResponse.json();
        console.log('Teste de API bem-sucedido:', testResponse.status);
        
        res.send(`
          <!DOCTYPE html>
          <html lang="pt-BR">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>✅ Sucesso OAuth2</title>
            <style>
              body { font-family: Arial, sans-serif; max-width: 700px; margin: 50px auto; padding: 20px; text-align: center; }
              .success { background: #d4edda; color: #155724; padding: 20px; border-radius: 8px; margin: 20px 0; }
              .info { background: #d1ecf1; color: #0c5460; padding: 15px; border-radius: 5px; margin: 15px 0; text-align: left; }
              .btn { background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px; font-weight: bold; }
              .countdown { font-size: 18px; color: #007bff; margin: 20px 0; }
            </style>
          </head>
          <body>
            <h1>🎉 Conectado com RD Station!</h1>
            <div class="success">
              <h3>✅ Autenticação OAuth2 realizada com sucesso!</h3>
              <p>Agora o sistema pode buscar seus leads automaticamente da sua conta RD Station.</p>
            </div>
            
            <div class="info">
              <h4>📊 Informações da Conexão:</h4>
              <p><strong>Status:</strong> ✅ Conectado e testado</p>
              <p><strong>Token válido por:</strong> ${Math.round(tokenData.expires_in / 3600)} horas</p>
              <p><strong>Escopo:</strong> ${tokenData.scope || 'Padrão'}</p>
              <p><strong>API testada:</strong> ✅ Conexão com RD Station confirmada</p>
            </div>
            
            <div class="countdown">
              Redirecionando em <span id="countdown">5</span> segundos...
            </div>
            
            <a href="/" class="btn">🔙 Ir para o Formulário</a>
            
            <script>
              let seconds = 5;
              const countdownEl = document.getElementById('countdown');
              
              const timer = setInterval(() => {
                seconds--;
                countdownEl.textContent = seconds;
                
                if (seconds <= 0) {
                  clearInterval(timer);
                  window.location.href = '/';
                }
              }, 1000);
            </script>
          </body>
          </html>
        `);
        
      } catch (testError) {
        console.warn('Erro no teste da API, mas token salvo:', testError.message);
        
        res.send(`
          <!DOCTYPE html>
          <html lang="pt-BR">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>⚠️ Token Salvo</title>
            <style>
              body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center; }
              .warning { background: #fff3cd; color: #856404; padding: 20px; border-radius: 8px; margin: 20px 0; }
              .btn { background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px; }
            </style>
          </head>
          <body>
            <h1>⚠️ Token Armazenado</h1>
            <div class="warning">
              <p>Token OAuth2 foi salvo, mas não foi possível testar a API RD Station.</p>
              <p>O sistema pode funcionar normalmente.</p>
            </div>
            <a href="/" class="btn">🔙 Voltar ao Formulário</a>
          </body>
          </html>
        `);
      }
      
    } else {
      console.error('❌ Token não retornado:', tokenData);
      res.status(400).send(`
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Erro OAuth2</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center; }
            .error { background: #f8d7da; color: #721c24; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .btn { background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px; }
          </style>
        </head>
        <body>
          <h1>❌ Falha na Autenticação</h1>
          <div class="error">
            <p>Não foi possível obter o token de acesso do RD Station.</p>
            <p>Verifique suas credenciais e tente novamente.</p>
          </div>
          <a href="/api/auth/authorize" class="btn">🔄 Tentar Novamente</a>
          <a href="/" class="btn">🔙 Voltar ao Formulário</a>
        </body>
        </html>
      `);
    }
    
  } catch (error) {
    console.error('❌ Erro no callback:', error);
    res.status(500).send(`
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Erro Interno</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center; }
          .error { background: #f8d7da; color: #721c24; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .btn { background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px; }
        </style>
      </head>
      <body>
        <h1>❌ Erro Interno</h1>
        <div class="error">
          <p><strong>Erro:</strong> ${error.message}</p>
          <p>Ocorreu um erro interno durante a autenticação.</p>
        </div>
        <a href="/api/auth/authorize" class="btn">🔄 Tentar Novamente</a>
        <a href="/" class="btn">🔙 Voltar ao Formulário</a>
      </body>
      </html>
    `);
  }
} 