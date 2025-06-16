import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Text, 
  Spinner, 
  Alert, 
  AlertIcon, 
  Button, 
  VStack,
  Heading,
  useToast 
} from '@chakra-ui/react';

const Callback: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const toast = useToast();

  useEffect(() => {
    const processCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');

        console.log('🔑 Processando callback OAuth2:', { code: code?.substring(0, 10) + '...', state });

        if (!code) {
          setStatus('error');
          setMessage('Código de autorização não foi recebido do RD Station');
          return;
        }

        setMessage('Processando código de autorização...');

        // Para agora, vamos armazenar o código localmente e redirecionar
        // Em produção, você enviaria isso para sua API backend
        console.log('✅ Código OAuth2 recebido:', code);
        
        // Simular processamento
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Armazenar informações de sucesso
        localStorage.setItem('rd_oauth_success', 'true');
        localStorage.setItem('rd_oauth_code', code);
        localStorage.setItem('rd_oauth_timestamp', Date.now().toString());

        setStatus('success');
        setMessage('Autenticação com RD Station concluída com sucesso!');
        
        toast({
          title: '🎉 Conectado com RD Station!',
          description: 'Integração OAuth2 configurada com sucesso',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });

        // Limpar URL removendo parâmetros OAuth2
        window.history.replaceState({}, document.title, '/');
        
        // Redirecionar para o formulário após 3 segundos
        setTimeout(() => {
          window.location.href = '/';
        }, 3000);

      } catch (error) {
        console.error('❌ Erro ao processar callback:', error);
        setStatus('error');
        setMessage(`Erro ao processar autenticação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      }
    };

    processCallback();
  }, [toast]);

  return (
    <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" p={8} bg="gray.50">
      <VStack spacing={6} textAlign="center" maxW="md">
        <Heading size="lg" color="blue.600">
          🔑 RD Station OAuth2
        </Heading>
        
        {status === 'loading' && (
          <VStack spacing={4}>
            <Spinner size="xl" color="blue.500" thickness="4px" />
            <Text fontSize="lg" color="gray.600">
              {message || 'Processando autenticação...'}
            </Text>
            <Text fontSize="sm" color="gray.500">
              Aguarde enquanto configuramos sua integração
            </Text>
          </VStack>
        )}
        
        {status === 'success' && (
          <VStack spacing={4}>
            <Alert status="success" borderRadius="md" flexDirection="column" textAlign="center" p={6}>
              <AlertIcon boxSize="40px" mr={0} mb={2} />
              <Text fontSize="lg" fontWeight="bold" mb={2}>
                Sucesso!
              </Text>
              <Text>{message}</Text>
            </Alert>
            <Text fontSize="sm" color="gray.600">
              Redirecionando para o formulário...
            </Text>
          </VStack>
        )}
        
        {status === 'error' && (
          <VStack spacing={4}>
            <Alert status="error" borderRadius="md" flexDirection="column" textAlign="center" p={6}>
              <AlertIcon boxSize="40px" mr={0} mb={2} />
              <Text fontSize="lg" fontWeight="bold" mb={2}>
                Erro na Autenticação
              </Text>
              <Text>{message}</Text>
            </Alert>
            <Button 
              colorScheme="blue" 
              onClick={() => window.location.href = '/'}
              size="lg"
            >
              🔙 Voltar ao Formulário
            </Button>
            <Text fontSize="sm" color="gray.500">
              Tente novamente ou entre em contato conosco
            </Text>
          </VStack>
        )}
      </VStack>
    </Box>
  );
};

export default Callback; 