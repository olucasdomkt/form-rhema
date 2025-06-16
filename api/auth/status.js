// Verificar status da autenticação OAuth2 com RD Station
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

  // Por enquanto, simular que não está autenticado
  // Em produção, você verificaria se existe um token válido armazenado
  const isAuthenticated = false;
  
  res.json({
    authenticated: isAuthenticated,
    token_info: null,
    message: '❌ Não autenticado. Clique em "Conectar com RD Station" para autenticar.',
    next_step: 'Acesse /api/auth/authorize para iniciar OAuth2'
  });
} 