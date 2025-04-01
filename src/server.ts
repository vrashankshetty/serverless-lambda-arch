import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import connectDB from './database/connection';
import logger from './utils/logger';
import router from './routes';


const app = express();
const PORT = process.env.PORT || 8080;


app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(router);

connectDB();

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});



// Start server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
}

export default app;
