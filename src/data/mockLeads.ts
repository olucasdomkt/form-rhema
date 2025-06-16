// Dados simulados de leads para teste
export const mockLeads = [
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
  },
  {
    uuid: '550e8400-e29b-41d4-a716-446655440003',
    email: 'ana@consultoria.com',
    name: 'Ana Costa',
    job_title: 'Consultora',
    company: 'Costa Consultoria',
    phone: '(31) 96666-6666',
    city: 'Belo Horizonte',
    state: 'MG',
    country: 'Brasil',
    lead_stage: 'Qualified Lead',
    opportunity: true,
    created_at: '2024-01-20T16:45:00Z',
    tags: ['consultoria', 'qualificado']
  }
];

export const findLeadByEmail = (email: string) => {
  return mockLeads.find(lead => 
    lead.email.toLowerCase() === email.toLowerCase()
  );
}; 