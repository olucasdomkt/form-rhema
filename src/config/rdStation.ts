export const RD_STATION_CONFIG = {
  clientId: process.env.REACT_APP_RD_CLIENT_ID || '',
  clientSecret: process.env.REACT_APP_RD_CLIENT_SECRET || '',
  redirectUri: process.env.REACT_APP_RD_REDIRECT_URI || 'https://form-rhema.vercel.app/auth/callback',
  apiUrl: 'https://api.rd.services',
  publicApiUrl: 'https://api.rdstation.com/api/1.3',
  baseUrl: process.env.REACT_APP_BASE_URL || 'https://form-rhema.vercel.app'
};

export const RD_STATION_ENDPOINTS = {
  token: '/auth/token',
  contacts: '/platform/contacts',
  events: '/platform/events'
};

// Função para obter URL de autorização
export const getAuthorizationUrl = () => {
  const params = new URLSearchParams({
    client_id: RD_STATION_CONFIG.clientId,
    redirect_uri: RD_STATION_CONFIG.redirectUri,
    response_type: 'code'
  });
  
  return `https://api.rd.services/auth/dialog?${params.toString()}`;
};

// Função para verificar se existe autenticação salva
export const hasValidAuth = (): boolean => {
  const authSuccess = localStorage.getItem('rd_oauth_success');
  const authTimestamp = localStorage.getItem('rd_oauth_timestamp');
  
  if (!authSuccess || !authTimestamp) return false;
  
  // Verificar se a autenticação é recente (menos de 1 hora)
  const oneHour = 60 * 60 * 1000;
  const isRecent = (Date.now() - parseInt(authTimestamp)) < oneHour;
  
  return authSuccess === 'true' && isRecent;
};

// Função para limpar autenticação
export const clearAuth = (): void => {
  localStorage.removeItem('rd_oauth_success');
  localStorage.removeItem('rd_oauth_code');
  localStorage.removeItem('rd_oauth_timestamp');
};
