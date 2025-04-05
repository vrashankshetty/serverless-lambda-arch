// src/services/FirecrackerExecutionEngine.ts

import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { exec, spawn } from 'child_process';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const execPromise = promisify(exec);
const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);
const readFile = promisify(fs.readFile);

// Define types
interface FunctionData {
  name: string;
  language: 'javascript' | 'python';
  code: string;
  route: string;
  virtualizationType: string;
  timeout?: number;
}

interface MicroVMInfo {
  id: string;
  name: string;
  socketPath: string;
  ip: string;
  lastUsed: number;
  process?: any;
}

interface ExecutionResult {
  success: boolean;
  result?: any;
  error?: string;
  output?: string;
  stack?: string;
  executionTime?: number;
  vmId?: string;
}

class FirecrackerExecutionEngine {
  private microVMs: Map<string, MicroVMInfo>;
  private workspaceDir: string;
  private idleTimeout: number;
  private cleanupInterval: NodeJS.Timeout;
  private kernelPath: string;
  private rootfsPath: string;
  private firecrackerBin: string;
  private bridge: string;
  private tapPrefix: string;
  private baseIp: string;
  private subnet: string;

  constructor() {
    this.microVMs = new Map<string, MicroVMInfo>(); // Map to track running VMs
    this.workspaceDir = path.join(process.cwd(), 'firecracker-workspaces');
    this.idleTimeout = 5 * 60 * 1000; // 5 minutes in milliseconds
    
    // Firecracker specific paths
    this.firecrackerBin = '/usr/local/bin/firecracker';
    this.kernelPath = path.join(process.cwd(), 'resources', 'vmlinux');
    this.rootfsPath = path.join(process.cwd(), 'resources', 'rootfs.ext4');
    
    // Networking configuration
    this.bridge = 'fcbr0';
    this.tapPrefix = 'fc-tap-';
    this.baseIp = '172.20.0';
    this.subnet = '172.20.0.0/16';
    
    // Ensure workspace directory exists
    if (!fs.existsSync(this.workspaceDir)) {
      fs.mkdirSync(this.workspaceDir, { recursive: true });
    }
    
    // Check if Firecracker binary exists
    if (!fs.existsSync(this.firecrackerBin)) {
      console.warn(`WARNING: Firecracker binary not found at ${this.firecrackerBin}. Make sure to install it.`);
    }
    
    // Check if kernel and rootfs exist
    if (!fs.existsSync(this.kernelPath)) {
      console.warn(`WARNING: Kernel image not found at ${this.kernelPath}. Make sure to prepare it.`);
    }
    
    if (!fs.existsSync(this.rootfsPath)) {
      console.warn(`WARNING: Root filesystem not found at ${this.rootfsPath}. Make sure to prepare it.`);
    }
    
    // Start idle VM cleanup process
    this.cleanupInterval = setInterval(() => this.cleanupIdleVMs(), 60 * 1000); // Check every minute
    
    console.log('Firecracker Execution Engine initialized');
  }
  
  /**
   * Check if a VM exists for the given route
   */
  async checkVM(route: string): Promise<boolean> {
    if (!this.microVMs.has(route)) {
      return false;
    }
    
    const vmInfo = this.microVMs.get(route)!;
    
    try {
      // Check if VM is still running by pinging the socket
      await axios.get(`http://${vmInfo.ip}:8080/health`);
      return true;
    } catch (error) {
      // VM is not responding, consider it dead
      this.microVMs.delete(route);
      return false;
    }
  }

  /**
   * Setup network bridge for VMs
   */
  private async setupNetworking(): Promise<void> {
    try {
      // Check if bridge exists
      const { stdout } = await execPromise('ip link show ' + this.bridge);
      console.log('Bridge already exists, reusing it');
    } catch (error) {
      // Bridge doesn't exist, create it
      console.log('Setting up network bridge...');
      try {
        await execPromise(`ip link add ${this.bridge} type bridge`);
        await execPromise(`ip addr add ${this.baseIp}.1/24 dev ${this.bridge}`);
        await execPromise(`ip link set ${this.bridge} up`);
        await execPromise(`iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE`);
        await execPromise(`sysctl -w net.ipv4.ip_forward=1`);
        console.log('Network bridge setup complete');
      } catch (setupError) {
        console.error('Failed to set up networking:', setupError);
        throw new Error('Network setup failed');
      }
    }
  }
  
  /**
   * Create a unique TAP device for a VM
   */
  private async createTapDevice(vmId: string): Promise<string> {
    const tapName = `${this.tapPrefix}${vmId.substring(0, 8)}`;
    
    try {
      await execPromise(`ip tuntap add ${tapName} mode tap`);
      await execPromise(`ip link set ${tapName} master ${this.bridge}`);
      await execPromise(`ip link set ${tapName} up`);
      console.log(`Created TAP device ${tapName}`);
      return tapName;
    } catch (error) {
      console.error(`Failed to create TAP device: ${error}`);
      throw error;
    }
  }
  
  /**
   * Start a MicroVM for the given function
   */
  async startVM(functionData: FunctionData): Promise<string> {
    const { name, language, code, route } = functionData;
    
    // Generate a unique ID for this VM
    const vmId = uuidv4();
    const vmName = `lambda-${name.replace(/[^a-zA-Z0-9-_]/g, '-')}-${vmId.substring(0, 8)}`;
    const vmDir = path.join(this.workspaceDir, vmName);
    const socketPath = path.join(vmDir, 'firecracker.socket');
    
    try {
      // Create VM workspace directory
      await mkdir(vmDir, { recursive: true });
      
      // Set up networking
      await this.setupNetworking();
      const tapDevice = await this.createTapDevice(vmId);
      
      // Allocate IP address for this VM
      const ipSuffix = this.microVMs.size + 10; // Start from 10 to avoid conflicts
      const ip = `${this.baseIp}.${ipSuffix}`;
      
      // Prepare VM configuration
      const vmConfig = {
        boot_source: {
          kernel_image_path: this.kernelPath,
          boot_args: "console=ttyS0 reboot=k panic=1 pci=off"
        },
        drives: [
          {
            drive_id: "rootfs",
            path_on_host: this.rootfsPath,
            is_root_device: true,
            is_read_only: false
          }
        ],
        network_interfaces: [
          {
            iface_id: "eth0",
            guest_mac: `AA:FC:00:00:00:${ipSuffix.toString(16).padStart(2, '0')}`,
            host_dev_name: tapDevice
          }
        ],
        machine_config: {
          vcpu_count: 1,
          mem_size_mib: 128,
          ht_enabled: false
        }
      };
      
      // Write VM configuration to disk
      await writeFile(path.join(vmDir, 'config.json'), JSON.stringify(vmConfig, null, 2));
      
      // Start Firecracker process
      console.log(`Starting Firecracker for VM ${vmName}...`);
      const fc = spawn(this.firecrackerBin, ['--api-sock', socketPath, '--id', vmId], {
        detached: true,
        stdio: ['ignore', 'pipe', 'pipe']
      });
      
      // Store logs for debugging
      let fcLogs = '';
      fc.stdout.on('data', (data) => { fcLogs += data.toString(); });
      fc.stderr.on('data', (data) => { fcLogs += data.toString(); });
      
      // Wait for Firecracker to start
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Configure the VM through the API
      try {
        // Put boot source
        await axios.put(`http://localhost/boot-source`, vmConfig.boot_source, {
          socketPath: socketPath
        });
        
        // Put rootfs
        await axios.put(`http://localhost/drives/rootfs`, vmConfig.drives[0], {
          socketPath: socketPath
        });
        
        // Put network interface
        await axios.put(`http://localhost/network-interfaces/eth0`, vmConfig.network_interfaces[0], {
          socketPath: socketPath
        });
        
        // Set machine config
        await axios.put(`http://localhost/machine-config`, vmConfig.machine_config, {
          socketPath: socketPath
        });
        
        // Start the VM
        await axios.put(`http://localhost/actions`, { action_type: "InstanceStart" }, {
          socketPath: socketPath
        });
        
        console.log(`VM ${vmName} started successfully`);
      } catch (configError) {
        console.error(`Failed to configure VM: ${configError}`);
        console.error(`Firecracker logs: ${fcLogs}`);
        throw configError;
      }
      
      // Prepare function code and runtime
      await this.setupFunction(vmName, language, code, ip);
      
      // Store VM info
      this.microVMs.set(route, {
        id: vmId,
        name: vmName,
        socketPath,
        ip,
        lastUsed: Date.now(),
        process: fc
      });
      
      console.log(`MicroVM ${vmId} started for route ${route} with IP ${ip}`);
      return vmId;
    } catch (error) {
      console.error(`Error starting MicroVM: ${error}`);
      throw error;
    }
  }
  
  /**
   * Setup function code and runtime in the VM
   */
  private async setupFunction(vmName: string, language: 'javascript' | 'python', code: string, ip: string): Promise<void> {
    try {
      // Wait for VM to fully boot and SSH to be available
      await this.waitForSSH(ip);
      
      // Prepare VM with necessary packages
      if (language === 'javascript') {
        await this.execInVM(ip, 'apt-get update && apt-get install -y nodejs npm');
        await this.execInVM(ip, 'npm install -g express axios');
      } else if (language === 'python') {
        await this.execInVM(ip, 'apt-get update && apt-get install -y python3 python3-pip');
        await this.execInVM(ip, 'pip3 install flask requests numpy pandas');
      }
      
      // Create function directory
      await this.execInVM(ip, 'mkdir -p /app/function');
      
      // Upload function code
      const functionFile = language === 'javascript' ? 'function.js' : 'function.py';
      await this.uploadToVM(ip, code, `/app/function/${functionFile}`);
      
      // Prepare runtime code
      if (language === 'javascript') {
        const packageJson = JSON.stringify({
          name: `function-${vmName}`,
          version: '1.0.0',
          main: 'function.js'
        }, null, 2);
        
        await this.uploadToVM(ip, packageJson, '/app/function/package.json');
        
        // Upload runner script
        const runnerJs = `
const fs = require('fs');
const path = require('path');
const express = require('express');
const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).send({ status: 'ok' });
});

app.post('/invoke', async (req, res) => {
  try {
    // Load the function
    const functionPath = '/app/function/function.js';
    if (!fs.existsSync(functionPath)) {
      return res.status(404).json({ error: 'Function file not found' });
    }
    
    // Clear require cache to ensure we get fresh code
    delete require.cache[require.resolve(functionPath)];
    
    // Import the function
    const fn = require(functionPath);
    
    if (typeof fn.handler !== 'function') {
      return res.status(400).json({ error: "Function must export a 'handler' function" });
    }
    
    // Prepare input
    const input = req.body || {};
    const event = {
      ...input,
      body: input,
      query: req.query || {},
      headers: req.headers || {},
      path: {},
      context: {
        executionId: Date.now().toString(),
        functionName: path.basename(path.dirname(functionPath)),
        timestamp: Date.now(),
        deadline: Date.now() + (req.body.timeout || 30000)
      }
    };
    
    // Execute function
    const startTime = Date.now();
    const result = await Promise.resolve(fn.handler(event));
    const executionTime = Date.now() - startTime;
    
    res.json({
      success: true,
      result,
      executionTime
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message,
      stack: error.stack
    });
  }
});

const PORT = 8080;
app.listen(PORT, '0.0.0.0', () => {
  console.log(\`Function server running on port \${PORT}\`);
});`;
        
        await this.uploadToVM(ip, runnerJs, '/app/runner.js');
        
        // Start the server
        await this.execInVM(ip, 'cd /app && node runner.js > /app/server.log 2>&1 &');
      } else if (language === 'python') {
        // Upload runner script for Python
        const runnerPy = `
import sys
import os
import json
import importlib.util
import traceback
from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok"})

@app.route('/invoke', methods=['POST'])
def invoke():
    try:
        # Load the function dynamically
        spec = importlib.util.spec_from_file_location("function", "/app/function/function.py")
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        
        if not hasattr(module, "handler"):
            return jsonify({"error": "Function must define a 'handler' function"}), 400
        
        # Prepare input
        input_data = request.json or {}
        event = {
            **input_data,
            "body": input_data,
            "query": request.args.to_dict(),
            "headers": dict(request.headers),
            "path": {},
            "context": {
                "executionId": str(int(time.time() * 1000)),
                "functionName": os.path.basename(os.path.dirname("/app/function/function.py")),
                "timestamp": int(time.time() * 1000),
                "deadline": int(time.time() * 1000) + (input_data.get("timeout", 30000))
            }
        }
        
        # Execute function
        import time
        start_time = time.time()
        result = module.handler(event)
        execution_time = int((time.time() - start_time) * 1000)
        
        return jsonify({
            "success": True,
            "result": result,
            "executionTime": execution_time
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e),
            "traceback": traceback.format_exc()
        }), 500

if __name__ == "__main__":
    import time
    app.run(host="0.0.0.0", port=8080)
`;
        
        await this.uploadToVM(ip, runnerPy, '/app/runner.py');
        
        // Start the server
        await this.execInVM(ip, 'cd /app && python3 runner.py > /app/server.log 2>&1 &');
      }
      
      // Verify the server is running
      await this.waitForServer(ip);
      
      console.log(`Function setup complete for VM with IP ${ip}`);
    } catch (error) {
      console.error(`Error setting up function in VM: ${error}`);
      throw error;
    }
  }
  
  /**
   * Wait for SSH to be available on the VM
   */
  private async waitForSSH(ip: string, maxRetries = 30): Promise<void> {
    console.log(`Waiting for SSH on ${ip}...`);
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        await execPromise(`ssh -o StrictHostKeyChecking=no -o ConnectTimeout=1 ubuntu@${ip} echo "SSH available"`);
        console.log(`SSH is available on ${ip}`);
        return;
      } catch (error) {
        console.log(`Waiting for SSH... attempt ${i + 1}/${maxRetries}`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    throw new Error(`SSH not available on ${ip} after ${maxRetries} attempts`);
  }
  
  /**
   * Wait for the function server to be available
   */
  private async waitForServer(ip: string, maxRetries = 30): Promise<void> {
    console.log(`Waiting for function server on ${ip}:8080...`);
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        const response = await axios.get(`http://${ip}:8080/health`, { timeout: 1000 });
        
        if (response.status === 200) {
          console.log(`Function server is running on ${ip}:8080`);
          return;
        }
      } catch (error) {
        console.log(`Waiting for function server... attempt ${i + 1}/${maxRetries}`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    throw new Error(`Function server not available on ${ip}:8080 after ${maxRetries} attempts`);
  }
  
  /**
   * Execute a command in the VM
   */
  private async execInVM(ip: string, command: string): Promise<string> {
    try {
      const { stdout, stderr } = await execPromise(`ssh -o StrictHostKeyChecking=no ubuntu@${ip} '${command.replace(/'/g, "'\\''")}'`);
      
      if (stderr) {
        console.warn(`Warning from VM command: ${stderr}`);
      }
      
      return stdout.trim();
    } catch (error: any) {
      console.error(`Error executing command in VM: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Upload a file or string to the VM
   */
  private async uploadToVM(ip: string, contentOrPath: string, remotePath: string): Promise<void> {
    try {
      // Check if the content is a path or a string
      if (fs.existsSync(contentOrPath)) {
        // It's a file path, use scp to upload
        await execPromise(`scp -o StrictHostKeyChecking=no ${contentOrPath} ubuntu@${ip}:${remotePath}`);
      } else {
        // It's a string content, write to a temp file and upload
        const tempFile = path.join(this.workspaceDir, `temp-${Date.now()}`);
        await writeFile(tempFile, contentOrPath);
        
        await execPromise(`scp -o StrictHostKeyChecking=no ${tempFile} ubuntu@${ip}:${remotePath}`);
        
        // Clean up temp file
        fs.unlinkSync(tempFile);
      }
      
      console.log(`Uploaded to ${remotePath} on VM ${ip}`);
    } catch (error) {
      console.error(`Error uploading to VM: ${error}`);
      throw error;
    }
  }
  
  /**
   * Execute a function in its VM
   */
  async executeFunction(functionData: FunctionData, input: any = {}): Promise<ExecutionResult> {
    const { route } = functionData;
    let vmId: string | undefined;
    
    try {
      // Check if VM exists
      const vmExists = await this.checkVM(route);
      
      if (vmExists) {
        // Use existing VM
        vmId = this.microVMs.get(route)!.id;
        console.log(`Using existing VM ${vmId} for route ${route}`);
      } else {
        // Start new VM
        vmId = await this.startVM(functionData);
      }
      
      const vmInfo = this.microVMs.get(route)!;
      
      // Execute function in VM
      console.log(`Executing function in VM ${vmId} at ${vmInfo.ip}`);
      const startTime = Date.now();
      
      // Call the function server
      const response = await axios.post(`http://${vmInfo.ip}:8080/invoke`, input, {
        timeout: functionData.timeout || 30000
      });
      
      const executionTime = Date.now() - startTime;
      
      // Update last used time
      vmInfo.lastUsed = Date.now();
      this.microVMs.set(route, vmInfo);
      
      // Process result
      const result = response.data;
      
      return {
        ...result,
        executionTime,
        vmId
      };
    } catch (error: any) {
      console.error(`Error executing function for route ${route}:`, error);
      
      return {
        success: false,
        error: error.message,
        vmId
      };
    }
  }
  
  /**
   * Clean up VMs that have been idle for too long
   */
  async cleanupIdleVMs(): Promise<void> {
    console.log('Checking for idle VMs...');
    const now = Date.now();
    
    for (const [route, vmInfo] of this.microVMs.entries()) {
      const idleTime = now - vmInfo.lastUsed;
      
      if (idleTime > this.idleTimeout) {
        console.log(`VM ${vmInfo.id} for route ${route} idle for ${idleTime}ms, removing...`);
        
        try {
          await this.shutdownVM(vmInfo);
          this.microVMs.delete(route);
          console.log(`Removed idle VM ${vmInfo.id}`);
        } catch (error) {
          console.error(`Error removing VM ${vmInfo.id}:`, error);
        }
      }
    }
  }
  
  /**
   * Shutdown a VM
   */
  private async shutdownVM(vmInfo: MicroVMInfo): Promise<void> {
    try {
      // Try to shut down gracefully via the API
      await axios.put(`http://localhost/actions`, { action_type: "SendCtrlAltDel" }, {
        socketPath: vmInfo.socketPath
      });
      
      // Wait for VM to shut down
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Kill the Firecracker process if still running
      if (vmInfo.process) {
        vmInfo.process.kill();
      }
      
      // Clean up the tap device
      const tapName = `${this.tapPrefix}${vmInfo.id.substring(0, 8)}`;
      try {
        await execPromise(`ip link delete ${tapName}`);
      } catch (netError) {
        console.warn(`Could not delete tap device ${tapName}: ${netError}`);
      }
      
      console.log(`VM ${vmInfo.id} shut down`);
    } catch (error) {
      console.error(`Error shutting down VM ${vmInfo.id}:`, error);
      throw error;
    }
  }
  
  /**
   * Clean up all VMs managed by this engine
   */
  async cleanupAllVMs(): Promise<void> {
    console.log('Cleaning up all VMs...');
    
    const promises: Promise<void>[] = [];
    for (const [route, vmInfo] of this.microVMs.entries()) {
      console.log(`Removing VM ${vmInfo.id} for route ${route}`);
      
      const promise = (async () => {
        try {
          await this.shutdownVM(vmInfo);
          console.log(`Removed VM ${vmInfo.id}`);
        } catch (error) {
          console.error(`Error removing VM ${vmInfo.id}:`, error);
        }
      })();
      
      promises.push(promise);
    }
    
    await Promise.all(promises);
    this.microVMs.clear();
    
    // Clean up bridge if it exists
    try {
      await execPromise(`ip link delete ${this.bridge}`);
      console.log(`Removed network bridge ${this.bridge}`);
    } catch (error) {
      console.warn(`Could not remove network bridge: ${error}`);
    }
    
    // Clear the cleanup interval
    clearInterval(this.cleanupInterval);
    
    console.log('All VMs removed');
  }

  async deleteVM(name: string): Promise<void> {
    const vmName = `lambda-${name.replace(/[^a-zA-Z0-9-_]/g, '-')}`;
    
    // Find VM by name
    let vmInfoToRemove: MicroVMInfo | undefined;
    let routeToRemove: string | undefined;
    
    for (const [route, vmInfo] of this.microVMs.entries()) {
      if (vmInfo.name.startsWith(vmName)) {
        vmInfoToRemove = vmInfo;
        routeToRemove = route;
        break;
      }
    }
    
    if (!vmInfoToRemove || !routeToRemove) {
      console.log(`VM ${vmName}* not found`);
      return;
    }
    
    try {
      console.log(`Shutting down VM ${vmInfoToRemove.name}`);
      await this.shutdownVM(vmInfoToRemove);
      this.microVMs.delete(routeToRemove);
      console.log(`VM ${vmInfoToRemove.name} deleted successfully`);
    } catch (error) {
      console.error(`Error deleting VM ${vmInfoToRemove.name}:`, error);
      throw error;
    }
  }
}

export default new FirecrackerExecutionEngine();