// Iniciar autenticação OAuth2 com RD Station
export default function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Configurações OAuth2 RD Station - USAR VARIÁVEIS DE AMBIENTE EM PRODUÇÃO
  const RD_CLIENT_ID = process.env.RD_CLIENT_ID || 'a0d1c3dc-2b96-4c13-8809-32c7316901e2';
  
  // Construir URL de redirecionamento baseada no host atual
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers.host;
  const REDIRECT_URI = process.env.REDIRECT_URI || `${protocol}://${host}/api/auth/callback`;
  
  // Gerar state para segurança
  const state = 'rd_auth_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  
  // URL de autorização do RD Station
  const authUrl = `https://api.rd.services/auth/dialog?client_id=${RD_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&state=${state}`;
  
  console.log('🔑 Iniciando OAuth2 RD Station');
  console.log('Client ID:', RD_CLIENT_ID);
  console.log('Redirect URI:', REDIRECT_URI);
  console.log('State:', state);
  console.log('Auth URL:', authUrl);
  
  // Redirecionar para RD Station
  res.redirect(authUrl);
} 