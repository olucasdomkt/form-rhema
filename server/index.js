  tokenUrl: 'https://api.rd.services/auth/token'
};

// Para testes, vamos usar sempre o callback local
const testConfig = {
  ...oauth2Config,
  redirectUri: 'http://127.0.0.1:4000/auth/callback'
};

// Configuração alternativa para usar o endpoint rdstation-callback
const rdCallbackConfig = {
  ...oauth2Config,
  redirectUri: 'http://127.0.0.1:4000/rdstation-callback'
};

// Endpoint para processar código OAuth2 (via API)
app.post('/auth/process-code', async (req, res) => {
  try {
    console.log('=== PROCESSANDO CÓDIGO OAUTH2 VIA API ===');
    const { code, state } = req.body;
    
    console.log('Code:', code);
    console.log('State:', state);
    
    if (!code) {
      return res.status(400).json({ 
        success: false, 
        error: 'Código OAuth2 não fornecido' 
      });
    }
    
    // Trocar código por access_token
    const tokenResponse = await fetch(oauth2Config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: oauth2Config.clientId,
        client_secret: oauth2Config.clientSecret,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: oauth2Config.redirectUri
      })
    });
    
    const tokenData = await tokenResponse.json();
    console.log('Resposta do token:', tokenData);
    
    if (tokenData.access_token) {
      // Armazenar token (em produção, use um banco de dados)
      global.rdToken = {
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: Date.now() + (tokenData.expires_in * 1000),
        created_at: new Date().toISOString()
      };
      
      console.log('✅ Token armazenado com sucesso!');
      
      res.json({ 
        success: true, 
        message: 'Autenticação OAuth2 concluída com sucesso!',
        token_info: {
          expires_in: tokenData.expires_in,
          scope: tokenData.scope
        }
      });
    } else {
      console.error('❌ Erro ao obter token:', tokenData);
      res.status(400).json({ 
        success: false, 
        error: tokenData.error_description || 'Erro ao trocar código por token' 
      });
    }
  } catch (error) {
    console.error('❌ Erro no processamento:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    });
  }
});

// OAuth2 - Iniciar autorização (produção)
app.get('/auth/authorize', (req, res) => {
  console.log('=== INICIANDO OAUTH2 ===');
  const state = 'security_token_123';
  const authUrl = `${oauth2Config.authUrl}?client_id=${oauth2Config.clientId}&redirect_uri=${encodeURIComponent(oauth2Config.redirectUri)}&response_type=code&state=${state}`;
  
  console.log('Redirecionando para:', authUrl);
  res.redirect(authUrl);
});

// OAuth2 - Iniciar autorização (desenvolvimento local)
app.get('/auth/authorize-local', (req, res) => {
  console.log('=== INICIANDO OAUTH2 (DESENVOLVIMENTO LOCAL) ===');
  const state = 'security_token_dev_123';
  const authUrl = `${testConfig.authUrl}?client_id=${testConfig.clientId}&redirect_uri=${encodeURIComponent(testConfig.redirectUri)}&response_type=code&state=${state}`;
  
  console.log('Redirecionamento local para:', authUrl);
  res.redirect(authUrl);
});

// OAuth2 - Iniciar autorização (usando rdstation-callback)
app.get('/auth/authorize-rdcallback', (req, res) => {
  console.log('=== INICIANDO OAUTH2 (RD CALLBACK) ===');
  const state = 'security_token_rd_123';
  const authUrl = `${rdCallbackConfig.authUrl}?client_id=${rdCallbackConfig.clientId}&redirect_uri=${encodeURIComponent(rdCallbackConfig.redirectUri)}&response_type=code&state=${state}`;
  
  console.log('Redirecionamento para rdstation-callback:', authUrl);
  res.redirect(authUrl);
});

// OAuth2 - Callback (desenvolvimento)
app.get('/auth/callback', async (req, res) => {
  console.log('=== CALLBACK OAUTH2 ===');
  const { code, state } = req.query;
  
  console.log('Code:', code);
  console.log('State:', state);
  
  if (!code) {
    return res.status(400).send(`
      <h1>❌ Erro OAuth2</h1>
      <p>Código de autorização não recebido.</p>
      <a href="/dashboard">🔙 Voltar ao Dashboard</a>
    `);
  }
  
  try {
    // Processar o código usando a mesma lógica do endpoint POST
    const tokenResponse = await fetch(testConfig.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: testConfig.clientId,
        client_secret: testConfig.clientSecret,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: testConfig.redirectUri
      })
    });
    
    const tokenData = await tokenResponse.json();
    console.log('Resposta do token (callback):', tokenData);
    
    if (tokenData.access_token) {
      global.rdToken = {
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: Date.now() + (tokenData.expires_in * 1000),
        created_at: new Date().toISOString()
      };
      
      console.log('✅ Token armazenado via callback!');
      
      res.send(`
        <h1>✅ Autenticação OAuth2 Concluída!</h1>
        <p><strong>Access Token recebido:</strong> ${tokenData.access_token.substring(0, 20)}...</p>
        <p><strong>Expira em:</strong> ${tokenData.expires_in} segundos</p>
        <p><strong>Scope:</strong> ${tokenData.scope || 'N/A'}</p>
        <br>
        <a href="/dashboard" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          🔙 Voltar ao Dashboard
        </a>
        <script>
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 3000);
        </script>
      `);
    } else {
      console.error('❌ Erro no token via callback:', tokenData);
      res.status(400).send(`
        <h1>❌ Erro OAuth2</h1>
        <p><strong>Erro:</strong> ${tokenData.error_description || 'Erro ao trocar código por token'}</p>
        <a href="/dashboard">🔙 Tentar Novamente</a>
      `);
    }
  } catch (error) {
    console.error('❌ Erro no callback:', error);
    res.status(500).send(`
      <h1>❌ Erro Internal</h1>
      <p>Erro ao processar callback OAuth2</p>
      <a href="/dashboard">🔙 Voltar ao Dashboard</a>
    `);
  }
});

// Verificar status da autenticação
app.get('/auth/status', (req, res) => {
  const isAuthenticated = global.rdToken && global.rdToken.access_token && 
                          global.rdToken.expires_at > Date.now();
  
  res.json({
    authenticated: isAuthenticated,
    token_info: isAuthenticated ? {
      expires_at: new Date(global.rdToken.expires_at).toISOString(),
      created_at: global.rdToken.created_at
    } : null
  });
});

// Endpoint para buscar lead por email
app.get('/lead', async (req, res) => {
  const { email } = req.query;
  
  console.log(`Buscando lead com email: ${email}`);
  
  if (!email) {
    return res.status(400).json({ error: 'Email é obrigatório' });
  }
  
  // Verificar se temos token válido
  const hasValidToken = global.rdToken && 
                       global.rdToken.access_token && 
                       global.rdToken.expires_at > Date.now();
  
  if (hasValidToken) {
    try {
      console.log('=== USANDO TOKEN REAL RD STATION ===');
      
      // Fazer requisição real para API do RD Station
      const response = await fetch(`https://api.rd.services/platform/contacts/email:${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${global.rdToken.access_token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        const leadData = await response.json();
        console.log('Lead encontrado via API real:', leadData);
        return res.json(leadData);
      } else if (response.status === 404) {
        console.log('Lead não encontrado na API real');
        return res.status(404).json({ error: 'Lead não encontrado' });
      } else {
        console.error('Erro na API do RD Station:', response.status, response.statusText);
        // Continuar para fallback
      }
    } catch (error) {
      console.error('Erro ao buscar lead na API real:', error);
      // Continuar para fallback
    }
  }
  
  // Fallback: usar dados simulados
  console.log('=== USANDO DADOS SIMULADOS (FALLBACK) ===');
  
  const leadSimulado = mockLeads.find(lead => lead.email.toLowerCase() === email.toLowerCase());
  
  if (leadSimulado) {
    console.log('Lead encontrado nos dados simulados:', leadSimulado);
    res.json(leadSimulado);
  } else {
    console.log('Lead não encontrado');
    res.status(404).json({ error: 'Lead não encontrado' });
  }
});

// Página de teste que simula o site do RD Station
app.get('/contato-teste', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>RD Station - Página de Contato (TESTE)</title>
        <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
            .btn { background: #007bff; color: white; padding: 12px 24px; border: none; border-radius: 5px; cursor: pointer; text-decoration: none; display: inline-block; margin: 10px 5px; }
            .btn:hover { background: #0056b3; }
            .success { background: #d4edda; padding: 15px; border-radius: 5px; color: #155724; margin: 20px 0; }
            .error { background: #f8d7da; padding: 15px; border-radius: 5px; color: #721c24; margin: 20px 0; }
            .loading { background: #fff3cd; padding: 15px; border-radius: 5px; color: #856404; margin: 20px 0; }
            #status { margin: 20px 0; }
            input[type="email"] { padding: 10px; border: 1px solid #ddd; border-radius: 4px; width: 300px; margin-right: 10px; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🚀 RD Station - Página de Contato (TESTE)</h1>
            <p>Esta é uma página de teste que simula a página real onde será implementada a integração OAuth2.</p>
        </div>

        <div id="status"></div>

        <h2>🔗 Integração OAuth2 RD Station Marketing</h2>
        
        <button id="btnAuth" class="btn" onclick="iniciarAutenticacao()">
            🔑 Conectar com RD Station Marketing
        </button>

        <h3>🔍 Buscar Lead</h3>
        <input type="email" id="emailBusca" placeholder="Digite o email para buscar" value="teste@exemplo.com">
        <button class="btn" onclick="buscarLead()">🔍 Buscar Lead</button>
        
        <div id="resultadoBusca"></div>

        <h3>📊 Status da Autenticação</h3>
        <button class="btn" onclick="verificarStatus()">🔄 Verificar Status</button>
        <div id="statusAuth"></div>

        <script>
        // Função para iniciar autenticação OAuth2
        function iniciarAutenticacao() {
            const authUrl = 'http://127.0.0.1:4000/auth/authorize-local';
            
            document.getElementById('status').innerHTML = 
                '<div class="loading">🔄 Redirecionando para autenticação...</div>';
            
            // Redirecionar para autenticação
            window.location.href = authUrl;
        }

        // Processar callback do RD Station (se houver código na URL)
        document.addEventListener('DOMContentLoaded', function() {
            const urlParams = new URLSearchParams(window.location.search);
            const code = urlParams.get('code');
            const state = urlParams.get('state');
            
            if (code && state) {
                console.log('Código OAuth2 recebido:', code);
                
                document.getElementById('status').innerHTML = 
                    '<div class="loading">🔄 Processando autenticação...</div>';
                
                // Enviar código para nossa API
                fetch('http://127.0.0.1:4000/auth/process-code', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({ code, state })
                })
                .then(response => response.json())
                .then(data => {
                    console.log('Autenticação concluída:', data);
                    
                    if (data.success) {
                        document.getElementById('status').innerHTML = 
                            '<div class="success">✅ Autenticação OAuth2 concluída com sucesso!</div>';
                        
                        // Limpar URL removendo parâmetros OAuth2
                        window.history.replaceState({}, document.title, window.location.pathname);
                        
                        // Verificar status após autenticação
                        setTimeout(verificarStatus, 1000);
                    } else {
                        console.error('Erro na autenticação:', data);
                        document.getElementById('status').innerHTML = 
                            '<div class="error">❌ Erro na autenticação: ' + data.error + '</div>';
                    }
                })
                .catch(error => {
                    console.error('Erro ao processar autenticação:', error);
                    document.getElementById('status').innerHTML = 
                        '<div class="error">❌ Erro ao conectar com a API</div>';
                });
            }
            
            // Verificar status inicial
            verificarStatus();
        });

        // Função para buscar lead
        function buscarLead() {
            const email = document.getElementById('emailBusca').value;
            
            if (!email) {
                alert('Digite um email para buscar');
                return;
            }
            
            document.getElementById('resultadoBusca').innerHTML = 
                '<div class="loading">🔄 Buscando lead...</div>';
            
            fetch(\`http://127.0.0.1:4000/lead?email=\${encodeURIComponent(email)}\`)
                .then(response => response.json())
                .then(data => {
                    console.log('Resultado da busca:', data);
                    
                    if (data.error) {
                        document.getElementById('resultadoBusca').innerHTML = 
                            '<div class="error">❌ ' + data.error + '</div>';
                    } else {
                        document.getElementById('resultadoBusca').innerHTML = 
                            '<div class="success">' +
                            '<h4>📋 Lead Encontrado:</h4>' +
                            '<p><strong>Nome:</strong> ' + data.name + '</p>' +
                            '<p><strong>Email:</strong> ' + data.email + '</p>' +
                            '<p><strong>Empresa:</strong> ' + data.company + '</p>' +
                            '<p><strong>Cargo:</strong> ' + data.job_title + '</p>' +
                            '<p><strong>Status:</strong> ' + data.lead_stage + '</p>' +
                            '<p><strong>Oportunidade:</strong> ' + (data.opportunity ? 'Sim' : 'Não') + '</p>' +
                            '</div>';
                    }
                })
                .catch(error => {
                    console.error('Erro ao buscar lead:', error);
                    document.getElementById('resultadoBusca').innerHTML = 
                        '<div class="error">❌ Erro na busca</div>';
                });
        }

        // Função para verificar status
        function verificarStatus() {
            fetch('http://127.0.0.1:4000/auth/status')
                .then(response => response.json())
                .then(data => {
                    console.log('Status:', data);
                    
                    if (data.authenticated) {
                        document.getElementById('statusAuth').innerHTML = 
                            '<div class="success">' +
                            '<h4>✅ Autenticado com RD Station</h4>' +
                            '<p><strong>Token criado em:</strong> ' + new Date(data.token_info.created_at).toLocaleString() + '</p>' +
                            '<p><strong>Token expira em:</strong> ' + new Date(data.token_info.expires_at).toLocaleString() + '</p>' +
                            '</div>';
                    } else {
                        document.getElementById('statusAuth').innerHTML = 
                            '<div class="error">❌ Não autenticado. Clique em "Conectar com RD Station" para autenticar.</div>';
                    }
                })
                .catch(error => {
                    console.error('Erro ao verificar status:', error);
                    document.getElementById('statusAuth').innerHTML = 
                        '<div class="error">❌ Erro ao verificar status</div>';
                });
        }
        </script>
    </body>
    </html>
  `);
});

// Página que simula o callback oficial do RD Station
app.get('/rdstation-callback', (req, res) => {
  const { code, state } = req.query;
  
  res.send(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>RD Station - Processando Autenticação</title>
        <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
            .success { background: #d4edda; padding: 15px; border-radius: 5px; color: #155724; margin: 20px 0; }
            .error { background: #f8d7da; padding: 15px; border-radius: 5px; color: #721c24; margin: 20px 0; }
            .loading { background: #fff3cd; padding: 15px; border-radius: 5px; color: #856404; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🔑 RD Station - Processando OAuth2</h1>
            <p>Aguarde, estamos processando sua autenticação...</p>
        </div>

        <div id="status" class="loading">🔄 Processando código de autorização...</div>

        <script>
        const code = '${code}';
        const state = '${state}';
        
        if (code && state) {
            console.log('Código OAuth2 recebido:', code);
            
            // Enviar código para nossa API
            fetch('http://127.0.0.1:4000/auth/process-code', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ code, state })
            })
            .then(response => response.json())
            .then(data => {
                console.log('Autenticação concluída:', data);
                
                if (data.success) {
                    document.getElementById('status').className = 'success';
                    document.getElementById('status').innerHTML = 
                        '✅ Autenticação OAuth2 concluída com sucesso!<br>' +
                        'Redirecionando para o dashboard...';
                    
                    // Redirecionar para dashboard após 2 segundos
                    setTimeout(() => {
                        window.location.href = 'http://127.0.0.1:4000/dashboard';
                    }, 2000);
                } else {
                    console.error('Erro na autenticação:', data);
                    document.getElementById('status').className = 'error';
                    document.getElementById('status').innerHTML = 
                        '❌ Erro na autenticação: ' + data.error;
                }
            })
            .catch(error => {
                console.error('Erro ao processar autenticação:', error);
                document.getElementById('status').className = 'error';
                document.getElementById('status').innerHTML = 
                    '❌ Erro ao conectar com a API';
            });
        } else {
            document.getElementById('status').className = 'error';
            document.getElementById('status').innerHTML = 
                '❌ Código de autorização não recebido';
        }
        </script>
    </body>
    </html>
  `);
});

// Rota catch-all para React Router em produção
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'build', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log('=================================');
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log('');
  console.log('=== OAUTH2 RD STATION MARKETING ===');
  console.log('1. Autenticar: /auth/authorize');
  console.log('2. Status: /auth/status');
  console.log('3. Buscar Lead: /lead?email=...');
  console.log('');
  console.log('=== EMAILS DE TESTE (FALLBACK) ===');
  console.log('- teste@exemplo.com');
  console.log('- maria@empresa.com.br');
  console.log('=================================');
}); 
};

// Para testes, vamos usar sempre o callback local
const testConfig = {
  ...oauth2Config,
  redirectUri: 'http://127.0.0.1:4000/auth/callback'
};

// Configuração alternativa para usar o endpoint rdstation-callback
const rdCallbackConfig = {
  ...oauth2Config,
  redirectUri: 'http://127.0.0.1:4000/rdstation-callback'
};

// Endpoint para processar código OAuth2 (via API)
app.post('/auth/process-code', async (req, res) => {
  try {
    console.log('=== PROCESSANDO CÓDIGO OAUTH2 VIA API ===');
    const { code, state } = req.body;
    
    console.log('Code:', code);
    console.log('State:', state);
    
    if (!code) {
      return res.status(400).json({ 
        success: false, 
        error: 'Código OAuth2 não fornecido' 
      });
    }
    
    // Trocar código por access_token
    const tokenResponse = await fetch(oauth2Config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: oauth2Config.clientId,
        client_secret: oauth2Config.clientSecret,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: oauth2Config.redirectUri
      })
    });
    
    const tokenData = await tokenResponse.json();
    console.log('Resposta do token:', tokenData);
    
    if (tokenData.access_token) {
      // Armazenar token (em produção, use um banco de dados)
      global.rdToken = {
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: Date.now() + (tokenData.expires_in * 1000),
        created_at: new Date().toISOString()
      };
      
      tokenStorage = global.rdToken;
      
      console.log('✅ Token armazenado com sucesso!');
      
      res.json({ 
        success: true, 
        message: 'Autenticação OAuth2 concluída com sucesso!',
        token_info: {
          expires_in: tokenData.expires_in,
          scope: tokenData.scope
        }
      });
    } else {
      console.error('❌ Erro ao obter token:', tokenData);
      res.status(400).json({ 
        success: false, 
        error: tokenData.error_description || 'Erro ao trocar código por token' 
      });
    }
  } catch (error) {
    console.error('❌ Erro no processamento:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    });
  }
});

// OAuth2 - Iniciar autorização (produção)
app.get('/auth/authorize', (req, res) => {
  console.log('=== INICIANDO OAUTH2 ===');
  const state = 'security_token_123';
  const authUrl = `${oauth2Config.authUrl}?client_id=${oauth2Config.clientId}&redirect_uri=${encodeURIComponent(oauth2Config.redirectUri)}&response_type=code&state=${state}`;
  
  console.log('Redirecionando para:', authUrl);
  res.redirect(authUrl);
});

// OAuth2 - Iniciar autorização (desenvolvimento local)
app.get('/auth/authorize-local', (req, res) => {
  console.log('=== INICIANDO OAUTH2 (DESENVOLVIMENTO LOCAL) ===');
  const state = 'security_token_dev_123';
  const authUrl = `${testConfig.authUrl}?client_id=${testConfig.clientId}&redirect_uri=${encodeURIComponent(testConfig.redirectUri)}&response_type=code&state=${state}`;
  
  console.log('Redirecionamento local para:', authUrl);
  res.redirect(authUrl);
});

// OAuth2 - Iniciar autorização (usando rdstation-callback)
app.get('/auth/authorize-rdcallback', (req, res) => {
  console.log('=== INICIANDO OAUTH2 (RD CALLBACK) ===');
  const state = 'security_token_rd_123';
  const authUrl = `${rdCallbackConfig.authUrl}?client_id=${rdCallbackConfig.clientId}&redirect_uri=${encodeURIComponent(rdCallbackConfig.redirectUri)}&response_type=code&state=${state}`;
  
  console.log('Redirecionamento para rdstation-callback:', authUrl);
  res.redirect(authUrl);
});

// OAuth2 - Callback (desenvolvimento)
app.get('/auth/callback', async (req, res) => {
  console.log('=== CALLBACK OAUTH2 ===');
  const { code, state } = req.query;
  
  console.log('Code:', code);
  console.log('State:', state);
  
  if (!code) {
    return res.status(400).send(`
      <h1>❌ Erro OAuth2</h1>
      <p>Código de autorização não recebido.</p>
      <a href="/dashboard">🔙 Voltar ao Dashboard</a>
    `);
  }
  
  try {
    // Processar o código usando a mesma lógica do endpoint POST
    const tokenResponse = await fetch(testConfig.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: testConfig.clientId,
        client_secret: testConfig.clientSecret,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: testConfig.redirectUri
      })
    });
    
    const tokenData = await tokenResponse.json();
import express from 'express';
    console.log('Resposta do token (callback):', tokenData);
    
    if (tokenData.access_token) {
      global.rdToken = {
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: Date.now() + (tokenData.expires_in * 1000),
        created_at: new Date().toISOString()
      };
      
      tokenStorage = global.rdToken;
      
      console.log('✅ Token armazenado via callback!');
      
      res.send(`
        <h1>✅ Autenticação OAuth2 Concluída!</h1>
        <p><strong>Access Token recebido:</strong> ${tokenData.access_token.substring(0, 20)}...</p>
        <p><strong>Expira em:</strong> ${tokenData.expires_in} segundos</p>
        <p><strong>Scope:</strong> ${tokenData.scope || 'N/A'}</p>
        <br>
        <a href="/dashboard" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          🔙 Voltar ao Dashboard
        </a>
        <script>
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 3000);
        </script>
      `);
    } else {
      console.error('❌ Erro no token via callback:', tokenData);
      res.status(400).send(`
        <h1>❌ Erro OAuth2</h1>
        <p><strong>Erro:</strong> ${tokenData.error_description || 'Erro ao trocar código por token'}</p>
        <a href="/dashboard">🔙 Tentar Novamente</a>
      `);
    }
  } catch (error) {
    console.error('❌ Erro no callback:', error);
    res.status(500).send(`
      <h1>❌ Erro Internal</h1>
      <p>Erro ao processar callback OAuth2</p>
      <a href="/dashboard">🔙 Voltar ao Dashboard</a>
    `);
  }
});

// Verificar status da autenticação
app.get('/auth/status', (req, res) => {
  const isAuthenticated = global.rdToken && global.rdToken.access_token && 
                          global.rdToken.expires_at > Date.now();
  
  res.json({
    authenticated: isAuthenticated,
    token_info: isAuthenticated ? {
      expires_at: new Date(global.rdToken.expires_at).toISOString(),
      created_at: global.rdToken.created_at
    } : null
  });
});

// Endpoint para buscar lead por email
app.get('/lead', async (req, res) => {
  const { email } = req.query;
  
  console.log(`Buscando lead com email: ${email}`);
  
  if (!email) {
    return res.status(400).json({ error: 'Email é obrigatório' });
  }
  
  // Verificar se temos token válido
  const hasValidToken = global.rdToken && 
                       global.rdToken.access_token && 
                       global.rdToken.expires_at > Date.now();
  
  if (hasValidToken) {
    try {
      console.log('=== USANDO TOKEN REAL RD STATION ===');
      
      // Fazer requisição real para API do RD Station
      const response = await fetch(`https://api.rd.services/platform/contacts/email:${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${global.rdToken.access_token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        const leadData = await response.json();
        console.log('Lead encontrado via API real:', leadData);
        return res.json(leadData);
      } else if (response.status === 404) {
        console.log('Lead não encontrado na API real');
        return res.status(404).json({ error: 'Lead não encontrado' });
      } else {
        console.error('Erro na API do RD Station:', response.status, response.statusText);
        // Continuar para fallback
      }
    } catch (error) {
import axios from 'axios';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Credenciais RD Station
const RD_CLIENT_ID = 'a0d1c3dc-2b96-4c13-8809-32c7316901e2';
const RD_CLIENT_SECRET = '8ce6ae66189e46ebbe34dd137324bc4d';
const REDIRECT_URI = 'https://www.rdstation.com/contato';

// URLs de desenvolvimento e produção
const DEVELOPMENT_CALLBACK = 'http://127.0.0.1:4000/auth/callback';
const PRODUCTION_CALLBACK = 'https://www.rdstation.com/contato';

// Armazenamento temporário de tokens (em produção, use banco de dados)
let tokenStorage = {
  access_token: null,
  refresh_token: null,
  expires_at: null
};

// Middleware
app.use(cors({
  origin: [
    'https://form-rhema.vercel.app',
    'http://localhost:3000', 
    'http://localhost:3001', 
    'http://127.0.0.1:3000', 
    'http://127.0.0.1:3001'
  ],
  credentials: true
}));

app.use(express.json());

// Middleware para log das requisições
app.use((req, res, next) => {
  console.log('Nova requisição:', {
    method: req.method,
    url: req.url,
    headers: req.headers
  });
  next();
});

// Servir arquivos estáticos do React em produção
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '..', 'build')));
}

// Dados simulados para demonstração (fallback)
const mockLeads = [
  {
    uuid: '550e8400-e29b-41d4-a716-446655440000',
    email: 'teste@exemplo.com',
    name: 'João Silva',
    job_title: 'Gerente de Marketing',
    company: 'Empresa Exemplo LTDA',
    phone: '(11) 99999-9999',
    city: 'São Paulo',
    state: 'SP',
    country: 'Brasil',
    lead_stage: 'Lead',
    opportunity: false,
    created_at: '2024-01-15T10:30:00Z',
    last_marked_opportunity_at: null,
    tags: ['marketing', 'interessado']
  },
  {
    uuid: '550e8400-e29b-41d4-a716-446655440001',
    email: 'maria@empresa.com.br',
    name: 'Maria Santos',
    job_title: 'Diretora Comercial',
    company: 'Santos & Associados',
    phone: '(21) 88888-8888',
    city: 'Rio de Janeiro',
    state: 'RJ',
    country: 'Brasil',
    lead_stage: 'Qualified Lead',
    opportunity: true,
    created_at: '2024-01-10T14:15:00Z',
    last_marked_opportunity_at: '2024-01-20T09:00:00Z',
    tags: ['qualificado', 'alta-prioridade']
  }
];

// Função para verificar se o token é válido
function isTokenValid() {
  if (!tokenStorage.access_token || !tokenStorage.expires_at) {
    return false;
  }
  return Date.now() < tokenStorage.expires_at;
}

// Função para renovar o access_token usando refresh_token
async function refreshAccessToken() {
  if (!tokenStorage.refresh_token) {
    throw new Error('Refresh token não disponível');
  }

  try {
    console.log('Renovando access_token...');
    const response = await axios.post(
      'https://api.rd.services/auth/token',
      {
        client_id: RD_CLIENT_ID,
        client_secret: RD_CLIENT_SECRET,
        refresh_token: tokenStorage.refresh_token,
        grant_type: 'refresh_token'
      },
      {
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    );

    const data = response.data;
    tokenStorage.access_token = data.access_token;
    tokenStorage.refresh_token = data.refresh_token;
    tokenStorage.expires_at = Date.now() + (data.expires_in * 1000);

    console.log('Token renovado com sucesso!');
    return tokenStorage.access_token;
  } catch (error) {
    console.error('Erro ao renovar token:', error.response?.data);
    throw error;
  }
}

// Rota de teste
app.get('/', (req, res) => {
  const authStatus = isTokenValid() ? 'Autenticado' : 'Não autenticado';
  res.json({ 
    message: 'Servidor funcionando!',
    status: 'OK',
    rdstation_integration: 'OAuth2 implementado',
    auth_status: authStatus,
    actions: {
      authorize: 'GET /auth/authorize - Iniciar autenticação OAuth2',
      status: 'GET /auth/status - Verificar status da autenticação',
      search: 'GET /lead?email=... - Buscar lead (requer autenticação)',
      dashboard: 'GET /dashboard - Interface de autenticação'
    }
  });
});

// Dashboard HTML para gerenciar autenticação
app.get('/dashboard', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>RD Station OAuth2 - Dashboard</title>
        <style>
            body { font-family: Arial, sans-serif; max-width: 1000px; margin: 0 auto; padding: 20px; }
            .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
            .card { background: white; border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin: 15px 0; }
            .btn { background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; text-decoration: none; display: inline-block; margin: 5px; }
            .btn:hover { background: #0056b3; }
            .btn-success { background: #28a745; }
            .btn-warning { background: #ffc107; color: #212529; }
            .btn-danger { background: #dc3545; }
            .status { padding: 10px; border-radius: 5px; margin: 10px 0; }
            .success { background: #d4edda; color: #155724; }
            .error { background: #f8d7da; color: #721c24; }
            .warning { background: #fff3cd; color: #856404; }
            pre { background: #f8f9fa; padding: 15px; border-radius: 5px; overflow-x: auto; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
            @media (max-width: 768px) { .grid { grid-template-columns: 1fr; } }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🚀 RD Station OAuth2 - Dashboard de Gerenciamento</h1>
            <p>Interface para gerenciar a integração OAuth2 com RD Station Marketing</p>
        </div>

        <div class="card">
            <h2>🎯 Links Importantes</h2>
            <div style="margin: 15px 0;">
                <a href="/contato-teste" class="btn btn-success">
                    🧪 Página de Teste (Simula RD Station)
                </a>
                <a href="/dashboard" class="btn">🔄 Atualizar Dashboard</a>
            </div>
        </div>

        <div class="grid">
            <div class="card">
                <h2>🔐 Autenticação OAuth2</h2>
                <div id="authStatus">Carregando...</div>
                
                <h3>Opções de Autenticação:</h3>
                <a href="/auth/authorize" class="btn">
                    🌐 Autenticar (Produção)
                </a>
                <a href="/auth/authorize-local" class="btn btn-warning">
                    🔧 Autenticar (Local)
                </a>
                <a href="/auth/authorize-rdcallback" class="btn btn-success">
                    🚀 Autenticar (RD Callback)
                </a>
                
                <h3>Status:</h3>
                <button onclick="verificarStatus()" class="btn">📊 Verificar Status</button>
            </div>
            
            <div class="card">
                <h2>🔍 Teste de Busca de Lead</h2>
                <input type="email" id="emailTeste" placeholder="Email para buscar" 
                       value="teste@exemplo.com" style="padding: 8px; width: 250px; margin-right: 10px;">
                <button onclick="buscarLead()" class="btn">🔍 Buscar</button>
                
                <div id="resultadoLead" style="margin-top: 15px;"></div>
                
                <h3>📋 Emails de Teste:</h3>
                <ul>
                    <li><code>teste@exemplo.com</code> - João Silva</li>
                    <li><code>maria@empresa.com.br</code> - Maria Santos</li>
                </ul>
            </div>
        </div>

        <div class="card">
            <h2>📡 Configuração Atual</h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 15px;">
                <div>
                    <h4>🔑 Credenciais:</h4>
                    <p><strong>Client ID:</strong> <code>a0d1c3dc-2b96-4c13-8809-32c7316901e2</code></p>
                    <p><strong>Callback Produção:</strong> <code>https://www.rdstation.com/contato</code></p>
                    <p><strong>Callback Desenvolvimento:</strong> <code>http://127.0.0.1:4000/auth/callback</code></p>
                </div>
                <div>
                    <h4>🌐 Endpoints da API:</h4>
                    <p><strong>Status:</strong> <code>/auth/status</code></p>
                    <p><strong>Buscar Lead:</strong> <code>/lead?email=...</code></p>
                    <p><strong>Processar Código:</strong> <code>/auth/process-code</code></p>
                </div>
            </div>
        </div>

        <script>
        // Verificar status da autenticação
        function verificarStatus() {
            fetch('/auth/status')
                .then(response => response.json())
                .then(data => {
                    const statusDiv = document.getElementById('authStatus');
                    
                    if (data.authenticated) {
                        statusDiv.innerHTML = 
                            '<div class="status success">' +
                            '<h4>✅ Autenticado com RD Station</h4>' +
                            '<p><strong>Token criado em:</strong> ' + new Date(data.token_info.created_at).toLocaleString() + '</p>' +
                            '<p><strong>Token expira em:</strong> ' + new Date(data.token_info.expires_at).toLocaleString() + '</p>' +
                            '</div>';
                    } else {
                        statusDiv.innerHTML = 
                            '<div class="status warning">' +
                            '<p>❌ Não autenticado. Use um dos botões acima para autenticar.</p>' +
                            '</div>';
                    }
                })
                .catch(error => {
                    console.error('Erro:', error);
                    document.getElementById('authStatus').innerHTML = 
                        '<div class="status error">❌ Erro ao verificar status</div>';
                });
        }

        // Buscar lead
        function buscarLead() {
            const email = document.getElementById('emailTeste').value;
            const resultDiv = document.getElementById('resultadoLead');
            
            if (!email) {
                alert('Digite um email para buscar');
                return;
            }
            
            resultDiv.innerHTML = '<div class="status warning">🔄 Buscando...</div>';
            
            fetch(\`/lead?email=\${encodeURIComponent(email)}\`)
                .then(response => response.json())
                .then(data => {
                    if (data.error) {
                        resultDiv.innerHTML = 
                            '<div class="status error">❌ ' + data.error + '</div>';
                    } else {
                        resultDiv.innerHTML = 
                            '<div class="status success">' +
                            '<h4>📋 Lead Encontrado:</h4>' +
                            '<p><strong>Nome:</strong> ' + data.name + '</p>' +
                            '<p><strong>Email:</strong> ' + data.email + '</p>' +
                            '<p><strong>Empresa:</strong> ' + data.company + '</p>' +
                            '<p><strong>Cargo:</strong> ' + data.job_title + '</p>' +
                            '<p><strong>Status:</strong> ' + data.lead_stage + '</p>' +
                            '<p><strong>Oportunidade:</strong> ' + (data.opportunity ? 'Sim' : 'Não') + '</p>' +
                            '</div>';
                    }
                })
                .catch(error => {
                    console.error('Erro:', error);
                    resultDiv.innerHTML = 
                        '<div class="status error">❌ Erro na busca</div>';
                });
        }

        // Verificar status inicial
        verificarStatus();
        
        // Atualizar status a cada 30 segundos
        setInterval(verificarStatus, 30000);
        </script>
    </body>
    </html>
  `);
});

// Configurações OAuth2
const oauth2Config = {
  clientId: 'a0d1c3dc-2b96-4c13-8809-32c7316901e2',
  clientSecret: '8ce6ae66189e46ebbe34dd137324bc4d',
  redirectUri: process.env.NODE_ENV === 'production' 
    ? 'https://www.rdstation.com/contato'
    : 'http://127.0.0.1:4000/auth/callback',
  authUrl: 'https://api.rd.services/auth/dialog',
  tokenUrl: 'https://api.rd.services/auth/token'
};

// Para testes, vamos usar sempre o callback local
const testConfig = {
  ...oauth2Config,
  redirectUri: 'http://127.0.0.1:4000/auth/callback'
};

// Configuração alternativa para usar o endpoint rdstation-callback
const rdCallbackConfig = {
  ...oauth2Config,
  redirectUri: 'http://127.0.0.1:4000/rdstation-callback'
};

// Endpoint para processar código OAuth2 (via API)
app.post('/auth/process-code', async (req, res) => {
  try {
    console.log('=== PROCESSANDO CÓDIGO OAUTH2 VIA API ===');
    const { code, state } = req.body;
    
    console.log('Code:', code);
    console.log('State:', state);
    
    if (!code) {
      return res.status(400).json({ 
        success: false, 
        error: 'Código OAuth2 não fornecido' 
      });
    }
    
    // Trocar código por access_token
    const tokenResponse = await fetch(oauth2Config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: oauth2Config.clientId,
        client_secret: oauth2Config.clientSecret,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: oauth2Config.redirectUri
      })
    });
    
    const tokenData = await tokenResponse.json();
    console.log('Resposta do token:', tokenData);
    
    if (tokenData.access_token) {
      // Armazenar token (em produção, use um banco de dados)
      global.rdToken = {
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: Date.now() + (tokenData.expires_in * 1000),
        created_at: new Date().toISOString()
      };
      
      console.log('✅ Token armazenado com sucesso!');
      
      res.json({ 
        success: true, 
        message: 'Autenticação OAuth2 concluída com sucesso!',
        token_info: {
          expires_in: tokenData.expires_in,
          scope: tokenData.scope
        }
      });
    } else {
      console.error('❌ Erro ao obter token:', tokenData);
      res.status(400).json({ 
        success: false, 
        error: tokenData.error_description || 'Erro ao trocar código por token' 
      });
    }
  } catch (error) {
    console.error('❌ Erro no processamento:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    });
  }
});

// OAuth2 - Iniciar autorização (produção)
app.get('/auth/authorize', (req, res) => {
  console.log('=== INICIANDO OAUTH2 ===');
  const state = 'security_token_123';
  const authUrl = `${oauth2Config.authUrl}?client_id=${oauth2Config.clientId}&redirect_uri=${encodeURIComponent(oauth2Config.redirectUri)}&response_type=code&state=${state}`;
  
  console.log('Redirecionando para:', authUrl);
  res.redirect(authUrl);
});

// OAuth2 - Iniciar autorização (desenvolvimento local)
app.get('/auth/authorize-local', (req, res) => {
  console.log('=== INICIANDO OAUTH2 (DESENVOLVIMENTO LOCAL) ===');
  const state = 'security_token_dev_123';
  const authUrl = `${testConfig.authUrl}?client_id=${testConfig.clientId}&redirect_uri=${encodeURIComponent(testConfig.redirectUri)}&response_type=code&state=${state}`;
  
  console.log('Redirecionamento local para:', authUrl);
  res.redirect(authUrl);
});

// OAuth2 - Iniciar autorização (usando rdstation-callback)
app.get('/auth/authorize-rdcallback', (req, res) => {
  console.log('=== INICIANDO OAUTH2 (RD CALLBACK) ===');
  const state = 'security_token_rd_123';
  const authUrl = `${rdCallbackConfig.authUrl}?client_id=${rdCallbackConfig.clientId}&redirect_uri=${encodeURIComponent(rdCallbackConfig.redirectUri)}&response_type=code&state=${state}`;
  
  console.log('Redirecionamento para rdstation-callback:', authUrl);
  res.redirect(authUrl);
});

// OAuth2 - Callback (desenvolvimento)
app.get('/auth/callback', async (req, res) => {
  console.log('=== CALLBACK OAUTH2 ===');
  const { code, state } = req.query;
  
  console.log('Code:', code);
  console.log('State:', state);
  
  if (!code) {
    return res.status(400).send(`
      <h1>❌ Erro OAuth2</h1>
      <p>Código de autorização não recebido.</p>
      <a href="/dashboard">🔙 Voltar ao Dashboard</a>
    `);
  }
  
  try {
    // Processar o código usando a mesma lógica do endpoint POST
    const tokenResponse = await fetch(testConfig.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: testConfig.clientId,
        client_secret: testConfig.clientSecret,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: testConfig.redirectUri
      })
    });
    
    const tokenData = await tokenResponse.json();
    console.log('Resposta do token (callback):', tokenData);
    
    if (tokenData.access_token) {
      global.rdToken = {
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: Date.now() + (tokenData.expires_in * 1000),
        created_at: new Date().toISOString()
      };
      
      console.log('✅ Token armazenado via callback!');
      
      res.send(`
        <h1>✅ Autenticação OAuth2 Concluída!</h1>
        <p><strong>Access Token recebido:</strong> ${tokenData.access_token.substring(0, 20)}...</p>
        <p><strong>Expira em:</strong> ${tokenData.expires_in} segundos</p>
        <p><strong>Scope:</strong> ${tokenData.scope || 'N/A'}</p>
        <br>
        <a href="/dashboard" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          🔙 Voltar ao Dashboard
        </a>
        <script>
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 3000);
        </script>
      `);
    } else {
      console.error('❌ Erro no token via callback:', tokenData);
      res.status(400).send(`
        <h1>❌ Erro OAuth2</h1>
        <p><strong>Erro:</strong> ${tokenData.error_description || 'Erro ao trocar código por token'}</p>
        <a href="/dashboard">🔙 Tentar Novamente</a>
      `);
    }
  } catch (error) {
    console.error('❌ Erro no callback:', error);
    res.status(500).send(`
      <h1>❌ Erro Internal</h1>
      <p>Erro ao processar callback OAuth2</p>
      <a href="/dashboard">🔙 Voltar ao Dashboard</a>
    `);
  }
});

// Verificar status da autenticação
app.get('/auth/status', (req, res) => {
  const isAuthenticated = isTokenValid();
      console.error('Erro ao buscar lead na API real:', error);
      // Continuar para fallback
    }
  }
  
  // Fallback: usar dados simulados
  console.log('=== USANDO DADOS SIMULADOS (FALLBACK) ===');
  
  const leadSimulado = mockLeads.find(lead => lead.email.toLowerCase() === email.toLowerCase());
  
  if (leadSimulado) {
    console.log('Lead encontrado nos dados simulados:', leadSimulado);
    res.json(leadSimulado);
  } else {
    console.log('Lead não encontrado');
    res.status(404).json({ error: 'Lead não encontrado' });
  }
});

// Página de teste que simula o site do RD Station
app.get('/contato-teste', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>RD Station - Página de Contato (TESTE)</title>
        <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
            .btn { background: #007bff; color: white; padding: 12px 24px; border: none; border-radius: 5px; cursor: pointer; text-decoration: none; display: inline-block; margin: 10px 5px; }
            .btn:hover { background: #0056b3; }
            .success { background: #d4edda; padding: 15px; border-radius: 5px; color: #155724; margin: 20px 0; }
            .error { background: #f8d7da; padding: 15px; border-radius: 5px; color: #721c24; margin: 20px 0; }
            .loading { background: #fff3cd; padding: 15px; border-radius: 5px; color: #856404; margin: 20px 0; }
            #status { margin: 20px 0; }
            input[type="email"] { padding: 10px; border: 1px solid #ddd; border-radius: 4px; width: 300px; margin-right: 10px; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🚀 RD Station - Página de Contato (TESTE)</h1>
            <p>Esta é uma página de teste que simula a página real onde será implementada a integração OAuth2.</p>
        </div>

        <div id="status"></div>

        <h2>🔗 Integração OAuth2 RD Station Marketing</h2>
        
        <button id="btnAuth" class="btn" onclick="iniciarAutenticacao()">
            🔑 Conectar com RD Station Marketing
        </button>

        <h3>🔍 Buscar Lead</h3>
        <input type="email" id="emailBusca" placeholder="Digite o email para buscar" value="teste@exemplo.com">
        <button class="btn" onclick="buscarLead()">🔍 Buscar Lead</button>
        
        <div id="resultadoBusca"></div>

        <h3>📊 Status da Autenticação</h3>
        <button class="btn" onclick="verificarStatus()">🔄 Verificar Status</button>
        <div id="statusAuth"></div>

        <script>
        // Função para iniciar autenticação OAuth2
        function iniciarAutenticacao() {
            const authUrl = 'http://127.0.0.1:4000/auth/authorize-local';
            
            document.getElementById('status').innerHTML = 
                '<div class="loading">🔄 Redirecionando para autenticação...</div>';
            
            // Redirecionar para autenticação
            window.location.href = authUrl;
        }

        // Processar callback do RD Station (se houver código na URL)
        document.addEventListener('DOMContentLoaded', function() {
            const urlParams = new URLSearchParams(window.location.search);
            const code = urlParams.get('code');
            const state = urlParams.get('state');
            
            if (code && state) {
                console.log('Código OAuth2 recebido:', code);
                
                document.getElementById('status').innerHTML = 
                    '<div class="loading">🔄 Processando autenticação...</div>';
                
                // Enviar código para nossa API
                fetch('http://127.0.0.1:4000/auth/process-code', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({ code, state })
                })
                .then(response => response.json())
                .then(data => {
                    console.log('Autenticação concluída:', data);
                    
                    if (data.success) {
                        document.getElementById('status').innerHTML = 
                            '<div class="success">✅ Autenticação OAuth2 concluída com sucesso!</div>';
                        
                        // Limpar URL removendo parâmetros OAuth2
                        window.history.replaceState({}, document.title, window.location.pathname);
                        
                        // Verificar status após autenticação
                        setTimeout(verificarStatus, 1000);
                    } else {
                        console.error('Erro na autenticação:', data);
                        document.getElementById('status').innerHTML = 
                            '<div class="error">❌ Erro na autenticação: ' + data.error + '</div>';
                    }
                })
                .catch(error => {
                    console.error('Erro ao processar autenticação:', error);
                    document.getElementById('status').innerHTML = 
                        '<div class="error">❌ Erro ao conectar com a API</div>';
                });
            }
            
            // Verificar status inicial
            verificarStatus();
        });

        // Função para buscar lead
        function buscarLead() {
            const email = document.getElementById('emailBusca').value;
            
            if (!email) {
                alert('Digite um email para buscar');
                return;
            }
            
            document.getElementById('resultadoBusca').innerHTML = 
                '<div class="loading">🔄 Buscando lead...</div>';
            
            fetch(\`http://127.0.0.1:4000/lead?email=\${encodeURIComponent(email)}\`)
                .then(response => response.json())
                .then(data => {
                    console.log('Resultado da busca:', data);
                    
                    if (data.error) {
                        document.getElementById('resultadoBusca').innerHTML = 
                            '<div class="error">❌ ' + data.error + '</div>';
                    } else {
                        document.getElementById('resultadoBusca').innerHTML = 
                            '<div class="success">' +
                            '<h4>📋 Lead Encontrado:</h4>' +
                            '<p><strong>Nome:</strong> ' + data.name + '</p>' +
                            '<p><strong>Email:</strong> ' + data.email + '</p>' +
                            '<p><strong>Empresa:</strong> ' + data.company + '</p>' +
                            '<p><strong>Cargo:</strong> ' + data.job_title + '</p>' +
                            '<p><strong>Status:</strong> ' + data.lead_stage + '</p>' +
                            '<p><strong>Oportunidade:</strong> ' + (data.opportunity ? 'Sim' : 'Não') + '</p>' +
                            '</div>';
                    }
                })
                .catch(error => {
                    console.error('Erro ao buscar lead:', error);
                    document.getElementById('resultadoBusca').innerHTML = 
                        '<div class="error">❌ Erro na busca</div>';
                });
        }

        // Função para verificar status
        function verificarStatus() {
            fetch('http://127.0.0.1:4000/auth/status')
                .then(response => response.json())
                .then(data => {
                    console.log('Status:', data);
                    
                    if (data.authenticated) {
                        document.getElementById('statusAuth').innerHTML = 
                            '<div class="success">' +
                            '<h4>✅ Autenticado com RD Station</h4>' +
                            '<p><strong>Token criado em:</strong> ' + new Date(data.token_info.created_at).toLocaleString() + '</p>' +
                            '<p><strong>Token expira em:</strong> ' + new Date(data.token_info.expires_at).toLocaleString() + '</p>' +
                            '</div>';
                    } else {
                        document.getElementById('statusAuth').innerHTML = 
                            '<div class="error">❌ Não autenticado. Clique em "Conectar com RD Station" para autenticar.</div>';
                    }
                })
                .catch(error => {
                    console.error('Erro ao verificar status:', error);
                    document.getElementById('statusAuth').innerHTML = 
                        '<div class="error">❌ Erro ao verificar status</div>';
                });
        }
        </script>
    </body>
    </html>
  `);
});

// Página que simula o callback oficial do RD Station
app.get('/rdstation-callback', (req, res) => {
  const { code, state } = req.query;
  
  res.send(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>RD Station - Processando Autenticação</title>
        <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
            .success { background: #d4edda; padding: 15px; border-radius: 5px; color: #155724; margin: 20px 0; }
            .error { background: #f8d7da; padding: 15px; border-radius: 5px; color: #721c24; margin: 20px 0; }
            .loading { background: #fff3cd; padding: 15px; border-radius: 5px; color: #856404; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🔑 RD Station - Processando OAuth2</h1>
            <p>Aguarde, estamos processando sua autenticação...</p>
        </div>

        <div id="status" class="loading">🔄 Processando código de autorização...</div>

        <script>
        const code = '${code}';
        const state = '${state}';
        
        if (code && state) {
            console.log('Código OAuth2 recebido:', code);
            
            // Enviar código para nossa API
            fetch('http://127.0.0.1:4000/auth/process-code', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ code, state })
            })
            .then(response => response.json())
            .then(data => {
                console.log('Autenticação concluída:', data);
                
                if (data.success) {
                    document.getElementById('status').className = 'success';
                    document.getElementById('status').innerHTML = 
                        '✅ Autenticação OAuth2 concluída com sucesso!<br>' +
                        'Redirecionando para o dashboard...';
                    
                    // Redirecionar para dashboard após 2 segundos
                    setTimeout(() => {
                        window.location.href = 'http://127.0.0.1:4000/dashboard';
                    }, 2000);
                } else {
                    console.error('Erro na autenticação:', data);
                    document.getElementById('status').className = 'error';
                    document.getElementById('status').innerHTML = 
                        '❌ Erro na autenticação: ' + data.error;
                }
            })
            .catch(error => {
                console.error('Erro ao processar autenticação:', error);
                document.getElementById('status').className = 'error';
                document.getElementById('status').innerHTML = 
                    '❌ Erro ao conectar com a API';
            });
        } else {
            document.getElementById('status').className = 'error';
            document.getElementById('status').innerHTML = 
                '❌ Código de autorização não recebido';
        }
        </script>
    </body>
    </html>
  `);
});

// Rota catch-all para React Router em produção
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'build', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log('=================================');
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log('');
  console.log('=== OAUTH2 RD STATION MARKETING ===');
  console.log('1. Autenticar: /auth/authorize');
  console.log('2. Status: /auth/status');
  console.log('3. Buscar Lead: /lead?email=...');
  console.log('');
  console.log('=== EMAILS DE TESTE (FALLBACK) ===');
  console.log('- teste@exemplo.com');
  console.log('- maria@empresa.com.br');
  console.log('=================================');
}); 