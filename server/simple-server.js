import http from 'http';

const server = http.createServer((req, res) => {
  console.log('Nova requisição recebida:', req.url);
  
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ message: 'Servidor funcionando!' }));
});

const PORT = 4000;

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Servidor rodando em http://127.0.0.1:${PORT}`);
}); 