// src/api/controllers/execution.controller.ts
import { Request, Response } from 'express';
import databaseService from '../database/service';
import logger from '../utils/logger';
import dockerExecutionEngine from '../execution/index'

class ExecutionController {
  async executeFunction(req: Request, res: Response): Promise<void> {
    try {
      const { route } = req.params;
      const pathParams = req.params;
  
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
        headers: req.headers,
        path: pathParams,
        method: req.method,
        ...req.body
      };
  
      const startTime = new Date();
  
      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Function execution timed out')), func.timeout)
      );
  
      try {
        const executionResult:any = await Promise.race([
          dockerExecutionEngine.executeFunction(
            {
              name: func.name,
              language: func.language as 'javascript' | 'python',
              code: func.code,
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
      
      const executionResult = await dockerExecutionEngine.executeFunction(
        {
          name: `test-${Date.now()}`,
          language: language as 'javascript' | 'python',
          code,
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
  
  /**
   * Clean up all containers (admin endpoint)
   */
  async cleanupContainers(req: Request, res: Response): Promise<void> {
    try {
      logger.info('Cleaning up all containers...');
      
      await dockerExecutionEngine.cleanupAllContainers();
      
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