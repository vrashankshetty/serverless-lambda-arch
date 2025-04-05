// src/types/index.ts
export interface FunctionMetadata {
  _id?: string;
  name: string;
  language: 'python' | 'javascript';
  code: string;
  route: string;
  virtualizationType: string;
  timeout: number;
  createdAt?: Date;
  updatedAt?: Date;
}


export interface DashboardData {
  totalFunctions: number;
  totalExecutions: number;
  avgExecutionTime: string;
  recentExecutions:any[];
  successfulExecutions: string;
}

export interface ExecutionResult {
  _id?: string;
  functionId: string;
  functionName: string;
  status: 'success' | 'error';
  duration: number;
  startTime: Date;
  endTime: Date;
  logs: string;
  errorMessage?: string;
  output?: any;
}

export enum VirtualizationType {
  DOCKER = 'docker',
  MICRO_VM = 'microvm'
}

// API request and response types
export interface CreateFunctionRequest {
  name: string;
  language: 'python' | 'javascript';
  code: string;
  route: string;
  virtualizationType: string;
  timeout: number;
}

export interface UpdateFunctionRequest {
  name?: string;
  code?: string;
  virtualizationType: string;
  timeout?: number;
}

export interface FunctionResponse extends FunctionMetadata {
  id: string;
}

export interface ExecutionResponse extends ExecutionResult {
  id: string;
}

export interface ExecuteFunctionRequest {
  params?: Record<string, any>;
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: any;
}