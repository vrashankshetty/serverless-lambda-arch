sudo apt-get update
sudo apt-get install -y \
        ca-certificates \
        curl \
        gnupg \
        lsb-release \
        git
  
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
echo \
"deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
$(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose
  
      # Git installation (ensure it's the latest version)
sudo apt-get install -y git
  
      # Start Docker service
sudo systemctl enable docker
sudo systemctl start docker