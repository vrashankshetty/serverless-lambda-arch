import { FunctionDocument } from '../models/function.model';
import Function from '../models/function.model';
import Execution from '../models/execution.model';
import { ExecutionDocument } from '../models/execution.model';
import { FunctionMetadata, ExecutionResult, DashboardData } from '../types';
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
   * Get all execution
   */

  async getAllExecutions(): Promise<ExecutionDocument[]> {
    try {
      return await Execution.find().sort({ createdAt: -1 });
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`Error fetching functions: ${error.message}`);
        throw error;
      }
      throw new Error('Unknown error fetching functions');
    }
  }


  /**
   * Get each execution
   */

  async getEachExecution(id:string): Promise<ExecutionDocument | null> {
    try {
      return await Execution.findById(id);
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`Error fetching functions: ${error.message}`);
        throw error;
      }
      throw new Error('Unknown error fetching functions');
    }
  }



   /**
   * Get Dashboard
   */
   async getDashboard(): Promise<DashboardData> {
    try {
      const functionCount =  await Function.find().countDocuments();
      const executionCount = await Execution.find().countDocuments();
      const functionExecutions = await Execution.find().sort({ startTime: -1 }).limit(5);
      const avgExecutionTime = await Execution.aggregate([
        { $group: { _id: null, avgTime: { $avg: "$duration" } } }
      ]);
      const avgTime = avgExecutionTime[0]?.avgTime || 0;
      const successfulExecutions = await Execution.find({ status: 'success' }).countDocuments();
      const successRate = functionCount > 0 ? (successfulExecutions / executionCount) * 100 : 0;
      const resp = functionExecutions.map((execution) => ({
        id: execution._id,
        status: execution.status,
        duration: execution.duration,
        functionId: execution.functionId,
        startTime: execution.startTime,
        endTime: execution.endTime,
        functionName: execution.functionName,
        logs: execution.logs,
        errorMessage: execution.errorMessage,
        output: execution.output,
      }));

      const dashboardData = {
        totalFunctions:functionCount,
        totalExecutions:executionCount,
        recentExecutions:resp,
        avgExecutionTime: avgTime.toFixed(2),
        successfulExecutions:successRate.toFixed(2),
      };
      return dashboardData;
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

  async deleteAllFunction(): Promise<boolean> {
    try {
      const result = await Function.deleteMany({});
      
      if (result) {
        logger.info(`Deleted all function with ID`);
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

  async deleteAllExecution(): Promise<boolean> {
    try {
      const result = await Execution.deleteMany({});
      
      if (result) {
        logger.info(`Deleted all execution with ID`);
        return true;
      }

      return false;
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`Error deleting execution: ${error.message}`);
        throw error;
      }
      throw new Error('Unknown error deleting function');
    }
  }
}

export default new DatabaseService();