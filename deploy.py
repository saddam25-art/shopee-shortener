import paramiko
import time

HOST = "160.187.210.155"
USER = "root"
PASSWORD = "Saddam2025!Secure"

def run_command(ssh, cmd, timeout=120):
    print(f"\n>>> Running: {cmd}")
    stdin, stdout, stderr = ssh.exec_command(cmd, timeout=timeout, get_pty=True)
    exit_status = stdout.channel.recv_exit_status()
    output = stdout.read().decode('utf-8')
    error = stderr.read().decode('utf-8')
    if output:
        print(output)
    if error and 'password' not in error.lower():
        print(f"STDERR: {error}")
    return exit_status, output, error

def main():
    print(f"Connecting to {HOST}...")
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        ssh.connect(HOST, username=USER, password=PASSWORD, timeout=30)
        print("Connected successfully!")
        
        # Check OS
        run_command(ssh, "cat /etc/os-release | head -5")
        
        # Update system
        print("\n=== Updating system ===")
        run_command(ssh, "apt-get update -y", timeout=180)
        
        # Install Node.js
        print("\n=== Installing Node.js ===")
        run_command(ssh, "curl -fsSL https://deb.nodesource.com/setup_18.x | bash -", timeout=120)
        run_command(ssh, "apt-get install -y nodejs", timeout=180)
        run_command(ssh, "node --version")
        run_command(ssh, "npm --version")
        
        # Install Git
        print("\n=== Installing Git ===")
        run_command(ssh, "apt-get install -y git", timeout=120)
        
        # Clone repo
        print("\n=== Cloning repository ===")
        run_command(ssh, "rm -rf /root/shopee-shortener")
        run_command(ssh, "cd /root && git clone https://github.com/saddam25-art/shopee-shortener.git", timeout=120)
        
        # Install dependencies
        print("\n=== Installing npm dependencies ===")
        run_command(ssh, "cd /root/shopee-shortener && npm install", timeout=300)
        
        # Create .env file
        print("\n=== Creating .env file ===")
        env_content = """PORT=8080
JWT_SECRET=your-secret-key-change-this
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_KEY=your-supabase-key
"""
        run_command(ssh, f'echo "{env_content}" > /root/shopee-shortener/.env')
        
        # Install PM2
        print("\n=== Installing PM2 ===")
        run_command(ssh, "npm install -g pm2", timeout=120)
        
        # Stop existing app if running
        run_command(ssh, "pm2 delete shortlink 2>/dev/null || true")
        
        # Start app with PM2
        print("\n=== Starting application ===")
        run_command(ssh, "cd /root/shopee-shortener && pm2 start src/index.js --name shortlink")
        run_command(ssh, "pm2 save")
        run_command(ssh, "pm2 startup systemd -u root --hp /root 2>/dev/null || true")
        
        # Check status
        print("\n=== Checking status ===")
        run_command(ssh, "pm2 list")
        
        # Install and configure Nginx
        print("\n=== Installing Nginx ===")
        run_command(ssh, "apt-get install -y nginx", timeout=120)
        
        nginx_config = """server {
    listen 80;
    server_name _;
    
    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}"""
        run_command(ssh, f"echo '{nginx_config}' > /etc/nginx/sites-available/shortlink")
        run_command(ssh, "ln -sf /etc/nginx/sites-available/shortlink /etc/nginx/sites-enabled/")
        run_command(ssh, "rm -f /etc/nginx/sites-enabled/default")
        run_command(ssh, "nginx -t")
        run_command(ssh, "systemctl restart nginx")
        run_command(ssh, "systemctl enable nginx")
        
        print("\n" + "="*50)
        print("DEPLOYMENT COMPLETE!")
        print("="*50)
        print(f"Your app is now running at: http://{HOST}")
        print("="*50)
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        ssh.close()

if __name__ == "__main__":
    main()
