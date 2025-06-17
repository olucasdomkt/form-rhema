import React, { useState, useEffect } from 'react';
import {
  Button,
  Text,
  Box
} from '@chakra-ui/react';

type AuthStatus = 'authenticated' | 'unauthenticated' | 'loading';

export const AuthButton: React.FC = () => {
  const [authStatus, setAuthStatus] = useState<AuthStatus>('loading');

  useEffect(() => {
    // Verificar status de autenticação
    const checkAuthStatus = () => {
      const success = localStorage.getItem('rd_oauth_success');
      const timestamp = localStorage.getItem('rd_oauth_timestamp');
      
      if (success && timestamp) {
        const authTime = parseInt(timestamp);
        const now = Date.now();
        const hoursSinceAuth = (now - authTime) / (1000 * 60 * 60);
        
        if (hoursSinceAuth < 24) {
          setAuthStatus('authenticated');
        } else {
          // Token expirado
          localStorage.removeItem('rd_oauth_success');
          localStorage.removeItem('rd_oauth_code');
          localStorage.removeItem('rd_oauth_timestamp');
          setAuthStatus('unauthenticated');
        }
      } else {
        setAuthStatus('unauthenticated');
      }
    };

    checkAuthStatus();
  }, []);

  const handleAuth = () => {
    window.location.href = '/api/auth/authorize';
  };

  const handleDisconnect = () => {
    localStorage.removeItem('rd_oauth_success');
    localStorage.removeItem('rd_oauth_code');
    localStorage.removeItem('rd_oauth_timestamp');
    setAuthStatus('unauthenticated');
    alert('Desconectado do RD Station');
  };

  if (authStatus === 'loading') {
    return (
      <Box p={4} bg="gray.50" borderRadius="md">
        <Text>Verificando status...</Text>
      </Box>
    );
  }

  if (authStatus === 'authenticated') {
    return (
      <Box p={4} bg="green.50" borderRadius="md" border="1px solid" borderColor="green.200">
        <Text fontWeight="bold" color="green.700" mb={2}>✅ Conectado com RD Station</Text>
        <Text fontSize="sm" color="green.600" mb={3}>O sistema pode buscar seus dados automaticamente</Text>
        <Button onClick={handleDisconnect} size="sm" bg="red.500" color="white" _hover={{ bg: 'red.600' }}>
          Desconectar
        </Button>
      </Box>
    );
  }

  return (
    <Box p={4} bg="yellow.50" borderRadius="md" border="1px solid" borderColor="yellow.200">
      <Text fontWeight="bold" color="yellow.800" mb={2}>❌ Não autenticado</Text>
      <Text fontSize="sm" color="yellow.700" mb={3}>
        Para carregar seus dados automaticamente, conecte-se com o RD Station
      </Text>
      <Button onClick={handleAuth} bg="blue.500" color="white" _hover={{ bg: 'blue.600' }}>
        🔗 Conectar com RD Station
      </Button>
    </Box>
  );
}; 