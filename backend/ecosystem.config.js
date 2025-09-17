module.exports = {
  apps: [
    {
      name: 'emr-backend',
      script: 'src/server.js',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 4000,
        MONGODB_URI: 'mongodb+srv://lakkaru_db_user:CNCRNYZsP1ImiLao@cluster0.0sji4aq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',
        JWT_SECRET: 'emr_for_every_hospital',
        JWT_EXPIRES_IN: '1h',
        ALLOWED_ORIGINS: 'https://emr.lakkaru.com'
      }
    }
  ]
};
