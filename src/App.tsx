import React from 'react';
import { Box } from '@chakra-ui/react';
import { Form } from './components/Form/Form';
import { Admin } from './pages/Admin';

function App() {
  // Roteamento simples baseado no path
  const path = window.location.pathname;
  
  if (path === '/admin') {
    return <Admin />;
  }
  
  return (
    <Box minH="100vh" bg="gray.50" py={8}>
      <Form />
    </Box>
  );
}

export default App; 