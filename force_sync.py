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
    
    # Force reset to origin/master
    print("=== Force resetting to origin/master ===")
    run_command(ssh, "cd /root/shopee-shortener && git fetch origin")
    run_command(ssh, "cd /root/shopee-shortener && git reset --hard origin/master")
    
    # Check for masterlinks route
    print("\n=== Checking for masterlinks route ===")
    run_command(ssh, "grep -n 'masterlinks' /root/shopee-shortener/src/index.js | head -5")
    
    # Reinstall dependencies just in case
    print("\n=== Reinstalling dependencies ===")
    run_command(ssh, "cd /root/shopee-shortener && npm install", timeout=180)
    
    # Restore .env
    print("\n=== Restoring .env ===")
    env_content = """PORT=8080
JWT_SECRET=saddam-shortlink-jwt-secret-2025
SUPABASE_URL=https://glmujwzavinmeanfrlre.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sb_secret_10InmFmoAYq6rXAk14IYxA_WAU50iUT
"""
    run_command(ssh, f'cat > /root/shopee-shortener/.env << EOF\n{env_content}EOF')
    
    # Restart PM2
    print("\n=== Restarting PM2 ===")
    run_command(ssh, "pm2 restart shortlink")
    
    import time
    time.sleep(3)
    
    # Test
    print("\n=== Testing routes ===")
    run_command(ssh, "curl -s http://localhost:8080/ | head -5")
    run_command(ssh, "curl -s http://localhost:8080/masterlinks | head -5")
    
    ssh.close()
    print("\n=== DONE ===")

if __name__ == "__main__":
    main()
