module.exports = {
  apps: [
    {
      name: 'subbyBot',
      script: 'subbyBot.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      error_file: './data/logs/bot/err.log',
      out_file: './data/logs/bot/out.log',
      log_file: './data/logs/bot/combined.log',
      time: false
    }
  ]
}
