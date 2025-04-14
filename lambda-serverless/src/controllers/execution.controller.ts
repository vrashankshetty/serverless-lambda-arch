// src/api/controllers/execution.controller.ts
import { Request, Response } from 'express';
import databaseService from '../database/service';
import logger from '../utils/logger';
import dockerExecutionEngine from '../execution/index'
import gVisor from '../execution/gVisor';

class ExecutionController {
  async executeFunction(req: Request, res: Response): Promise<void> {
    try {
      const { route } = req.params;
      const pathParams = req.params;
  
      console.log("Executing function with route:", req.body,route);
      // Find the function by route
      const func = await databaseService.getFunctionByRoute(`/${route}`);
  
      if (!func) {
        res.status(404).json({
          message: `Function with route /${route} not found`,
          statusCode: 404
        });
        return;
      }
  
      logger.info(`Function found: ${func.name}, preparing for execution...`);
  
      const input = {
        body: req.body,
        query: req.query,
        path: pathParams,
        method: req.method,
        ...req.body
      };
  
      console.log("Input to function:", input);
      const startTime = new Date();
  
      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Function execution timed out')), func.timeout)
      );
  
      try {
        const executionResult:any = await Promise.race([
          gVisor.executeFunction(
            {
              name: func.name,
              language: func.language as 'javascript' | 'python',
              code: func.code,
              virtualizationType:func.virtualizationType,
              route: func.route,
              timeout: func.timeout
            },
            input
          ),
          timeoutPromise
        ]);
  
        const endTime = new Date();
        const duration = endTime.getTime() - startTime.getTime();
  
        logger.info(`Function ${func.name} executed in ${duration}ms with status: ${executionResult.success ? 'success' : 'error'}`);
  
        const status = executionResult.success ? 'success' : 'error';
        const logs = executionResult.error ? `Error: ${executionResult.error}` : `Function executed successfully (container: ${executionResult.containerId})`;
  
        const execution = await databaseService.recordExecution({
          functionId: func._id?.toString() ?? "",
          functionName: func.name,
          status,
          duration,
          startTime,
          endTime,
          logs,
          output: executionResult.result || executionResult.error,
        });
  
        if (executionResult.success) {
          const statusCode = executionResult.result?.statusCode || 200;
          if (typeof executionResult.result === 'object' && executionResult.result !== null) {
            res.status(statusCode).json(executionResult.result);
          } else {
            res.status(statusCode).send(executionResult.result);
          }
        } else {
          res.status(500).json({
            message: 'Function execution failed',
            statusCode: 500,
            error: executionResult.error,
            executionId: execution._id
          });
        }
      } catch (error:any) {
        if (error.message === 'Function execution timed out') {
          res.status(504).json({
            message: 'Function execution timed out',
            statusCode: 504,
            executionId: func._id?.toString() ?? ""
          });
        } else {
          logger.error(`Error executing function: ${error}`);
          res.status(500).json({
            message: 'Failed to execute function',
            statusCode: 500,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }
    } catch (error) {
      logger.error(`Error executing function: ${error}`);
      res.status(500).json({
        message: 'Failed to execute function',
        statusCode: 500,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  
  /**
   * Test a function before saving it
   */
  async testFunction(req: Request, res: Response): Promise<void> {
    try {
      const { code, language, input } = req.body;
      
      if (!code || !language) {
        res.status(400).json({
          message: 'Code and language are required',
          statusCode: 400
        });
        return;
      }
      
      // Validate language
      if (!['javascript', 'python'].includes(language)) {
        res.status(400).json({
          message: 'Language must be either "javascript" or "python"',
          statusCode: 400
        });
        return;
      }
      
      logger.info(`Testing ${language} function...`);
      
      // Execute the function using Docker Execution Engine
      const startTime = new Date();
      
      const executionResult = await gVisor.executeFunction(
        {
          name: `test-${Date.now()}`,
          language: language as 'javascript' | 'python',
          code,
          virtualizationType: '',
          route: `/test-${Date.now()}`,
          timeout: 30000 // Default timeout for test functions
        },
        input || {}
      );
      
      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();
      
      logger.info(`Test function executed in ${duration}ms with status: ${executionResult.success ? 'success' : 'error'}`);
      
      // Return test results
      res.status(200).json({
        success: executionResult.success,
        result: executionResult.result,
        error: executionResult.error,
        duration,
        output: executionResult.output
      });
    } catch (error) {
      logger.error(`Error testing function: ${error}`);
      res.status(500).json({
        message: 'Failed to test function',
        statusCode: 500,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  

  async getAllExecution(req: Request, res: Response): Promise<void> {
    try {
     
      const executionResult = await databaseService.getAllExecutions();
      const response = executionResult.map(execution => ({
        id: execution._id,
        status: execution.status,
        duration: execution.duration,
        functionId: execution.functionId,
        functionName: execution.functionName,
        startTime: execution.startTime,
        endTime: execution.endTime,
        logs: execution.logs,
        errorMessage: execution.errorMessage,
        output: execution.output
      }));
      res.status(200).json(response);
    } catch (error) {
      logger.error(`Error testing function: ${error}`);
      res.status(500).json({
        message: 'Failed to test function',
        statusCode: 500,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  async getEachExecution(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;   
      const exe = await databaseService.getEachExecution(id);   
      if (!exe) {
         res.status(404).json({
               message: `Execution with ID ${id} not found`,
               statusCode: 404
          });
          return;
      }
      const response = {
        id: exe._id,
        status: exe.status,
        duration: exe.duration,
        startTime: exe.startTime,
        functionId: exe.functionId,
        functionName: exe.functionName,
        endTime: exe.endTime,
        logs: exe.logs,
        errorMessage: exe.errorMessage,
        output: exe.output
      };
      res.status(200).json(response);
    } catch (error) {
      logger.error(`Error testing function: ${error}`);
      res.status(500).json({
        message: 'Failed to test function',
        statusCode: 500,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }


  async deleteAllExecution(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;   
      await databaseService.deleteAllExecution();   
      res.status(204).send();
    } catch (error) {
      logger.error(`Error testing function: ${error}`);
      res.status(500).json({
        message: 'Failed to test function',
        statusCode: 500,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }


  /**
   * Clean up all containers (admin endpoint)
   */
  async cleanupContainers(req: Request, res: Response): Promise<void> {
    try {
      logger.info('Cleaning up all containers...');
      
      await gVisor.cleanupAllContainers();
      
      res.status(200).json({
        message: 'All containers cleaned up successfully',
        statusCode: 200
      });
    } catch (error) {
      logger.error(`Error cleaning up containers: ${error}`);
      res.status(500).json({
        message: 'Failed to clean up containers',
        statusCode: 500,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

export default new ExecutionController();