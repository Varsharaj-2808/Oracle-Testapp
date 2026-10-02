module.exports = {
  apps: [
    {
      name: 'env-secret-testapp-api',
      script: 'backend/src/bootstrap.js',
      cwd: __dirname,
      interpreter: 'node',
      env: {
        NODE_ENV: 'production',
        // Set explicitly so this wins over any ambient value inherited from the
        // shell that happens to launch pm2. env.js reads process.env first.
        PORT: '4000',
        CORS_ORIGIN: 'https://demo13.pentaxialtechnologies.com',
      },
      error_file: './logs/api-error.log',
      out_file: './logs/api-out.log',
      merge_logs: true,
      max_memory_restart: '300M',
    },
  ],
};
