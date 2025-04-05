// src/api/controllers/function.controller.ts
import { Request, Response } from 'express';
import databaseService from '../database/service';
import logger from '../utils/logger';
import { DashboardData } from '../types';

class DashboardController {
  /**
   * Get all functions
   */
  async getDashboard(req: Request, res: Response): Promise<void> {
    try {
        const data = await databaseService.getDashboard();
        res.status(200).json(data);
    } catch (error) {
      logger.error(`Error fetching functions: ${error}`);
      res.status(500).json({
        message: 'Failed to retrieve functions',
        statusCode: 500,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

}

export default new DashboardController();