import { execSync } from 'node:child_process';

const ports = [3000, 3001];

for (const port of ports) {
  try {
    const pids = execSync(`lsof -ti :${port}`, { encoding: 'utf8' }).trim();
    if (!pids) continue;
    for (const pid of pids.split('\n').filter(Boolean)) {
      try {
        process.kill(Number(pid), 'SIGTERM');
      } catch {
        // process may already be gone
      }
    }
  } catch {
    // no process on this port
  }
}
