import paramiko

HOST = "160.187.210.155"
USER = "root"
PASSWORD = "Saddam2025!Secure"

def run_command(ssh, cmd, timeout=120):
    print(f"\n>>> {cmd}")
    stdin, stdout, stderr = ssh.exec_command(cmd, get_pty=True, timeout=timeout)
    stdout.channel.recv_exit_status()
    output = stdout.read().decode('utf-8')
    print(output)
    return output

def main():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(HOST, username=USER, password=PASSWORD, timeout=30)
    
    # Delete old PM2 process
    print("=== Deleting old PM2 process ===")
    run_command(ssh, "pm2 delete shortlink")
    
    # Create ecosystem file for PM2 with env vars
    print("\n=== Creating PM2 ecosystem file ===")
    ecosystem = """module.exports = {
  apps: [{
    name: 'shortlink',
    script: 'src/index.js',
    cwd: '/root/shopee-shortener',
    env: {
      PORT: 8080,
      JWT_SECRET: 'saddam-shortlink-jwt-secret-2025',
      SUPABASE_URL: 'https://glmujwzavinmeanfrlre.supabase.co',
      SUPABASE_SERVICE_ROLE_KEY: 'sb_secret_10InmFmoAYq6rXAk14IYxA_WAU50iUT'
    }
  }]
};
"""
    run_command(ssh, f"cat > /root/shopee-shortener/ecosystem.config.cjs << 'EOF'\n{ecosystem}EOF")
    
    # Start with ecosystem file
    print("\n=== Starting PM2 with ecosystem file ===")
    run_command(ssh, "cd /root/shopee-shortener && pm2 start ecosystem.config.cjs")
    
    import time
    time.sleep(3)
    
    # Check status
    run_command(ssh, "pm2 list")
    run_command(ssh, "pm2 logs shortlink --lines 15 --nostream")
    
    # Test
    print("\n=== Testing ===")
    run_command(ssh, "curl -s http://localhost:8080/admin | head -10")
    
    ssh.close()

if __name__ == "__main__":
    main()
