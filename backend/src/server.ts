import cors from 'cors';
import 'dotenv/config';
import express from 'express';

const app = express();
const port = Number(process.env.PORT ?? 3000);

app.use(cors());
app.use(express.json());

app.get('/api/health', (_request, response) => {
  response.json({
    status: 'ok',
    service: 'panaderia-backend',
    message: 'La API está funcionando correctamente.'
  });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`API disponible en http://localhost:${port}/api`);
});

