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
    
    # Update ecosystem file with correct service role key
    print("=== Updating PM2 ecosystem with correct Supabase key ===")
    ecosystem = """module.exports = {
  apps: [{
    name: 'shortlink',
    script: 'src/index.js',
    cwd: '/root/shopee-shortener',
    env: {
      PORT: 8080,
      JWT_SECRET: 'saddam-shortlink-jwt-secret-2025',
      SUPABASE_URL: 'https://glmujwzavinmeanfrlre.supabase.co',
      SUPABASE_SERVICE_ROLE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdsbXVqd3phdmlubWVhbmZybHJlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTcxNDkzMywiZXhwIjoyMDgxMjkwOTMzfQ.TsyUUW-RSMLLWKNLae7A44TQ5sHXEi9jCTrjAcd6dRI'
    }
  }]
};
"""
    run_command(ssh, f"cat > /root/shopee-shortener/ecosystem.config.cjs << 'EOF'\n{ecosystem}EOF")
    
    # Restart PM2
    print("\n=== Restarting PM2 ===")
    run_command(ssh, "pm2 delete shortlink 2>/dev/null || true")
    run_command(ssh, "cd /root/shopee-shortener && pm2 start ecosystem.config.cjs")
    
    import time
    time.sleep(3)
    
    # Check status
    run_command(ssh, "pm2 list")
    run_command(ssh, "pm2 logs shortlink --lines 10 --nostream")
    
    # Test register
    print("\n=== Testing register ===")
    run_command(ssh, """curl -s -X POST http://localhost:8080/api/auth/register \\
        -H "Content-Type: application/json" \\
        -d '{"username":"testuser","email":"test@test.com","password":"test123456"}'""")
    
    ssh.close()
    print("\n=== DONE ===")

if __name__ == "__main__":
    main()
