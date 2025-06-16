export const RD_STATION_CONFIG = {
  clientId: process.env.REACT_APP_RD_CLIENT_ID || '',
  clientSecret: process.env.REACT_APP_RD_CLIENT_SECRET || '',
  redirectUri: process.env.REACT_APP_RD_REDIRECT_URI || '',
  apiUrl: 'https://api.rd.services',
  publicApiUrl: 'https://api.rdstation.com/api/1.3',
  baseUrl: process.env.REACT_APP_BASE_URL || 'http://localhost:3000'
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
