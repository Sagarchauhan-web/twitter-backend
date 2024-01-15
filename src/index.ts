import express from 'express';
import userRoutes from './routes/userRoutes';

const app = express();
app.use(express.json());
app.use('/user', userRoutes);

app.get('/', (req, res) => {
  res.send('hello world`');
});

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
