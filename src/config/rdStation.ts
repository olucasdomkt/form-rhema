export const RD_STATION_CONFIG = {
  clientId: process.env.REACT_APP_RD_CLIENT_ID || 'a0d1c3dc-2b96-4c13-8809-32c7316901e2',
  clientSecret: process.env.REACT_APP_RD_CLIENT_SECRET || '8ce6ae66189e46ebbe34dd137324bc4d',
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
