import paramiko
import time

HOST = "160.187.210.155"
USER = "root"
OLD_PASSWORD = "2K!#thWF0tkSAtN2Y8JFicVn"
NEW_PASSWORD = "Saddam2025!Secure"

def main():
    print(f"Connecting to {HOST}...")
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        ssh.connect(HOST, username=USER, password=OLD_PASSWORD, timeout=30)
        print("Connected!")
        
        # Get interactive shell
        channel = ssh.invoke_shell()
        time.sleep(2)
        
        # Read initial output
        output = ""
        while channel.recv_ready():
            output += channel.recv(4096).decode('utf-8')
        print(output)
        
        # Check if password change is required
        if "password" in output.lower() or "expired" in output.lower():
            print("Password change required, attempting to change...")
            
            # Send current password
            time.sleep(1)
            channel.send(OLD_PASSWORD + "\n")
            time.sleep(2)
            
            output = ""
            while channel.recv_ready():
                output += channel.recv(4096).decode('utf-8')
            print(output)
            
            # Send new password
            channel.send(NEW_PASSWORD + "\n")
            time.sleep(2)
            
            output = ""
            while channel.recv_ready():
                output += channel.recv(4096).decode('utf-8')
            print(output)
            
            # Confirm new password
            channel.send(NEW_PASSWORD + "\n")
            time.sleep(2)
            
            output = ""
            while channel.recv_ready():
                output += channel.recv(4096).decode('utf-8')
            print(output)
            
            print(f"\nPassword changed to: {NEW_PASSWORD}")
        
        channel.close()
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        ssh.close()

if __name__ == "__main__":
    main()
