import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import InputMask from 'react-input-mask';
import {
  Box,
  Stack,
  FormControl,
  FormLabel,
  Input,
  Select,
  Radio,
  RadioGroup,
  Textarea,
  Button,
  useToast,
  Heading,
  Text,
  Collapse,
  SlideFade,
  SimpleGrid,
  useColorModeValue,
  VStack,
  HStack,
  useDisclosure,
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
  const toast = useToast();
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const { isOpen: isSearching, onOpen: startSearch, onClose: stopSearch } = useDisclosure();

  const graduacao = watch('graduacao');
  const inicioPos = watch('inicioPos');
  const escolaridade = watch('escolaridade');
  const terminoGraduacao = watch('terminoGraduacao');
  const indicacao = watch('indicacao');

  const [selectedNps, setSelectedNps] = React.useState<number | undefined>(undefined);

  const getNpsEmoji = (value: number) => {
    if (value >= 9) return '😊';
    if (value >= 7) return '😐';
    return '😞';
  };

  const getNpsColor = (value: number) => {
    if (value >= 9) return 'green.500';
    if (value >= 7) return 'yellow.500';
    return 'red.500';
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
    console.log('Form submitted:', data);
    toast({
      title: 'Formulário enviado!',
      description: 'Em breve entraremos em contato.',
      status: 'success',
      duration: 5000,
      isClosable: true,
    });
  };

  const handleNpsClick = (nota: number) => {
    setSelectedNps(nota);
    setValue('indicacao', nota);
  };

  const searchLead = async (email: string) => {
    try {
      startSearch(); // Mostrar indicador de carregamento
      console.log('Iniciando busca de lead com email:', email);
      
      const response = await fetch(`http://127.0.0.1:4000/lead?email=${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Resposta recebida:', {
        status: response.status,
        statusText: response.statusText
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Erro na resposta:', errorData);
        
        // Verificar se precisa de autenticação OAuth2
        if (errorData.auth_required) {
          toast({
            title: 'Autenticação necessária',
            description: `${errorData.message}. Para dados reais, acesse: http://127.0.0.1:4000/dashboard`,
            status: 'warning',
            duration: 8000,
            isClosable: true,
          });
        } else {
          toast({
            title: 'Lead não encontrado',
            description: errorData.message || 'Nenhum dado encontrado para este email',
            status: 'info',
            duration: 5000,
            isClosable: true,
          });
        }
        return;
      }

      const data = await response.json();
      console.log('Dados do lead recebidos:', data);

      // Verificar o tipo de resposta (API real vs mock data)
      if (data.status === 'success' && data.contact) {
        const contact = data.contact;
        
        // Preencher campos básicos
        setValue('nome', contact.name || '');
        setValue('whatsapp', contact.phone || contact.personal_phone || '');
        
        // Para dados da API real do RD Station
        if (data.source === 'rdstation_api' || data.source === 'rdstation_api_refreshed') {
          // Preencher campos personalizados da API real
          if (contact.custom_fields) {
            const customFields = contact.custom_fields;
            setValue('faixaEtaria', customFields.faixa_etaria || '');
            setValue('estado', customFields.estado || '');
            setValue('graduacao', customFields.graduacao || '');
            setValue('escolaridade', customFields.escolaridade || '');
          }
          
          toast({
            title: '✅ Dados obtidos da API real!',
            description: `Dados do RD Station Marketing preenchidos automaticamente. Fonte: ${data.source}`,
            status: 'success',
            duration: 5000,
            isClosable: true,
          });
        } 
        // Para dados simulados (fallback)
        else if (data.source === 'mock_data_fallback') {
          // Mapear campos dos dados simulados
          setValue('estado', contact.state || '');
          
          toast({
            title: '📋 Dados de teste preenchidos',
            description: `${data.message || 'Dados simulados carregados'}. Para dados reais, autentique-se em: http://127.0.0.1:4000/dashboard`,
            status: 'info',
            duration: 8000,
            isClosable: true,
          });
        }
      } else {
        toast({
          title: 'Dados não encontrados',
          description: 'Nenhum lead encontrado para este email.',
          status: 'info',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Erro ao buscar lead:', error);
      toast({
        title: 'Erro ao buscar dados',
        description: `Erro de conexão: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      stopSearch(); // Esconder indicador de carregamento
    }
  };

  const handleEmailBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const email = e.target.value;
    if (email && email.includes('@')) {
      await searchLead(email);
    }
  };

  const renderEscolaridade = () => {
    if (graduacao !== 'nao') return null;

    return (
      <SlideFade in={true} offsetY="20px">
        <FormControl isRequired isInvalid={!!errors.escolaridade}>
          <FormLabel>Minha escolaridade é:</FormLabel>
          <Select {...register('escolaridade', { required: true })}>
            <option value="">Selecione uma opção</option>
            <option value="medio-incompleto">Ensino Médio Incompleto</option>
            <option value="medio-completo">Ensino Médio Completo</option>
            <option value="magisterio-incompleto">Magistério Incompleto</option>
            <option value="magisterio-completo">Magistério Completo</option>
            <option value="superior-incompleto">Superior incompleto</option>
            <option value="superior-completo">Superior completo</option>
            <option value="nenhuma">Nenhuma das opções acima</option>
          </Select>
        </FormControl>
      </SlideFade>
    );
  };

  const renderTerminoGraduacao = () => {
    if (graduacao !== 'incompleto' && escolaridade !== 'superior-incompleto') return null;

    return (
      <SlideFade in={true} offsetY="20px">
        <FormControl isRequired isInvalid={!!errors.terminoGraduacao}>
          <FormLabel>Quando você irá terminar a graduação?</FormLabel>
          <Select {...register('terminoGraduacao', { required: true })}>
            <option value="">Selecione uma opção</option>
            <option value="ultimo-semestre">Estou no último semestre</option>
            <option value="2-semestres">Faltam 2 semestres</option>
            <option value="3-semestres">Faltam 3 semestres</option>
            <option value="4-ou-mais">Faltam 4 ou mais</option>
          </Select>
        </FormControl>
      </SlideFade>
    );
  };

  const renderInicioPos = () => {
    // Verifica se deve mostrar o campo de pós
    const isGraduado = graduacao === 'sim';
    const isUltimoSemestre = graduacao === 'incompleto' && terminoGraduacao === 'ultimo-semestre';
    const isSuperiorCompleto = escolaridade === 'superior-completo';

    if (!isGraduado && !isUltimoSemestre && !isSuperiorCompleto) return null;

    return (
      <SlideFade in={true} offsetY="20px">
        <FormControl isRequired isInvalid={!!errors.inicioPos}>
          <FormLabel>Quando gostaria de iniciar uma pós conosco?</FormLabel>
          <Select {...register('inicioPos', { required: true })}>
            <option value="">Selecione uma opção</option>
            <option value="imediato">Imediatamente</option>
            <option value="antes-ano-acabar">Antes do ano acabar</option>
            <option value="proximo-semestre">Próximo semestre</option>
            <option value="proximo-ano">Próximo ano</option>
            <option value="ja-faco-rhema">Já faço pós na Rhema</option>
            <option value="ja-faco-outra">Já faço pós em outra instituição</option>
            <option value="sem-interesse">Não tenho interesse em pós-graduação</option>
          </Select>
        </FormControl>
      </SlideFade>
    );
  };

  const renderMotivoSemInteresse = () => {
    if (inicioPos !== 'sem-interesse') return null;

    return (
      <SlideFade in={true} offsetY="20px">
        <FormControl isRequired isInvalid={!!errors.motivoSemInteresse}>
          <FormLabel>Por que não tem interesse em pós?</FormLabel>
          <Select {...register('motivoSemInteresse', { required: true })}>
            <option value="">Selecione uma opção</option>
            <option value="nao-sabe-colar-grau">Ainda não sabe quando vai colar grau</option>
            <option value="nao-tem-curso">Não temos a pós/curso que procura</option>
            <option value="sem-condicoes">Não tenho condições financeiras</option>
            <option value="sem-tempo">Não tenho tempo</option>
            <option value="nao-profissional">Não sou profissional da área</option>
            <option value="sem-interesse">Não tenho interesse em pós-graduação</option>
            <option value="nenhum">Nenhum dos motivos acima</option>
          </Select>
        </FormControl>
      </SlideFade>
    );
  };

  return (
    <Box 
      p={8} 
      maxWidth="800px" 
      margin="0 auto"
      bg={bgColor}
      borderRadius="xl"
      boxShadow="xl"
    >
      <Stack spacing={8}>
        <VStack spacing={4}>
          <Heading size="lg" textAlign="center" color="blue.600">Formulário de Inscrição</Heading>
          <Text textAlign="center" color="gray.600">Preencha o formulário abaixo para iniciar sua jornada conosco.</Text>
        </VStack>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={6}>
            {/* Email */}
            <FormControl isRequired isInvalid={!!errors.email}>
              <FormLabel>Seu melhor e-mail</FormLabel>
              <Input
                type="email"
                {...register('email', { required: true })}
                placeholder="seu@email.com"
                onBlur={handleEmailBlur}
                isDisabled={isSearching}
              />
              {isSearching && (
                <Text fontSize="sm" color="blue.500" mt={1}>
                  Buscando seus dados...
                </Text>
              )}
            </FormControl>

            {/* Nome */}
            <FormControl isRequired isInvalid={!!errors.nome}>
              <FormLabel>Nome completo</FormLabel>
              <Input
                {...register('nome', { required: true })}
                placeholder="Seu nome completo"
              />
            </FormControl>

            {/* WhatsApp */}
            <FormControl isRequired isInvalid={!!errors.whatsapp}>
              <FormLabel>Seu WhatsApp</FormLabel>
              <Input
                as={InputMask}
                mask="(99) 99999-9999"
                {...register('whatsapp', { required: true })}
                placeholder="(00) 00000-0000"
              />
            </FormControl>

            {/* Faixa Etária */}
            <FormControl isRequired isInvalid={!!errors.faixaEtaria}>
              <FormLabel>Qual a sua faixa etária?</FormLabel>
              <Select {...register('faixaEtaria', { required: true })}>
                <option value="">Selecione uma opção</option>
                <option value="18-24">De 18 a 24 anos</option>
                <option value="25-30">De 25 a 30 anos</option>
                <option value="31-35">De 31 a 35 anos</option>
                <option value="36-40">De 36 a 40 anos</option>
                <option value="41-45">De 41 a 45 anos</option>
                <option value="46-50">De 45 a 50 anos</option>
                <option value="51-55">De 51 a 55 anos</option>
                <option value="56+">56 anos ou mais</option>
              </Select>
            </FormControl>

            {/* Estado */}
            <FormControl isRequired isInvalid={!!errors.estado}>
              <FormLabel>Em qual estado você mora?</FormLabel>
              <Select {...register('estado', { required: true })}>
                <option value="">Selecione um estado</option>
                {estados.map((estado) => (
                  <option key={estado.sigla} value={estado.sigla}>
                    {estado.nome}
                  </option>
                ))}
              </Select>
            </FormControl>

            {/* Graduação */}
            <FormControl isRequired isInvalid={!!errors.graduacao}>
              <FormLabel>Você já é graduado(a)?</FormLabel>
              <RadioGroup>
                <Stack>
                  <Radio value="nao" {...register('graduacao', { required: true })}>
                    Não (ainda não fiz e nem comecei)
                  </Radio>
                  <Radio value="incompleto" {...register('graduacao', { required: true })}>
                    Incompleto (estou cursando graduação)
                  </Radio>
                  <Radio value="sim" {...register('graduacao', { required: true })}>
                    Sim (superior completo, já concluiu)
                  </Radio>
                </Stack>
              </RadioGroup>
            </FormControl>

            {/* Campos condicionais */}
            {renderEscolaridade()}
            {renderTerminoGraduacao()}
            {renderInicioPos()}
            {renderMotivoSemInteresse()}

            {/* Clube Rhema+ */}
            <FormControl isRequired isInvalid={!!errors.clubeRhema}>
              <FormLabel>Quer conhecer o Clube Rhema+?</FormLabel>
              <RadioGroup>
                <Stack>
                  <Radio value="saber-mais" {...register('clubeRhema', { required: true })}>
                    Quero saber mais
                  </Radio>
                  <Radio value="ja-conheco" {...register('clubeRhema', { required: true })}>
                    Já conheço
                  </Radio>
                  <Radio value="sem-interesse" {...register('clubeRhema', { required: true })}>
                    Não tenho interesse
                  </Radio>
                </Stack>
              </RadioGroup>
            </FormControl>

            {/* Cursos Online */}
            <FormControl isRequired isInvalid={!!errors.cursosOnline}>
              <FormLabel>Quer conhecer nossos cursos de capacitação online?</FormLabel>
              <RadioGroup>
                <Stack>
                  <Radio value="saber-mais" {...register('cursosOnline', { required: true })}>
                    Quero saber mais
                  </Radio>
                  <Radio value="ja-conheco" {...register('cursosOnline', { required: true })}>
                    Já conheço
                  </Radio>
                  <Radio value="sem-interesse" {...register('cursosOnline', { required: true })}>
                    Não tenho interesse
                  </Radio>
                </Stack>
              </RadioGroup>
            </FormControl>

            {/* Psicopedagogo */}
            <FormControl isRequired isInvalid={!!errors.psicopedagogo}>
              <FormLabel>Você é psicopedagogo clínico ou neuropsicopedagogo clínico?</FormLabel>
              <RadioGroup>
                <Stack>
                  <Radio value="sim-info" {...register('psicopedagogo', { required: true })}>
                    Sim, sou – me mande mais informações
                  </Radio>
                  <Radio value="especializacao" {...register('psicopedagogo', { required: true })}>
                    Tenho a especialização, mas no momento não tenho interesse
                  </Radio>
                  <Radio value="nao" {...register('psicopedagogo', { required: true })}>
                    Não sou dessa área
                  </Radio>
                </Stack>
              </RadioGroup>
            </FormControl>

            {/* NPS */}
            <FormControl isRequired isInvalid={!!errors.indicacao}>
              <FormLabel fontSize="lg" color="blue.600">De 0 a 10, quanto você indicaria nossos eventos para um amigo?</FormLabel>
              <Text fontSize="sm" color="gray.600" mb={4}>
                0 significa que você não indicaria de jeito nenhum, e 10 significa que você indicaria com certeza.
              </Text>
              <VStack spacing={4} align="stretch">
                <SimpleGrid 
                  columns={[6, 6, 11]} 
                  spacing={[1, 2, 2]}
                  mb={2}
                >
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((nota) => (
                    <Button
                      key={nota}
                      type="button"
                      colorScheme={selectedNps === nota ? getNpsColor(nota) : 'gray'}
                      variant={selectedNps === nota ? 'solid' : 'outline'}
                      onClick={() => handleNpsClick(nota)}
                      _hover={{ transform: 'translateY(-2px)', boxShadow: 'md' }}
                      transition="all 0.2s"
                      height={["35px", "40px", "40px"]}
                      minWidth={["35px", "40px", "40px"]}
                      p={0}
                      fontSize={["sm", "md", "md"]}
                      bg={selectedNps === nota ? `${getNpsColor(nota)}` : undefined}
                      color={selectedNps === nota ? 'white' : undefined}
                      _active={{
                        bg: `${getNpsColor(nota)}`,
                        color: 'white',
                        transform: 'scale(0.95)'
                      }}
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
                    <HStack spacing={2} justify="center" mb={2}>
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
            </FormControl>

            {/* Dificuldade */}
            <FormControl isRequired isInvalid={!!errors.dificuldade}>
              <FormLabel fontSize="lg" color="blue.600">Qual sua maior dificuldade em sala de aula?</FormLabel>
              <Textarea
                {...register('dificuldade', { required: true })}
                placeholder="Descreva sua maior dificuldade..."
                size="lg"
                _hover={{ borderColor: 'blue.400' }}
                _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)' }}
              />
            </FormControl>

            <Button
              type="submit"
              colorScheme="blue"
              size="lg"
              width="100%"
              _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
              transition="all 0.2s"
              mt={8}
            >
              Enviar Formulário
            </Button>
          </Stack>
        </form>
      </Stack>
    </Box>
  );
}; 