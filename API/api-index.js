// api/index.js - Vercel Serverless Function
import express from 'express';

// Import your existing server setup
import('../server/index.js').then(({ default: app }) => {
  // Export for Vercel
  export default app;
});
