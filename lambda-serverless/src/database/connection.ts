import mongoose from 'mongoose';
import logger from '../utils/logger';



const connectDB = async (): Promise<mongoose.Connection> => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI as string);
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    return conn.connection;
  } catch (error) {
    if (error instanceof Error) {
      logger.error(`Error connecting to MongoDB: ${error.message}`);
    } else {
      logger.error('Unknown error connecting to MongoDB');
    }
    process.exit(1);
  }
};

export default connectDB;
