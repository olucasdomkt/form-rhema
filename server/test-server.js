import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/test', (req, res) => {
  res.json({ message: 'Servidor de teste funcionando!' });
});

const PORT = 4000;

app.listen(PORT, () => {
  console.log(`Servidor de teste rodando em http://localhost:${PORT}`);
}); 