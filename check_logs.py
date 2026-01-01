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
    
    # Check PM2 logs for errors
    print("=== PM2 Error Logs ===")
    run_command(ssh, "pm2 logs shortlink --lines 50 --nostream")
    
    # Check .env file
    print("\n=== .env file ===")
    run_command(ssh, "cat /root/shopee-shortener/.env")
    
    ssh.close()

if __name__ == "__main__":
    main()
