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
    
    # Check current code - look for masterlinks route
    print("=== Checking current code ===")
    run_command(ssh, "grep -n 'masterlinks' /root/shopee-shortener/src/index.js | head -5")
    
    # Pull latest code from GitHub
    print("\n=== Pulling latest code from GitHub ===")
    run_command(ssh, "cd /root/shopee-shortener && git pull origin master")
    
    # Check again
    print("\n=== Checking updated code ===")
    run_command(ssh, "grep -n 'masterlinks' /root/shopee-shortener/src/index.js | head -5")
    
    # Restart PM2
    print("\n=== Restarting PM2 ===")
    run_command(ssh, "pm2 restart shortlink")
    
    import time
    time.sleep(3)
    
    # Test masterlinks route
    print("\n=== Testing /masterlinks route ===")
    run_command(ssh, "curl -s http://localhost:8080/masterlinks | head -15")
    
    ssh.close()
    print("\n=== DONE ===")

if __name__ == "__main__":
    main()
