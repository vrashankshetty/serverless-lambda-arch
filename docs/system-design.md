# System Design

## Components

1. **API Layer (Express.js with TypeScript)**
   - Handles HTTP requests
   - Manages function CRUD operations
   - Routes execution requests to the execution engine

2. **Database Layer (MongoDB)**
   - Stores function metadata
   - Stores function code
   - Tracks execution history

3. **Execution Engine**
   - Manages Docker containers
   - Handles function packaging
   - Executes functions
   - Enforces timeout constraints

4. **Docker Integration**
   - Provides isolation for function execution
   - Supports multiple runtimes (Python, JavaScript)
   - Manages container lifecycle

## Data Models

### Function
- id: string (unique identifier)
- name: string (function name)
- language: 'python' | 'javascript' (function runtime)
- code: string (function source code)
- route: string (HTTP path for function)
- timeout: number (execution timeout in ms)
- createdAt: Date
- updatedAt: Date

### Execution
- id: string (unique identifier)
- functionId: string (reference to function)
- status: 'success' | 'error'
- duration: number (execution time in ms)
- startTime: Date
- endTime: Date
- logs: string (execution logs)
- errorMessage?: string (if applicable)
- output?: any (function return value)
