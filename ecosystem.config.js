module.exports = {
  apps: [
    {
      name: 'nezuko',
      script: 'nezuko.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: false
    }
  ]
}
