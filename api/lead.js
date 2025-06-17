// Buscar lead por email na RD Station usando OAuth2
import { getTokenStorage, setTokenStorage } from './auth/status.js';

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

  const { email } = req.query;

  console.log('🔍 Buscando lead:', email);

  if (!email) {
    return res.status(400).json({
      error: 'Email é obrigatório',
      message: 'Parâmetro email é necessário para buscar o lead'
    });
  }

  try {
    // Verificar se existe token de autenticação
    const tokenStorage = getTokenStorage();
    
    if (!tokenStorage) {
      console.log('❌ Token não encontrado - usando dados mock');
      
      // Dados mock para teste quando não há autenticação
      const mockData = {
        'teste@exemplo.com': {
          name: 'João Silva',
          email: 'teste@exemplo.com',
          job_title: 'Gerente de Vendas',
          company: 'Empresa Teste',
          phone: '(11) 99999-9999',
          city: 'São Paulo',
          state: 'SP',
          source: 'Mock Data',
          created_at: '2024-01-15T10:30:00Z',
          last_conversion: '2024-01-20T14:45:00Z'
        },
        'maria@empresa.com.br': {
          name: 'Maria Santos',
          email: 'maria@empresa.com.br',
          job_title: 'Diretora de Marketing',
          company: 'Marketing Pro',
          phone: '(11) 88888-8888',
          city: 'Rio de Janeiro',
          state: 'RJ',
          source: 'Mock Data',
          created_at: '2024-01-10T09:20:00Z',
          last_conversion: '2024-01-18T16:30:00Z'
        }
      };

      const lead = mockData[email.toLowerCase()];
      
      if (lead) {
        console.log('✅ Lead encontrado (mock):', lead.name);
        return res.json({
          found: true,
          lead: lead,
          source: 'mock',
          message: '⚠️ Dados de demonstração (não autenticado com RD Station)'
        });
      } else {
        console.log('❌ Lead não encontrado (mock)');
        return res.status(404).json({
          found: false,
          lead: null,
          source: 'mock',
          message: '❌ Lead não encontrado nos dados de demonstração. Para buscar leads reais, conecte-se ao RD Station.'
        });
      }
    }

    // Verificar se o token ainda é válido
    const now = Date.now();
    if (now >= tokenStorage.expires_at) {
      console.log('⏰ Token expirado');
      return res.status(401).json({
        error: 'Token expirado',
        message: 'Token OAuth2 expirado. Reconecte-se ao RD Station.',
        authenticated: false
      });
    }

    console.log('🔑 Usando token OAuth2 válido para buscar lead');

    // Buscar lead na API real do RD Station
    const searchResponse = await fetch(`https://api.rd.services/platform/contacts?email=${encodeURIComponent(email)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${tokenStorage.access_token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Status da busca RD Station:', searchResponse.status);

    if (searchResponse.status === 401) {
      console.log('❌ Token inválido - removendo da memória');
      setTokenStorage(null);
      return res.status(401).json({
        error: 'Token inválido',
        message: 'Token OAuth2 inválido. Reconecte-se ao RD Station.',
        authenticated: false
      });
    }

    if (searchResponse.status === 404) {
      console.log('❌ Lead não encontrado no RD Station');
      return res.status(404).json({
        found: false,
        lead: null,
        source: 'rd_station',
        message: '❌ Lead não encontrado na sua conta RD Station.'
      });
    }

    if (!searchResponse.ok) {
      const errorData = await searchResponse.json();
      console.error('❌ Erro na API RD Station:', errorData);
      return res.status(searchResponse.status).json({
        error: 'Erro na API RD Station',
        details: errorData,
        message: 'Erro ao buscar lead no RD Station.'
      });
    }

    const data = await searchResponse.json();
    console.log('✅ Resposta da API RD Station:', data);

    if (data.contacts && data.contacts.length > 0) {
      const contact = data.contacts[0];
      const lead = {
        name: contact.name,
        email: contact.email,
        job_title: contact.job_title,
        company: contact.company,
        phone: contact.mobile_phone || contact.phone,
        city: contact.city,
        state: contact.state,
        source: 'RD Station',
        created_at: contact.created_at,
        last_conversion: contact.last_conversion?.created_at || null
      };

      console.log('✅ Lead encontrado no RD Station:', lead.name);
      return res.json({
        found: true,
        lead: lead,
        source: 'rd_station',
        message: '✅ Lead encontrado na sua conta RD Station!'
      });
    } else {
      console.log('❌ Nenhum contato encontrado');
      return res.status(404).json({
        found: false,
        lead: null,
        source: 'rd_station',
        message: '❌ Lead não encontrado na sua conta RD Station.'
      });
    }

  } catch (error) {
    console.error('❌ Erro ao buscar lead:', error);
    return res.status(500).json({
      error: 'Erro interno',
      details: error.message,
      message: 'Erro interno ao buscar lead.'
    });
  }
} 