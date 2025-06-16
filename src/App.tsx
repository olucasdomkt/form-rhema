import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Box } from '@chakra-ui/react';
import { Form } from './components/Form/Form';
import Callback from './pages/Callback';

function App() {
  return (
    <Router>
      <Box minH="100vh" bg="gray.50" py={8}>
        <Routes>
          <Route path="/" element={<Form />} />
          <Route path="/auth/callback" element={<Callback />} />
        </Routes>
      </Box>
    </Router>
  );
}

export default App; 