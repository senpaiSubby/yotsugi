module.exports = {
  apps: [
    {
      name: 'nezuko',
      script: 'index.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      error_file: './data/logs/err.log',
      out_file: './data/logs/out.log',
      log_file: './data/logs/combined.log',
      time: false
    }
  ]
}
