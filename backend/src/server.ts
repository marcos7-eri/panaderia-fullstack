import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import { errorHandler, notFoundHandler } from './middleware/error-handler';
import { authRouter } from './routes/auth.routes';
import { categoryRouter } from './routes/category.routes';
import { customerRouter } from './routes/customer.routes';
import { orderRouter } from './routes/order.routes';
import { productRouter } from './routes/product.routes';

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

app.use('/api/auth', authRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/products', productRouter);
app.use('/api/customers', customerRouter);
app.use('/api/orders', orderRouter);
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(port, '0.0.0.0', () => {
  console.log(`API disponible en http://localhost:${port}/api`);
});

