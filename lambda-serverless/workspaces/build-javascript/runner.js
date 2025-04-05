
const fs = require('fs');
const path = require('path');

async function runFunction(input) {
  try {
    // Load the function
    const functionPath = '/app/function/function.js';
    if (!fs.existsSync(functionPath)) {
      throw new Error('Function file not found');
    }
    
    // Clear require cache to ensure we get fresh code
    delete require.cache[require.resolve(functionPath)];
    
    // Import the function
    const fn = require(functionPath);
    
    if (typeof fn.handler !== 'function') {
      throw new Error("Function must export a 'handler' function");
    }
    
    // Execute function
    return await fn.handler(input);
  } catch (error) {
    return {
      error: error.message,
      stack: error.stack
    };
  }
}

// This file is used by the container to execute functions
// It's not directly exposed to the API but used internally
process.on('message', async (message) => {
  try {
    const result = await runFunction(message.input);
    process.send({ success: true, result });
  } catch (error) {
    process.send({ 
      success: false, 
      error: error.message,
      stack: error.stack
    });
  }
});