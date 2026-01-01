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
    
    # Configure .env with Supabase credentials
    print("=== Configuring .env ===")
    env_content = """PORT=8080
JWT_SECRET=saddam-shortlink-jwt-secret-2025
SUPABASE_URL=https://glmujwzavinmeanfrlre.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sb_secret_10InmFmoAYq6rXAk14IYxA_WAU50iUT
"""
    
    # Write .env file
    run_command(ssh, f'cat > /root/shopee-shortener/.env << EOF\n{env_content}EOF')
    
    # Verify .env
    run_command(ssh, "cat /root/shopee-shortener/.env")
    
    # Restart PM2
    print("\n=== Restarting PM2 ===")
    run_command(ssh, "pm2 restart shortlink")
    
    # Wait
    import time
    time.sleep(3)
    
    # Check status
    run_command(ssh, "pm2 list")
    run_command(ssh, "pm2 logs shortlink --lines 20 --nostream")
    run_command(ssh, "netstat -tlnp | grep 8080")
    
    # Test curl
    run_command(ssh, "curl -s http://localhost:8080 | head -10")
    
    ssh.close()
    print("\n=== DONE ===")

if __name__ == "__main__":
    main()
