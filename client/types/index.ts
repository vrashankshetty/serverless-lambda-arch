export interface FunctionMetadata {
    _id?: string;
    name: string;
    language:string;
    code: string;
    route: string;
    virtualizationType: string;
    timeout: number;
    createdAt?: Date;
    updatedAt?: Date;
  }
  
  
 export interface Function {
    id?: string;
    name: string;
    language: 'javascript' | 'python';
    code: string;
    route: string;
    virtualizationType: string;
    timeout: number;
    createdAt?: Date;
    updatedAt?: Date;
  }
  
  export interface Execution {
    id?: string;
    functionId: string;
    functionName: string;
    status: 'success' | 'error';
    duration: number;
    startTime: Date;
    endTime: Date;
    logs?: string;
    errorMessage?: string;
    output?: any;
  }
  
  
  export interface Dashboard{
    totalFunctions: number;
    totalExecutions: number;
    avgExecutionTime: number;
    recentExecutions: Execution[];
    successfulExecutions: number;
  }