// Callback OAuth2 do RD Station
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

  const { code, state } = req.query;
  
  console.log('=== CALLBACK OAUTH2 ===');
  console.log('Code:', code);
  console.log('State:', state);
  
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
        <a href="/" class="btn">🔙 Voltar ao Formulário</a>
      </body>
      </html>
    `);
  }
  
  try {
    // Configurações OAuth2
    const RD_CLIENT_ID = 'a0d1c3dc-2b96-4c13-8809-32c7316901e2';
    const RD_CLIENT_SECRET = '8ce6ae66189e46ebbe34dd137324bc4d';
    const REDIRECT_URI = 'https://form-rhema.vercel.app/api/auth/callback';
    
    // Trocar código por access_token
    const tokenResponse = await fetch('https://api.rd.services/auth/token', {
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
    
    const tokenData = await tokenResponse.json();
    console.log('Resposta do token:', tokenData);
    
    if (tokenData.access_token) {
      // Em produção, você salvaria isso em um banco de dados
      // Por agora, vamos apenas confirmar o sucesso
      
      console.log('✅ Token OAuth2 recebido com sucesso!');
      
      res.send(`
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Sucesso OAuth2</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center; }
            .success { background: #d4edda; color: #155724; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .btn { background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px; }
            .token-info { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0; text-align: left; }
          </style>
        </head>
        <body>
          <h1>✅ Autenticação OAuth2 Concluída!</h1>
          <div class="success">
            <h3>Conectado com RD Station com sucesso!</h3>
            <p>Agora o sistema pode buscar seus dados automaticamente.</p>
          </div>
          
          <div class="token-info">
            <h4>📊 Informações do Token:</h4>
            <p><strong>Access Token:</strong> ${tokenData.access_token.substring(0, 20)}...</p>
            <p><strong>Expira em:</strong> ${tokenData.expires_in} segundos</p>
            <p><strong>Scope:</strong> ${tokenData.scope || 'N/A'}</p>
          </div>
          
          <a href="/" class="btn">🔙 Voltar ao Formulário</a>
          
          <script>
            // Redirecionar automaticamente após 5 segundos
            setTimeout(() => {
              window.location.href = '/';
            }, 5000);
          </script>
        </body>
        </html>
      `);
    } else {
      console.error('❌ Erro ao obter token:', tokenData);
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
          <h1>❌ Erro OAuth2</h1>
          <div class="error">
            <p><strong>Erro:</strong> ${tokenData.error_description || 'Erro ao trocar código por token'}</p>
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
        <title>Erro Internal</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center; }
          .error { background: #f8d7da; color: #721c24; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .btn { background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px; }
        </style>
      </head>
      <body>
        <h1>❌ Erro Interno</h1>
        <div class="error">
          <p>Erro ao processar callback OAuth2</p>
          <p><strong>Detalhes:</strong> ${error.message}</p>
        </div>
        <a href="/api/auth/authorize" class="btn">🔄 Tentar Novamente</a>
        <a href="/" class="btn">🔙 Voltar ao Formulário</a>
      </body>
      </html>
    `);
  }
} 