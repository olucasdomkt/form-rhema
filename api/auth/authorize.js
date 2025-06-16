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

  // Configurações OAuth2 RD Station
  const RD_CLIENT_ID = 'a0d1c3dc-2b96-4c13-8809-32c7316901e2';
  const REDIRECT_URI = 'https://form-rhema.vercel.app/api/auth/callback';
  
  // Gerar state para segurança
  const state = 'rd_auth_' + Date.now();
  
  // URL de autorização do RD Station
  const authUrl = `https://api.rd.services/auth/dialog?client_id=${RD_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&state=${state}`;
  
  console.log('🔑 Redirecionando para OAuth2:', authUrl);
  
  // Redirecionar para RD Station
  res.redirect(authUrl);
} 