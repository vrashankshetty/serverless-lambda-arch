#!/bin/bash

# Update package list
sudo apt update

# Install gVisor
sudo apt install -y gvisor

# Install runsc runtime
sudo runsc install

# Verify installation
runsc --version

echo "gVisor (runsc) installed successfully."
