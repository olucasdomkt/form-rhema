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
import { mockLeads, findLeadByEmail } from '../../data/mockLeads';

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
      startSearch();
      console.log('🔍 Iniciando busca de lead com email:', email);
      console.log('📋 Todos os leads disponíveis:', mockLeads);
      
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Buscar lead nos dados locais
      const leadData = findLeadByEmail(email);
      console.log('🎯 Resultado da busca:', leadData);
      console.log('🔍 Email sendo buscado (processado):', email.toLowerCase());
      console.log('📧 Emails disponíveis:', mockLeads.map(lead => lead.email.toLowerCase()));
      
      if (leadData) {
        // Preencher campos com dados do lead
        setValue('nome', leadData.name || '');
        setValue('whatsapp', leadData.phone || '');
        setValue('estado', leadData.state || '');
        
        toast({
          title: '✅ Dados encontrados!',
          description: `Lead "${leadData.name}" carregado automaticamente`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        
        console.log('✅ Lead encontrado e campos preenchidos:', leadData);
      } else {
        toast({
          title: 'Lead não encontrado',
          description: `Nenhum dado encontrado para: ${email}`,
          status: 'info',
          duration: 5000,
          isClosable: true,
        });
        
        console.log('❌ Lead não encontrado para email:', email);
        console.log('💡 Emails disponíveis para teste:', mockLeads.map(lead => lead.email));
      }

    } catch (error) {
      console.error('❌ Erro ao buscar lead:', error);
      toast({
        title: 'Erro ao buscar dados',
        description: 'Erro interno na busca',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      stopSearch();
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
    if (graduacao !== 'sim') return null;

    return (
      <SlideFade in={true} offsetY="20px">
        <FormControl isRequired isInvalid={!!errors.terminoGraduacao}>
          <FormLabel>Quando você concluiu sua graduação?</FormLabel>
          <Select {...register('terminoGraduacao', { required: true })}>
            <option value="">Selecione uma opção</option>
            <option value="2024">2024</option>
            <option value="2023">2023</option>
            <option value="2022">2022</option>
            <option value="2021">2021</option>
            <option value="2020">2020</option>
            <option value="2019">2019</option>
            <option value="2018">2018</option>
            <option value="antes-2018">Antes de 2018</option>
          </Select>
        </FormControl>
      </SlideFade>
    );
  };

  const renderInicioPos = () => {
    if (graduacao !== 'sim' || terminoGraduacao !== '2024') return null;

    return (
      <SlideFade in={true} offsetY="20px">
        <FormControl isRequired isInvalid={!!errors.inicioPos}>
          <FormLabel>Quando pretende iniciar uma pós-graduação?</FormLabel>
          <Select {...register('inicioPos', { required: true })}>
            <option value="">Selecione uma opção</option>
            <option value="2025-1">1º semestre de 2025</option>
            <option value="2025-2">2º semestre de 2025</option>
            <option value="2026">2026</option>
            <option value="depois-2026">Depois de 2026</option>
            <option value="nao-pretendo">Não pretendo fazer pós-graduação</option>
          </Select>
        </FormControl>
      </SlideFade>
    );
  };

  const renderMotivoSemInteresse = () => {
    if (graduacao !== 'sim' || terminoGraduacao !== '2024' || inicioPos !== 'nao-pretendo') return null;

    return (
      <SlideFade in={true} offsetY="20px">
        <FormControl isRequired isInvalid={!!errors.motivoSemInteresse}>
          <FormLabel>Por que não pretende fazer pós-graduação?</FormLabel>
          <Select {...register('motivoSemInteresse', { required: true })}>
            <option value="">Selecione uma opção</option>
            <option value="financeiro">Motivos financeiros</option>
            <option value="tempo">Falta de tempo</option>
            <option value="area-diferente">Quero mudar de área</option>
            <option value="satisfeito">Estou satisfeito com minha formação atual</option>
            <option value="outros">Outros motivos</option>
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

        {/* Status OAuth2 RD Station */}
        <Box p={4} bg="yellow.50" borderRadius="md" border="1px solid" borderColor="yellow.200">
          <VStack spacing={3} align="start">
            <Text fontWeight="bold" color="yellow.800">🔗 Integração RD Station</Text>
            <Text fontSize="sm" color="yellow.700">
              ❌ OAuth2 não configurado. Para carregar dados automaticamente do RD Station, 
              acesse <Text as="span" fontWeight="bold">/api/auth/authorize</Text>
            </Text>
            <Text fontSize="xs" color="yellow.600">
              📧 Emails de teste disponíveis: teste@exemplo.com, lucasbarbosalacerda@gmail.com, maria@empresa.com.br, ana@consultoria.com
            </Text>
          </VStack>
        </Box>

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