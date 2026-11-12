const { spawn } = require('child_process');

console.log('⚖️  Starting SaralDocs (AI Legal Documentation Assistant) on localhost...\n');

const server = spawn('npm', ['--prefix', 'server', 'run', 'start'], {
  stdio: 'inherit',
  shell: true,
});

const client = spawn('npm', ['--prefix', 'client', 'run', 'dev'], {
  stdio: 'inherit',
  shell: true,
});

function cleanup() {
  console.log('\n🛑 Shutting down localhost services...');
  try { server.kill(); } catch {}
  try { client.kill(); } catch {}
  process.exit();
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

