# Lambda Serverless Function Platform

A TypeScript-based serverless function execution platform that enables users to deploy and execute functions on-demand via HTTP requests.

## System Architecture

```
+-------------------+        +-------------------+        +-------------------+
|                   |        |                   |        |                   |
|  Client Requests  +------->+  Express.js API   +------->+  Function Store   |
|                   |        |                   |        |   (MongoDB)       |
+-------------------+        +---------+---------+        +-------------------+
                                       |
                                       v
                             +---------+---------+
                             |                   |
                             |  Execution Engine |
                             |                   |
                             +---------+---------+
                                       |
                                       v
                             +---------+---------+
                             |                   |
                             |  Docker Container |
                             |                   |
                             +-------------------+
```

## Project Structure

```
lambda-serverless/
├── src/
│   ├── api/              # Express API routes
│   ├── database/         # MongoDB connection and models
│   ├── execution/        # Function execution engine
│   ├── models/           # Data models
│   ├── types/            # TypeScript interfaces and types
│   └── utils/            # Utility functions
├── docs/                 # Documentation
└── tests/                # Test files
```

## Getting Started

1. Clone the repository
2. Copy `.env.example` to `.env` and configure your environment variables
3. Install dependencies: `npm install`
4. Start the development server: `npm run dev`

## Scripts

- `npm run build`: Compile TypeScript to JavaScript
- `npm run dev`: Start development server with hot reload
- `npm start`: Run compiled JavaScript code
- `npm test`: Run Jest tests
- `npm run lint`: Run ESLint to check code style
- `npm run format`: Format code with Prettier

## Week 1 Deliverables

- TypeScript project setup and environment configuration
- Express.js API with MongoDB integration
- Docker setup for function execution
