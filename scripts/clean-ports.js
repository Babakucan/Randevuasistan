// Script to clean up ports 3000 and 3001 on Windows
const { execSync } = require('child_process');

function killProcessOnPort(port) {
  try {
    // Find process using the port
    const result = execSync(`netstat -ano | findstr ":${port}.*LISTENING"`, { encoding: 'utf-8' });
    const lines = result.trim().split('\n');
    
    lines.forEach(line => {
      const parts = line.trim().split(/\s+/);
      const pid = parts[parts.length - 1];
      if (pid && !isNaN(pid)) {
        try {
          console.log(`Killing process ${pid} on port ${port}...`);
          execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
        } catch (e) {
          // Process might already be dead
        }
      }
    });
  } catch (e) {
    // No process found on this port, that's fine
  }
}

console.log('Cleaning up ports 3000 and 3001...');
killProcessOnPort(3000);
killProcessOnPort(3001);
console.log('Port cleanup complete!');

