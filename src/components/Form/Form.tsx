import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import InputMask from 'react-input-mask';
import {
  Box,
  Stack,
  Input,
  Textarea,
  Button,
  Heading,
  Text,
  SimpleGrid,
  VStack,
  HStack,
} from '@chakra-ui/react';
import { estados } from '../../data/estados';

type FormData = {
  email: string;
  nome: string;
  whatsapp: string;
  faixaEtaria: string;
  estado: string;
  graduacao: string;
  escolaridade?: string;
  terminoGraduacao?: string;
  inicioPos?: string;
  clubeRhema?: string;
  motivoSemInteresse?: string;
  cursosOnline?: string;
  psicopedagogo?: string;
  indicacao: number;
  dificuldade: string;
};

export const Form: React.FC = () => {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>();
  const [isSearching, setIsSearching] = useState(false);
  const [toastMessage, setToastMessage] = useState<string>('');

  const graduacao = watch('graduacao');
  const inicioPos = watch('inicioPos');
  const terminoGraduacao = watch('terminoGraduacao');

  const [selectedNps, setSelectedNps] = useState<number | undefined>(undefined);

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setToastMessage(`${type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️'} ${message}`);
    setTimeout(() => setToastMessage(''), 5000);
  };

  const getNpsEmoji = (value: number) => {
    if (value >= 9) return '😊';
    if (value >= 7) return '😐';
    return '😞';
  };

  const getNpsColor = (value: number) => {
    if (value >= 9) return '#48BB78';
    if (value >= 7) return '#ED8936';
    return '#F56565';
  };

  const getNpsLabel = (value: number) => {
    if (value >= 9) return 'Muito satisfeito';
    if (value >= 7) return 'Satisfeito';
    return 'Insatisfeito';
  };

  const getNpsDescription = (value: number) => {
    if (value >= 9) return 'Você está muito satisfeito e provavelmente indicaria nossos eventos para amigos';
    if (value >= 7) return 'Você está satisfeito, mas ainda há espaço para melhorias';
    return 'Você está insatisfeito e provavelmente não indicaria nossos eventos';
  };

  const onSubmit = (data: FormData) => {
    const finalData = {
      ...data,
      indicacao: selectedNps || 5
    };
    console.log('📋 Dados do formulário completo:', finalData);
    showToast('Formulário enviado! Em breve entraremos em contato.', 'success');
  };

  const handleNpsClick = (nota: number) => {
    setSelectedNps(nota);
    setValue('indicacao', nota);
  };

  const searchLead = async (email: string) => {
    if (!email || !email.includes('@')) return;

    try {
      setIsSearching(true);
      console.log('🔍 Buscando lead:', email);
      
      const response = await fetch(`/api/lead?email=${encodeURIComponent(email)}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Resposta da API:', data);
        
        if (data.found && data.lead) {
          const lead = data.lead;
          
          if (lead.name) setValue('nome', lead.name);
          if (lead.phone) setValue('whatsapp', lead.phone);
          if (lead.state) setValue('estado', lead.state);
          
          const sourceText = data.source === 'rd_station' ? 'RD Station' : 
                            data.source === 'mock' ? 'dados de demonstração' : data.source;
          
          showToast(`Dados encontrados! Lead "${lead.name}" carregado de ${sourceText}`, 'success');
          
        } else {
          console.log('❌ Lead não encontrado');
          showToast('Nenhum dado encontrado para este email em nossa base', 'info');
        }
        
      } else {
        const errorData = await response.json();
        console.log('❌ Erro na busca:', errorData);
        
        if (response.status === 404) {
          showToast('Email não encontrado em nossa base', 'info');
        } else if (response.status === 401) {
          showToast('Problema na conexão com RD Station. Verifique a integração.', 'warning');
        } else {
          showToast('Erro ao buscar dados do lead', 'error');
        }
      }

    } catch (error) {
      console.error('❌ Erro na busca:', error);
      showToast('Erro de conexão ao buscar dados', 'error');
    } finally {
      setIsSearching(false);
    }
  };

  const handleEmailBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const email = e.target.value;
    if (email && email.includes('@')) {
      searchLead(email);
    }
  };

  const fieldStyle = {
    marginBottom: '1.5rem'
  };

  const labelStyle = {
    display: 'block',
    fontWeight: 'bold',
    marginBottom: '0.5rem',
    color: '#2D3748'
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid #E2E8F0',
    borderRadius: '8px',
    fontSize: '16px',
    backgroundColor: 'white'
  };

  const errorStyle = {
    color: '#E53E3E',
    fontSize: '14px',
    marginTop: '4px'
  };

  const radioStyle = {
    margin: '8px 0'
  };

  return (
    <Box 
      p={8} 
      maxWidth="800px" 
      margin="0 auto"
      bg="white"
      borderRadius="xl"
      boxShadow="xl"
      minH="100vh"
    >
      <Stack gap={8}>
        <VStack gap={4}>
          <Heading size="lg" textAlign="center" color="blue.600">📝 Formulário de Inscrição</Heading>
          <Text textAlign="center" color="gray.600">Preencha o formulário abaixo para iniciar sua jornada conosco.</Text>
        </VStack>

        {/* Toast personalizado */}
        {toastMessage && (
          <Box 
            p={4} 
            bg="blue.50" 
            borderRadius="md" 
            border="1px solid" 
            borderColor="blue.200"
            textAlign="center"
          >
            <Text color="blue.800">{toastMessage}</Text>
          </Box>
        )}

        {/* Info sobre integração RD Station */}
        <Box p={4} bg="blue.50" borderRadius="md" border="1px solid" borderColor="blue.200">
          <VStack gap={3} align="start">
            <Text fontWeight="bold" color="blue.800">🔗 Integração RD Station</Text>
            <Text fontSize="sm" color="blue.700">
              Sistema configurado para buscar dados automaticamente. Digite seu email e aguarde a busca.
            </Text>
            <Text fontSize="xs" color="blue.600">
              📧 Emails de teste: teste@exemplo.com, maria@empresa.com.br
            </Text>
            <Button 
              size="sm" 
              colorScheme="blue" 
              variant="outline"
              onClick={() => window.open('/admin', '_blank')}
            >
              ⚙️ Configurar RD Station
            </Button>
          </VStack>
        </Box>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack gap={6}>
            {/* Email */}
            <div style={fieldStyle}>
              <label style={labelStyle}>📧 Seu melhor e-mail *</label>
              <Input
                type="email"
                {...register('email', { 
                  required: 'Email é obrigatório',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Digite um email válido'
                  }
                })}
                placeholder="seu@email.com"
                onBlur={handleEmailBlur}
                disabled={isSearching}
                size="lg"
              />
              {isSearching && (
                <Text fontSize="sm" color="blue.500" mt={1}>
                  🔍 Buscando seus dados...
                </Text>
              )}
              {errors.email && (
                <div style={errorStyle}>
                  {errors.email.message}
                </div>
              )}
            </div>

            {/* Nome */}
            <div style={fieldStyle}>
              <label style={labelStyle}>👤 Nome completo *</label>
              <Input
                {...register('nome', { 
                  required: 'Nome é obrigatório',
                  minLength: { value: 2, message: 'Nome deve ter pelo menos 2 caracteres' }
                })}
                placeholder="Seu nome completo"
                size="lg"
              />
              {errors.nome && (
                <div style={errorStyle}>
                  {errors.nome.message}
                </div>
              )}
            </div>

            {/* WhatsApp */}
            <div style={fieldStyle}>
              <label style={labelStyle}>📱 Seu WhatsApp *</label>
              <Input
                as={InputMask}
                mask="(99) 99999-9999"
                {...register('whatsapp', { required: 'WhatsApp é obrigatório' })}
                placeholder="(00) 00000-0000"
                size="lg"
              />
              {errors.whatsapp && (
                <div style={errorStyle}>
                  {errors.whatsapp.message}
                </div>
              )}
            </div>

            {/* Faixa Etária */}
            <div style={fieldStyle}>
              <label style={labelStyle}>🎂 Qual a sua faixa etária? *</label>
              <select 
                {...register('faixaEtaria', { required: 'Selecione sua faixa etária' })}
                style={{...inputStyle, borderColor: errors.faixaEtaria ? '#E53E3E' : '#E2E8F0'}}
              >
                <option value="">Selecione uma opção</option>
                <option value="18-24">De 18 a 24 anos</option>
                <option value="25-30">De 25 a 30 anos</option>
                <option value="31-35">De 31 a 35 anos</option>
                <option value="36-40">De 36 a 40 anos</option>
                <option value="41-45">De 41 a 45 anos</option>
                <option value="46-50">De 45 a 50 anos</option>
                <option value="51-55">De 51 a 55 anos</option>
                <option value="56+">56 anos ou mais</option>
              </select>
              {errors.faixaEtaria && (
                <div style={errorStyle}>
                  {errors.faixaEtaria.message}
                </div>
              )}
            </div>

            {/* Estado */}
            <div style={fieldStyle}>
              <label style={labelStyle}>📍 Em qual estado você mora? *</label>
              <select 
                {...register('estado', { required: 'Selecione seu estado' })}
                style={{...inputStyle, borderColor: errors.estado ? '#E53E3E' : '#E2E8F0'}}
              >
                <option value="">Selecione um estado</option>
                {estados.map((estado) => (
                  <option key={estado.sigla} value={estado.sigla}>
                    {estado.nome}
                  </option>
                ))}
              </select>
              {errors.estado && (
                <div style={errorStyle}>
                  {errors.estado.message}
                </div>
              )}
            </div>

            {/* Graduação */}
            <div style={fieldStyle}>
              <label style={labelStyle}>🎓 Você já é graduado(a)? *</label>
              <div>
                <div style={radioStyle}>
                  <input 
                    type="radio" 
                    value="nao" 
                    {...register('graduacao', { required: 'Selecione uma opção' })}
                    id="grad-nao"
                  />
                  <label htmlFor="grad-nao" style={{marginLeft: '8px'}}>
                    Não (ainda não fiz e nem comecei)
                  </label>
                </div>
                <div style={radioStyle}>
                  <input 
                    type="radio" 
                    value="incompleto" 
                    {...register('graduacao', { required: 'Selecione uma opção' })}
                    id="grad-incompleto"
                  />
                  <label htmlFor="grad-incompleto" style={{marginLeft: '8px'}}>
                    Incompleto (estou cursando graduação)
                  </label>
                </div>
                <div style={radioStyle}>
                  <input 
                    type="radio" 
                    value="sim" 
                    {...register('graduacao', { required: 'Selecione uma opção' })}
                    id="grad-sim"
                  />
                  <label htmlFor="grad-sim" style={{marginLeft: '8px'}}>
                    Sim (superior completo, já concluí)
                  </label>
                </div>
              </div>
              {errors.graduacao && (
                <div style={errorStyle}>
                  {errors.graduacao.message}
                </div>
              )}
            </div>

            {/* Escolaridade - Condicional */}
            {graduacao === 'nao' && (
              <div style={fieldStyle}>
                <label style={labelStyle}>📚 Minha escolaridade é: *</label>
                <select 
                  {...register('escolaridade', { required: 'Selecione uma opção' })}
                  style={{...inputStyle, borderColor: errors.escolaridade ? '#E53E3E' : '#E2E8F0'}}
                >
                  <option value="">Selecione uma opção</option>
                  <option value="medio-incompleto">Ensino Médio Incompleto</option>
                  <option value="medio-completo">Ensino Médio Completo</option>
                  <option value="magisterio-incompleto">Magistério Incompleto</option>
                  <option value="magisterio-completo">Magistério Completo</option>
                  <option value="superior-incompleto">Superior incompleto</option>
                  <option value="superior-completo">Superior completo</option>
                  <option value="nenhuma">Nenhuma das opções acima</option>
                </select>
                {errors.escolaridade && (
                  <div style={errorStyle}>
                    {errors.escolaridade.message}
                  </div>
                )}
              </div>
            )}

            {/* Término Graduação - Condicional */}
            {graduacao === 'sim' && (
              <div style={fieldStyle}>
                <label style={labelStyle}>📅 Quando você concluiu sua graduação? *</label>
                <select 
                  {...register('terminoGraduacao', { required: 'Selecione uma opção' })}
                  style={{...inputStyle, borderColor: errors.terminoGraduacao ? '#E53E3E' : '#E2E8F0'}}
                >
                  <option value="">Selecione uma opção</option>
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                  <option value="2022">2022</option>
                  <option value="2021">2021</option>
                  <option value="2020">2020</option>
                  <option value="2019">2019</option>
                  <option value="2018">2018</option>
                  <option value="antes-2018">Antes de 2018</option>
                </select>
                {errors.terminoGraduacao && (
                  <div style={errorStyle}>
                    {errors.terminoGraduacao.message}
                  </div>
                )}
              </div>
            )}

            {/* Início Pós - Condicional */}
            {graduacao === 'sim' && terminoGraduacao === '2024' && (
              <div style={fieldStyle}>
                <label style={labelStyle}>🎯 Quando pretende iniciar uma pós-graduação? *</label>
                <select 
                  {...register('inicioPos', { required: 'Selecione uma opção' })}
                  style={{...inputStyle, borderColor: errors.inicioPos ? '#E53E3E' : '#E2E8F0'}}
                >
                  <option value="">Selecione uma opção</option>
                  <option value="2025-1">1º semestre de 2025</option>
                  <option value="2025-2">2º semestre de 2025</option>
                  <option value="2026">2026</option>
                  <option value="depois-2026">Depois de 2026</option>
                  <option value="nao-pretendo">Não pretendo fazer pós-graduação</option>
                </select>
                {errors.inicioPos && (
                  <div style={errorStyle}>
                    {errors.inicioPos.message}
                  </div>
                )}
              </div>
            )}

            {/* Motivo sem interesse - Condicional */}
            {graduacao === 'sim' && terminoGraduacao === '2024' && inicioPos === 'nao-pretendo' && (
              <div style={fieldStyle}>
                <label style={labelStyle}>🤔 Por que não pretende fazer pós-graduação? *</label>
                <select 
                  {...register('motivoSemInteresse', { required: 'Selecione uma opção' })}
                  style={{...inputStyle, borderColor: errors.motivoSemInteresse ? '#E53E3E' : '#E2E8F0'}}
                >
                  <option value="">Selecione uma opção</option>
                  <option value="financeiro">Motivos financeiros</option>
                  <option value="tempo">Falta de tempo</option>
                  <option value="area-diferente">Quero mudar de área</option>
                  <option value="satisfeito">Estou satisfeito com minha formação atual</option>
                  <option value="outros">Outros motivos</option>
                </select>
                {errors.motivoSemInteresse && (
                  <div style={errorStyle}>
                    {errors.motivoSemInteresse.message}
                  </div>
                )}
              </div>
            )}

            {/* Clube Rhema+ */}
            <div style={fieldStyle}>
              <label style={labelStyle}>🏆 Quer conhecer o Clube Rhema+? *</label>
              <div>
                <div style={radioStyle}>
                  <input 
                    type="radio" 
                    value="saber-mais" 
                    {...register('clubeRhema', { required: 'Selecione uma opção' })}
                    id="clube-saber"
                  />
                  <label htmlFor="clube-saber" style={{marginLeft: '8px'}}>
                    Quero saber mais
                  </label>
                </div>
                <div style={radioStyle}>
                  <input 
                    type="radio" 
                    value="ja-conheco" 
                    {...register('clubeRhema', { required: 'Selecione uma opção' })}
                    id="clube-conheco"
                  />
                  <label htmlFor="clube-conheco" style={{marginLeft: '8px'}}>
                    Já conheço
                  </label>
                </div>
                <div style={radioStyle}>
                  <input 
                    type="radio" 
                    value="sem-interesse" 
                    {...register('clubeRhema', { required: 'Selecione uma opção' })}
                    id="clube-sem"
                  />
                  <label htmlFor="clube-sem" style={{marginLeft: '8px'}}>
                    Não tenho interesse
                  </label>
                </div>
              </div>
              {errors.clubeRhema && (
                <div style={errorStyle}>
                  {errors.clubeRhema.message}
                </div>
              )}
            </div>

            {/* Cursos Online */}
            <div style={fieldStyle}>
              <label style={labelStyle}>💻 Quer conhecer nossos cursos de capacitação online? *</label>
              <div>
                <div style={radioStyle}>
                  <input 
                    type="radio" 
                    value="saber-mais" 
                    {...register('cursosOnline', { required: 'Selecione uma opção' })}
                    id="cursos-saber"
                  />
                  <label htmlFor="cursos-saber" style={{marginLeft: '8px'}}>
                    Quero saber mais
                  </label>
                </div>
                <div style={radioStyle}>
                  <input 
                    type="radio" 
                    value="ja-conheco" 
                    {...register('cursosOnline', { required: 'Selecione uma opção' })}
                    id="cursos-conheco"
                  />
                  <label htmlFor="cursos-conheco" style={{marginLeft: '8px'}}>
                    Já conheço
                  </label>
                </div>
                <div style={radioStyle}>
                  <input 
                    type="radio" 
                    value="sem-interesse" 
                    {...register('cursosOnline', { required: 'Selecione uma opção' })}
                    id="cursos-sem"
                  />
                  <label htmlFor="cursos-sem" style={{marginLeft: '8px'}}>
                    Não tenho interesse
                  </label>
                </div>
              </div>
              {errors.cursosOnline && (
                <div style={errorStyle}>
                  {errors.cursosOnline.message}
                </div>
              )}
            </div>

            {/* Psicopedagogo */}
            <div style={fieldStyle}>
              <label style={labelStyle}>🧠 Você é psicopedagogo clínico ou neuropsicopedagogo clínico? *</label>
              <div>
                <div style={radioStyle}>
                  <input 
                    type="radio" 
                    value="sim-info" 
                    {...register('psicopedagogo', { required: 'Selecione uma opção' })}
                    id="psico-sim"
                  />
                  <label htmlFor="psico-sim" style={{marginLeft: '8px'}}>
                    Sim, sou – me mande mais informações
                  </label>
                </div>
                <div style={radioStyle}>
                  <input 
                    type="radio" 
                    value="especializacao" 
                    {...register('psicopedagogo', { required: 'Selecione uma opção' })}
                    id="psico-esp"
                  />
                  <label htmlFor="psico-esp" style={{marginLeft: '8px'}}>
                    Tenho a especialização, mas no momento não tenho interesse
                  </label>
                </div>
                <div style={radioStyle}>
                  <input 
                    type="radio" 
                    value="nao" 
                    {...register('psicopedagogo', { required: 'Selecione uma opção' })}
                    id="psico-nao"
                  />
                  <label htmlFor="psico-nao" style={{marginLeft: '8px'}}>
                    Não sou dessa área
                  </label>
                </div>
              </div>
              {errors.psicopedagogo && (
                <div style={errorStyle}>
                  {errors.psicopedagogo.message}
                </div>
              )}
            </div>

            {/* NPS */}
            <div style={fieldStyle}>
              <label style={{...labelStyle, fontSize: '18px', color: '#3182CE'}}>
                ⭐ De 0 a 10, quanto você indicaria nossos eventos para um amigo? *
              </label>
              <Text fontSize="sm" color="gray.600" mb={4}>
                0 significa que você não indicaria de jeito nenhum, e 10 significa que você indicaria com certeza.
              </Text>
                             <VStack gap={4} align="stretch">
                 <SimpleGrid 
                   columns={[6, 6, 11]} 
                   gap={[1, 2, 2]}
                   mb={2}
                 >
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((nota) => (
                    <Button
                      key={nota}
                      type="button"
                      bg={selectedNps === nota ? getNpsColor(nota) : '#F7FAFC'}
                      color={selectedNps === nota ? 'white' : '#4A5568'}
                      border={selectedNps === nota ? 'none' : '2px solid #E2E8F0'}
                      onClick={() => handleNpsClick(nota)}
                      _hover={{ transform: 'translateY(-2px)', boxShadow: 'md' }}
                      transition="all 0.2s"
                      height={["35px", "40px", "40px"]}
                      minWidth={["35px", "40px", "40px"]}
                      p={0}
                      fontSize={["sm", "md", "md"]}
                    >
                      {nota}
                    </Button>
                  ))}
                </SimpleGrid>
                {selectedNps !== undefined && (
                  <Box 
                    p={[3, 4, 4]} 
                    borderRadius="md" 
                    bg={getNpsColor(selectedNps)} 
                    color="white"
                    textAlign="center"
                    mt={2}
                  >
                                         <HStack gap={2} justify="center" mb={2}>
                      <Text fontSize={["xl", "2xl", "2xl"]}>{getNpsEmoji(selectedNps)}</Text>
                      <Text fontWeight="bold" fontSize={["md", "lg", "lg"]}>
                        {getNpsLabel(selectedNps)}
                      </Text>
                    </HStack>
                    <Text fontSize={["xs", "sm", "sm"]}>
                      {getNpsDescription(selectedNps)}
                    </Text>
                  </Box>
                )}
              </VStack>
              {errors.indicacao && (
                <div style={errorStyle}>
                  Selecione uma nota de 0 a 10
                </div>
              )}
            </div>

            {/* Dificuldade */}
            <div style={fieldStyle}>
              <label style={{...labelStyle, fontSize: '18px', color: '#3182CE'}}>
                📚 Qual sua maior dificuldade em sala de aula? *
              </label>
              <Textarea
                {...register('dificuldade', { required: 'Descreva sua maior dificuldade' })}
                placeholder="Descreva sua maior dificuldade..."
                size="lg"
                rows={4}
                borderColor={errors.dificuldade ? '#E53E3E' : '#E2E8F0'}
                _hover={{ borderColor: '#4299E1' }}
                _focus={{ borderColor: '#3182CE', boxShadow: '0 0 0 1px #3182CE' }}
              />
              {errors.dificuldade && (
                <div style={errorStyle}>
                  {errors.dificuldade.message}
                </div>
              )}
            </div>

            <Button
              type="submit"
              colorScheme="blue"
              size="lg"
              width="100%"
              _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
              transition="all 0.2s"
              mt={8}
              fontSize="lg"
              py={6}
            >
              🚀 Enviar Formulário
            </Button>
          </Stack>
        </form>
      </Stack>
    </Box>
  );
}; 