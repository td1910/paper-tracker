import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import topicRoutes from './routes/topics';
import paperRoutes from './routes/papers';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/papers', paperRoutes);

app.get('/', (req, res) => {
  res.send('Hello from Paper Tracker API');
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT as number, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
});
