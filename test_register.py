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
    
    # Test register endpoint
    print("=== Testing register endpoint ===")
    run_command(ssh, """curl -s -X POST http://localhost:8080/api/auth/register \\
        -H "Content-Type: application/json" \\
        -d '{"email":"test@test.com","password":"test123","name":"Test User"}'""")
    
    # Check latest logs
    print("\n=== Latest logs ===")
    run_command(ssh, "pm2 logs shortlink --lines 30 --nostream")
    
    ssh.close()

if __name__ == "__main__":
    main()
