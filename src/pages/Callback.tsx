import React, { useEffect, useState } from 'react';
import {
  Box,
  Text,
  Button,
  Heading,
  Stack
} from '@chakra-ui/react';

const Callback: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    // Simular processamento de autenticação
    const processAuth = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');

        if (error) {
          setStatus('error');
          setMessage(`Erro na autenticação: ${error}`);
          return;
        }

        if (!code) {
          setStatus('error');
          setMessage('Código de autorização não encontrado');
          return;
        }

        setMessage('Processando código de autorização...');

        // Simular delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Aqui você faria a troca do código pelo token
        setStatus('success');
        setMessage('Autenticação realizada com sucesso!');

      } catch (error) {
        console.error('Erro no callback:', error);
        setStatus('error');
        setMessage('Erro interno durante a autenticação');
      }
    };

    processAuth();
  }, []);

  const handleRetry = () => {
    window.location.href = '/api/auth/authorize';
  };

  const handleHome = () => {
    window.location.href = '/';
  };

  return (
    <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" p={8} bg="gray.50">
      <Box maxW="md" textAlign="center">
        <Heading size="lg" color="blue.600" mb={6}>
          🔑 RD Station OAuth2
        </Heading>
        
        {status === 'loading' && (
          <Stack gap={4}>
            <Text fontSize="lg" color="gray.600">
              {message || 'Processando autenticação...'}
            </Text>
          </Stack>
        )}
        
        {status === 'success' && (
          <Stack gap={4}>
            <Box p={6} bg="green.50" borderRadius="md" border="1px solid" borderColor="green.200">
              <Text fontSize="lg" fontWeight="bold" mb={2} color="green.700">
                Sucesso!
              </Text>
              <Text color="green.600">
                {message}
              </Text>
            </Box>
            <Button onClick={handleHome} bg="blue.500" color="white" _hover={{ bg: 'blue.600' }}>
              Voltar ao Formulário
            </Button>
          </Stack>
        )}
        
        {status === 'error' && (
          <Stack gap={4}>
            <Box p={6} bg="red.50" borderRadius="md" border="1px solid" borderColor="red.200">
              <Text fontSize="lg" fontWeight="bold" mb={2} color="red.700">
                Erro na Autenticação
              </Text>
              <Text color="red.600">
                {message}
              </Text>
            </Box>
            <Stack gap={2}>
              <Button onClick={handleRetry} bg="blue.500" color="white" _hover={{ bg: 'blue.600' }}>
                Tentar Novamente
              </Button>
              <Button onClick={handleHome} bg="gray.500" color="white" _hover={{ bg: 'gray.600' }}>
                Voltar ao Formulário
              </Button>
            </Stack>
          </Stack>
        )}
      </Box>
    </Box>
  );
};

export default Callback; 