// src/api/controllers/function.controller.ts
import { Request, Response } from 'express';
import { CreateFunctionRequest, UpdateFunctionRequest, } from '../types';
import databaseService from '../database/service';
import logger from '../utils/logger';
import dockerExecutionEngine from '../execution/index'
import gVisor from '../execution/gVisor';

class FunctionController {
  async createFunction(req: Request, res: Response): Promise<void> {
    try {
      const functionData: CreateFunctionRequest = req.body;
      
      // Check if the route already exists
      const existingFunction = await databaseService.getFunctionByRoute(functionData.route);
      if (existingFunction) {
        res.status(409).json({
          message: `Function route ${functionData.route} already exists`,
          statusCode: 409
        });
        return;
      }
      
      // Create the function
      const newFunction = await databaseService.createFunction(functionData);
      
      res.status(201).json({
        id: newFunction._id,
        name: newFunction.name,
        language: newFunction.language,
        code: newFunction.code,
        route: newFunction.route,
        virtualizationType: newFunction.virtualizationType,
        timeout: newFunction.timeout,
        createdAt: newFunction.createdAt,
        updatedAt: newFunction.updatedAt
      });
    } catch (error) {
      logger.error(`Error creating function: ${error}`);
      res.status(500).json({
        message: 'Failed to create function',
        statusCode: 500,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get all functions
   */
  async getAllFunctions(req: Request, res: Response): Promise<void> {
    try {
      const functions = await databaseService.getAllFunctions();
      
      const response = functions.map(func => ({
        id: func._id,
        name: func.name,
        language: func.language,
        route: func.route,
        timeout: func.timeout,
        virtualizationType: func.virtualizationType,
        createdAt: func.createdAt,
        updatedAt: func.updatedAt
      }));
      
      res.status(200).json(response);
    } catch (error) {
      logger.error(`Error fetching functions: ${error}`);
      res.status(500).json({
        message: 'Failed to retrieve functions',
        statusCode: 500,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get function by ID
   */
  async getFunctionById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const func = await databaseService.getFunctionById(id);
      
      if (!func) {
        res.status(404).json({
          message: `Function with ID ${id} not found`,
          statusCode: 404
        });
        return;
      }
      
      res.status(200).json({
        id: func._id,
        name: func.name,
        language: func.language,
        code: func.code,
        virtualizationType: func.virtualizationType,
        route: func.route,
        timeout: func.timeout,
        createdAt: func.createdAt,
        updatedAt: func.updatedAt
      });
    } catch (error) {
      logger.error(`Error fetching function: ${error}`);
      res.status(500).json({
        message: 'Failed to retrieve function',
        statusCode: 500,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Update function
   */
  async updateFunction(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData: UpdateFunctionRequest = req.body;
      
      const updatedFunction = await databaseService.updateFunction(id, updateData);
      
      if (!updatedFunction) {
        res.status(404).json({
          message: `Function with ID ${id} not found`,
          statusCode: 404
        });
        return;
      }
      
      await gVisor.deleteContainer(updatedFunction.name);
      
      res.status(200).json({
        id: updatedFunction._id,
        name: updatedFunction.name,
        language: updatedFunction.language,
        virtualizationType: updatedFunction.virtualizationType,
        code: updatedFunction.code,
        route: updatedFunction.route,
        timeout: updatedFunction.timeout,
        createdAt: updatedFunction.createdAt,
        updatedAt: updatedFunction.updatedAt
      });
    } catch (error) {
      logger.error(`Error updating function: ${error}`);
      res.status(500).json({
        message: 'Failed to update function',
        statusCode: 500,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Delete function
   */
  async deleteFunction(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const isDeleted = await databaseService.deleteFunction(id);
      
      if (!isDeleted) {
        res.status(404).json({
          message: `Function with ID ${id} not found`,
          statusCode: 404
        });
        return;
      }
      
      res.status(204).send();
    } catch (error) {
      logger.error(`Error deleting function: ${error}`);
      res.status(500).json({
        message: 'Failed to delete function',
        statusCode: 500,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get execution history for a function
   */
  async getFunctionExecutions(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      // Check if function exists
      const func = await databaseService.getFunctionById(id);
      if (!func) {
        res.status(404).json({
          message: `Function with ID ${id} not found`,
          statusCode: 404
        });
        return;
      }
      
      const executions = await databaseService.getFunctionExecutions(id);
      
      const response = executions.map(execution => ({
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
      logger.error(`Error fetching function executions: ${error}`);
      res.status(500).json({
        message: 'Failed to retrieve function executions',
        statusCode: 500,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

export default new FunctionController();