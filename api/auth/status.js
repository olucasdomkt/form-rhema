// Verificar status da autenticação OAuth2 com RD Station

// Armazenamento temporário em memória - Em produção, use um banco de dados
let tokenStorage = null;

// Função para obter o token (usada pelo callback)
export function getTokenStorage() {
  return tokenStorage;
}

// Função para definir o token (usada pelo callback)
export function setTokenStorage(token) {
  tokenStorage = token;
}

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

  try {
    console.log('🔍 Verificando status OAuth2...');
    
    // Verificar se existe um token armazenado
    if (!tokenStorage) {
      console.log('❌ Nenhum token encontrado');
      return res.json({
        authenticated: false,
        token_info: null,
        message: '❌ Não autenticado. Clique em "Conectar com RD Station" para autenticar.',
        next_step: 'Acesse /api/auth/authorize para iniciar OAuth2'
      });
    }
    
    // Verificar se o token ainda é válido
    const now = Date.now();
    const isExpired = now >= tokenStorage.expires_at;
    
    if (isExpired) {
      console.log('⏰ Token expirado');
      return res.json({
        authenticated: false,
        token_info: {
          expired: true,
          expired_at: new Date(tokenStorage.expires_at).toISOString()
        },
        message: '⏰ Token expirado. Reconecte-se ao RD Station.',
        next_step: 'Acesse /api/auth/authorize para renovar autenticação'
      });
    }
    
    // Token válido
    const timeUntilExpiry = Math.round((tokenStorage.expires_at - now) / (1000 * 60)); // minutos
    console.log('✅ Token válido por mais', timeUntilExpiry, 'minutos');
    
    res.json({
      authenticated: true,
      token_info: {
        expires_in_minutes: timeUntilExpiry,
        expires_at: new Date(tokenStorage.expires_at).toISOString(),
        created_at: new Date(tokenStorage.created_at).toISOString()
      },
      message: '✅ Conectado com RD Station. Sistema pode buscar leads automaticamente.',
      next_step: null
    });
    
  } catch (error) {
    console.error('❌ Erro ao verificar status:', error);
    res.status(500).json({
      authenticated: false,
      error: error.message,
      message: '❌ Erro ao verificar status de autenticação.',
      next_step: 'Tente novamente'
    });
  }
} 