import React, { useState, useEffect } from 'react';
import { 
  Button, 
  Text, 
  VStack, 
  Alert, 
  AlertIcon,
  useToast,
  Box
} from '@chakra-ui/react';

export const AuthButton: React.FC = () => {
  const [authStatus, setAuthStatus] = useState<'loading' | 'authenticated' | 'not-authenticated'>('loading');
  const toast = useToast();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || window.location.origin;
      const response = await fetch(`${apiUrl}/api/auth/status`);
      const data = await response.json();
      
      setAuthStatus(data.authenticated ? 'authenticated' : 'not-authenticated');
    } catch (error) {
      console.error('Erro ao verificar status:', error);
      setAuthStatus('not-authenticated');
    }
  };

  const handleAuth = () => {
    const apiUrl = process.env.REACT_APP_API_URL || window.location.origin;
    window.location.href = `${apiUrl}/api/auth/authorize`;
  };

  if (authStatus === 'loading') {
    return (
      <Box p={4} borderRadius="md" bg="gray.50">
        <Text>Verificando status de autenticação...</Text>
      </Box>
    );
  }

  if (authStatus === 'authenticated') {
    return (
      <Alert status="success" borderRadius="md">
        <AlertIcon />
        <VStack align="start" spacing={1}>
          <Text fontWeight="bold">✅ Conectado com RD Station</Text>
          <Text fontSize="sm">O sistema pode buscar seus dados automaticamente</Text>
        </VStack>
      </Alert>
    );
  }

  return (
    <Alert status="warning" borderRadius="md">
      <AlertIcon />
      <VStack align="start" spacing={3} w="full">
        <Text fontWeight="bold">❌ Não autenticado</Text>
        <Text fontSize="sm">
          Para carregar seus dados automaticamente, conecte-se com o RD Station
        </Text>
        <Button 
          colorScheme="blue" 
          size="sm" 
          onClick={handleAuth}
        >
          🔑 Conectar com RD Station
        </Button>
      </VStack>
    </Alert>
  );
}; 