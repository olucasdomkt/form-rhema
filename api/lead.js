// Buscar lead por email
module.exports = function handler(req, res) {
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
  
  console.log(`Buscando lead com email: ${email}`);
  
  if (!email) {
    return res.status(400).json({ error: 'Email é obrigatório' });
  }
  
  // Dados simulados (fallback) - em produção, aqui você usaria a API do RD Station
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
      tags: ['qualificado', 'alta-prioridade']
    },
    {
      uuid: '550e8400-e29b-41d4-a716-446655440002',
      email: 'lucasbarbosalacerda@gmail.com',
      name: 'Lucas Barbosa',
      job_title: 'Desenvolvedor',
      company: 'Tech Solutions',
      phone: '(11) 97777-7777',
      city: 'São Paulo',
      state: 'SP',
      country: 'Brasil',
      lead_stage: 'Lead',
      opportunity: false,
      created_at: '2024-02-01T09:15:00Z',
      tags: ['desenvolvedor', 'tech']
    }
  ];
  
  const leadSimulado = mockLeads.find(lead => 
    lead.email.toLowerCase() === email.toLowerCase()
  );
  
  if (leadSimulado) {
    console.log('Lead encontrado nos dados simulados:', leadSimulado);
    res.json(leadSimulado);
  } else {
    console.log('Lead não encontrado');
    res.status(404).json({ error: 'Lead não encontrado' });
  }
} 