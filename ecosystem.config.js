module.exports = {
  apps: [
    {
      name: 'nezuko',
      script: 'index.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      error_file: './config/logs/err.log',
      out_file: './config/logs/out.log',
      log_file: './config/logs/combined.log',
      time: false
    }
  ]
}
