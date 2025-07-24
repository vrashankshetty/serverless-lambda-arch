# Serverless Lambda Architecture

A full-stack serverless function execution platform built with TypeScript, featuring multiple virtualization technologies for secure and scalable function execution.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│                 │    │                 │    │                 │
│   Next.js       │◄───┤   Express.js    │◄───┤    MongoDB      │
│   Client        │    │   API Server    │    │   Database      │
│                 │    │                 │    │                 │
└─────────────────┘    └────────┬────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │  Execution      │
                       │  Engine         │
                       │  Manager        │
                       └────────┬────────┘
                                │
                ┌───────────────┼
                ▼               ▼               
        ┌──────────────┐ ┌──────────────┐ 
        │    Docker    │ │   gVisor     │ 
        │  Containers  │ │  Containers  │ 
        └──────────────┘ └──────────────┘ 

## 🚀 Features

- **Multi-Language Support**: Execute JavaScript and Python functions
- **Multiple Virtualization Technologies**:
  - Docker containers for standard isolation
  - gVisor containers for enhanced security
- **Real-time Dashboard**: Monitor function executions and performance
- **Code Editor**: Built-in Monaco editor for function development
- **Function Management**: Create, update, delete, and test functions
- **Execution Analytics**: Track performance metrics and execution history

## 📁 Project Structure

```
serverless-lambda-arch/
├── client/                    # Next.js frontend application
│   ├── app/                  # Next.js app router pages
│   ├── components/           # React components
│   │   └── ui/              # Reusable UI components
│   ├── hooks/               # Custom React hooks
│   ├── types/               # TypeScript type definitions
│   └── api/                 # API client functions
│
├── lambda-serverless/        # Backend API server
│   ├── src/
│   │   ├── api/             # Express.js route handlers
│   │   ├── controllers/     # Business logic controllers
│   │   ├── database/        # MongoDB connection and services
│   │   ├── execution/       # Function execution engines
│   │   │   ├── index.ts     # Docker execution engine
│   │   │   ├── gVisor.ts    # gVisor execution engine
│   │   │   └── firecracker.ts # Firecracker execution engine
│   │   ├── models/          # MongoDB schemas
│   │   ├── types/           # TypeScript interfaces
│   │   └── utils/           # Utility functions
│   ├── docs/                # Documentation
│   ├── scripts/             # Setup and utility scripts
│   └── workspaces/          # Runtime containers and build files
```

## 🛠️ Technology Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Modern React component library
- **React Query** - Server state management
- **Monaco Editor** - Code editor component

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **TypeScript** - Type-safe JavaScript
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling

### Virtualization & Containerization
- **Docker** - Container platform
- **gVisor** - Application kernel for containers

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm/pnpm
- Docker and Docker Compose
- MongoDB (local or cloud)
- gVisor (optional, for enhanced security)

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd serverless-lambda-arch/lambda-serverless
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment configuration**
   ```bash
   cp .env.example .env
   ```
   Configure your environment variables:
   ```env
   MONGODB_URI=mongodb://localhost:27017/lambda-functions
   PORT=3001
   NODE_ENV=development
   ```

4. **Setup gVisor (Optional)**
   ```bash
   chmod +x scripts/gVisor-ubuntu.sh
   ./scripts/gVisor-ubuntu.sh
   ```

5. **Start the server**
   ```bash
   npm run dev        # Development mode
   npm run build      # Build for production
   npm start          # Production mode
   ```

### Frontend Setup

1. **Navigate to client directory**
   ```bash
   cd ../client
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Start the development server**
   ```bash
   pnpm dev
   ```

4. **Access the application**
   Open [http://localhost:3000](http://localhost:3000) in your browser

## 🔧 API Endpoints

### Functions
- `GET /api/functions` - List all functions
- `POST /api/functions` - Create a new function
- `GET /api/functions/:id` - Get function details
- `PUT /api/functions/:id` - Update a function
- `DELETE /api/functions/:id` - Delete a function
- `POST /api/functions/test` - Test function code

### Execution
- `POST /api/execute/:route` - Execute a function
- `GET /api/executions` - List all executions
- `GET /api/executions/:id` - Get execution details

### Dashboard
- `GET /api/dashboard` - Get dashboard statistics

## 📊 Function Format

### JavaScript Functions
```javascript
exports.handler = async (event) => {
  // Your function logic here
  return {
    statusCode: 200,
    body: {
      message: "Hello from JavaScript!",
      input: event
    }
  };
};
```

### Python Functions
```python
def handler(event):
    # Your function logic here
    return {
        "statusCode": 200,
        "body": {
            "message": "Hello from Python!",
            "input": event
        }
    }
```

## 🏃‍♂️ Execution Engines

### Docker Engine
Standard Docker containers providing good isolation and broad compatibility.

### gVisor Engine  
Enhanced security through application kernel, providing defense in depth against container escapes.

## 🔒 Security Features

- **Isolated Execution**: Each function runs in its own container/VM
- **Timeout Protection**: Configurable execution timeouts
- **Resource Limits**: Memory and CPU constraints
- **Secure Runtime**: gVisor provides additional security layers

## 📈 Monitoring & Analytics

- **Real-time Dashboard**: View system statistics and recent executions
- **Function Metrics**: Track execution times and success rates
- **Execution History**: Detailed logs and error tracking
- **Performance Charts**: Visual representation of system performance

## 🧪 Testing

```bash
# Backend tests
cd lambda-serverless
npm test

# Frontend tests  
cd client
pnpm test
```

## 📚 Documentation

- [System Design](lambda-serverless/docs/system-design.md)
- [API Documentation](lambda-serverless/docs/)
