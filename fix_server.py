import paramiko

HOST = "160.187.210.155"
USER = "root"
PASSWORD = "Saddam2025!Secure"

def run_command(ssh, cmd, timeout=300):
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
    
    # Reinstall npm dependencies
    print("=== Reinstalling npm dependencies ===")
    run_command(ssh, "cd /root/shopee-shortener && rm -rf node_modules package-lock.json")
    run_command(ssh, "cd /root/shopee-shortener && npm install", timeout=300)
    
    # Restart PM2
    print("\n=== Restarting PM2 ===")
    run_command(ssh, "pm2 restart shortlink")
    
    # Wait and check
    import time
    time.sleep(3)
    
    # Check status
    run_command(ssh, "pm2 list")
    run_command(ssh, "pm2 logs shortlink --lines 10 --nostream")
    run_command(ssh, "netstat -tlnp | grep 8080")
    
    # Test curl
    run_command(ssh, "curl -s http://localhost:8080 | head -20")
    
    ssh.close()
    print("\n=== DONE ===")

if __name__ == "__main__":
    main()
