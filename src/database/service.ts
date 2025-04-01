import { FunctionDocument } from '../models/function.model';
import Function from '../models/function.model';
import Execution from '../models/execution.model';
import { ExecutionDocument } from '../models/execution.model';
import { FunctionMetadata, ExecutionResult } from '../types';
import logger from '../utils/logger';

class DatabaseService {
  /**
   * Create a new function
   */
  async createFunction(functionData: FunctionMetadata): Promise<FunctionDocument> {
    try {
      const newFunction = await Function.create(functionData);
      logger.info(`Created function: ${newFunction.name} with ID: ${newFunction._id}`);
      return newFunction;
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`Error creating function: ${error.message}`);
        throw error;
      }
      throw new Error('Unknown error creating function');
    }
  }

  /**
   * Get all functions
   */
  async getAllFunctions(): Promise<FunctionDocument[]> {
    try {
      return await Function.find().sort({ createdAt: -1 });
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`Error fetching functions: ${error.message}`);
        throw error;
      }
      throw new Error('Unknown error fetching functions');
    }
  }

  /**
   * Get function by ID
   */
  async getFunctionById(id: string): Promise<FunctionDocument | null> {
    try {
      return await Function.findById(id);
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`Error fetching function by ID: ${error.message}`);
        throw error;
      }
      throw new Error('Unknown error fetching function by ID');
    }
  }

  /**
   * Get function by route
   */
  async getFunctionByRoute(route: string): Promise<FunctionDocument | null> {
    try {
      return await Function.findOne({ route });
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`Error fetching function by route: ${error.message}`);
        throw error;
      }
      throw new Error('Unknown error fetching function by route');
    }
  }

  /**
   * Update function
   */
  async updateFunction(id: string, updateData: Partial<FunctionMetadata>): Promise<FunctionDocument | null> {
    try {
      const updatedFunction = await Function.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );
      
      if (updatedFunction) {
        logger.info(`Updated function: ${updatedFunction.name} with ID: ${updatedFunction._id}`);
      }
      
      return updatedFunction;
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`Error updating function: ${error.message}`);
        throw error;
      }
      throw new Error('Unknown error updating function');
    }
  }

  /**
   * Delete function
   */
  async deleteFunction(id: string): Promise<boolean> {
    try {
      const result = await Function.findByIdAndDelete(id);
      
      if (result) {
        logger.info(`Deleted function with ID: ${id}`);
        return true;
      }
      
      return false;
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`Error deleting function: ${error.message}`);
        throw error;
      }
      throw new Error('Unknown error deleting function');
    }
  }

  /**
   * Record function execution
   */
  async recordExecution(executionData: ExecutionResult): Promise<ExecutionDocument> {
    try {
      const execution = await Execution.create(executionData);
      logger.info(`Recorded execution for function ID: ${execution.functionId}, status: ${execution.status}`);
      return execution;
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`Error recording execution: ${error.message}`);
        throw error;
      }
      throw new Error('Unknown error recording execution');
    }
  }

  /**
   * Get executions for a function
   */
  async getFunctionExecutions(functionId: string): Promise<ExecutionDocument[]> {
    try {
      return await Execution.find({ functionId }).sort({ startTime: -1 });
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`Error fetching executions: ${error.message}`);
        throw error;
      }
      throw new Error('Unknown error fetching executions');
    }
  }
}

export default new DatabaseService();