import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Text,
  Heading,
  Stack,
  Spinner,
  Badge
} from '@chakra-ui/react';

export const Admin: React.FC = () => {
  const [authStatus, setAuthStatus] = useState<string>('loading');
  const [authMessage, setAuthMessage] = useState<string>('Verificando...');
  const [isConnecting, setIsConnecting] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date>(new Date());
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  useEffect(() => {
    checkAuthStatus();
    const interval = setInterval(checkAuthStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkAuthStatus = async () => {
    try {
      setIsCheckingStatus(true);
      console.log('🔐 Verificando status OAuth2...');
      
      const response = await fetch('/api/auth/status');
      const data = await response.json();
      
      console.log('📊 Status response:', data);
      
      setAuthStatus(data.authenticated ? 'authenticated' : 'unauthenticated');
      setAuthMessage(data.message || 'Status verificado');
      setLastCheck(new Date());
      
      console.log('Status:', data.authenticated ? 'Conectado' : 'Não conectado');
      
    } catch (error) {
      console.error('❌ Erro ao verificar status:', error);
      setAuthStatus('error');
      setAuthMessage('Erro ao verificar conexão com servidor');
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const handleConnect = () => {
    if (isConnecting) return;
    
    setIsConnecting(true);
    console.log('🔗 Abrindo conexão RD Station...');
    
    const popup = window.open(
      '/api/auth/authorize', 
      'rd_oauth', 
      'width=600,height=700,scrollbars=yes,resizable=yes'
    );

    const checkClosed = setInterval(() => {
      if (popup?.closed) {
        clearInterval(checkClosed);
        setIsConnecting(false);
        console.log('✅ Popup fechado, verificando status...');
        setTimeout(checkAuthStatus, 2000);
      }
    }, 1000);

    setTimeout(() => {
      clearInterval(checkClosed);
      setIsConnecting(false);
    }, 300000);
  };

  const testConnection = async () => {
    try {
      console.log('🧪 Testando conexão com API...');
      const response = await fetch('/api/lead?email=teste@exemplo.com');
      const data = await response.json();
      
      console.log('📋 Resposta do teste:', data);
      
      if (response.ok) {
        if (data.found && data.lead) {
          const sourceText = data.source === 'rd_station' ? 'RD Station (autenticado)' : 
                            data.source === 'mock' ? 'dados de demonstração' : data.source;
          alert(`✅ Funcionando!\n\nLead: ${data.lead.name || 'N/A'}\nFonte: ${sourceText}\nStatus: ${data.message}`);
        } else {
          alert(`⚠️ API funcionando, mas lead não encontrado:\n${data.message}`);
        }
      } else {
        alert(`❌ Erro na API (${response.status}):\n${data.message || data.error}`);
      }
      
    } catch (error) {
      console.error('❌ Erro no teste:', error);
      alert('❌ Erro ao conectar com a API');
    }
  };

  const getStatusColor = () => {
    if (authStatus === 'authenticated') return 'green';
    if (authStatus === 'unauthenticated') return 'orange';
    if (authStatus === 'error') return 'red';
    return 'gray';
  };

  const getStatusText = () => {
    if (authStatus === 'loading') return '🔄 Verificando...';
    if (authStatus === 'authenticated') return '✅ Conectado';
    if (authStatus === 'unauthenticated') return '❌ Não conectado';
    if (authStatus === 'error') return '🚨 Erro';
    return '❓ Verificando...';
  };

  const getButtonText = () => {
    if (isConnecting) return <><Spinner size="sm" mr={2} /> Conectando...</>;
    if (authStatus === 'authenticated') return '🔄 Reconectar';
    return '🔗 Conectar com RD Station';
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
      <Stack gap={6}>
        {/* Header */}
        <Box textAlign="center">
          <Heading size="lg" color="blue.600" mb={2}>⚙️ Painel Administrativo</Heading>
          <Text color="gray.600">Gerenciamento de integração com RD Station</Text>
        </Box>

        {/* Status Card */}
        <Box 
          p={6} 
          borderRadius="lg" 
          border="2px solid" 
          borderColor={`${getStatusColor()}.200`} 
          bg={`${getStatusColor()}.50`}
        >
          <Stack gap={4}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Heading size="md" color={`${getStatusColor()}.700`}>
                Status da Conexão
              </Heading>
              <Badge colorScheme={getStatusColor()} fontSize="sm" px={3} py={1}>
                {getStatusText()}
              </Badge>
            </Box>

            <Text color={`${getStatusColor()}.600`} fontSize="sm">
              {authMessage}
            </Text>

            <Text fontSize="xs" color="gray.500">
              Última verificação: {lastCheck.toLocaleTimeString('pt-BR')}
            </Text>
          </Stack>
        </Box>

        {/* Actions */}
        <Stack gap={4}>
          <Heading size="md" color="gray.700">🔧 Ações</Heading>
          
          <Stack direction={{ base: 'column', md: 'row' }} gap={4}>
            <Button 
              onClick={handleConnect}
              bg={authStatus === 'authenticated' ? 'green.500' : 'blue.500'}
              color="white" 
              size="lg"
              _hover={{ bg: authStatus === 'authenticated' ? 'green.600' : 'blue.600' }}
              disabled={isConnecting}
              minW="200px"
            >
              {getButtonText()}
            </Button>

            <Button 
              onClick={checkAuthStatus}
              variant="outline"
              size="lg"
              disabled={isCheckingStatus}
              minW="150px"
            >
              {isCheckingStatus ? <><Spinner size="sm" mr={2} /> Verificando</> : '↻ Verificar Status'}
            </Button>

            <Button 
              onClick={testConnection}
              colorScheme="purple"
              variant="outline"
              size="lg"
              minW="120px"
            >
              🧪 Testar API
            </Button>
          </Stack>
        </Stack>

        {/* Divider */}
        <Box height="1px" bg="gray.200" width="100%" />

        {/* Info */}
        <Box>
          <Heading size="md" color="gray.700" mb={4}>ℹ️ Informações</Heading>
          
          <Stack gap={3}>
            <Box p={4} bg="blue.50" borderRadius="md" border="1px solid" borderColor="blue.200">
              <Text fontWeight="bold" mb={1} color="blue.700">🔗 Como funciona:</Text>
              <Text fontSize="sm" color="blue.600">
                1. Conecte-se com RD Station usando OAuth2<br/>
                2. O sistema salva um token de acesso temporário<br/>
                3. O formulário busca leads automaticamente quando você digita o email<br/>
                4. Se não autenticado, usa dados de demonstração
              </Text>
            </Box>

            <Box p={4} bg="orange.50" borderRadius="md" border="1px solid" borderColor="orange.200">
              <Text fontWeight="bold" mb={1} color="orange.700">⚠️ Importante:</Text>
              <Text fontSize="sm" color="orange.600">
                Tokens OAuth2 expiram após 24 horas. Reconecte se a busca parar de funcionar.
              </Text>
            </Box>

            <Box p={4} bg="green.50" borderRadius="md" border="1px solid" borderColor="green.200">
              <Text fontWeight="bold" mb={1} color="green.700">💡 Emails para teste:</Text>
              <Text fontSize="sm" color="green.600">
                <strong>Com dados mock:</strong> teste@exemplo.com • maria@empresa.com.br<br/>
                <strong>Outros emails:</strong> Retornarão "não encontrado" (comportamento normal)
              </Text>
            </Box>

            <Box p={4} bg="purple.50" borderRadius="md" border="1px solid" borderColor="purple.200">
              <Text fontWeight="bold" mb={1} color="purple.700">🎯 Status esperados:</Text>
              <Text fontSize="sm" color="purple.600">
                <strong>✅ Conectado:</strong> Busca leads reais na sua conta RD Station<br/>
                <strong>❌ Não conectado:</strong> Usa dados de demonstração<br/>
                <strong>🚨 Erro:</strong> Problema de conexão com servidor
              </Text>
            </Box>
          </Stack>
        </Box>

        {/* Back to Form */}
        <Box textAlign="center" pt={4} borderTop="1px solid" borderColor="gray.200">
          <Button 
            onClick={() => window.location.href = '/'}
            variant="outline"
            colorScheme="gray"
            size="lg"
          >
            🔙 Voltar ao Formulário
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}; 