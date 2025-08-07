import App from './app';

const app = new App();

// Only run server locally
if (process.env.NODE_ENV !== 'production') {
  app.start(); // This is for local development only
}

// Required for Vercel: export the Express instance (handler)
module.exports = app.getApp();