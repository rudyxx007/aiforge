const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 5000; // This server will run on port 5000

app.use(cors()); // Allow all origins

// --- API Proxies ---
// All requests to /api/auth/* will be forwarded to the auth-service
app.use('/api/auth', createProxyMiddleware({
  target: 'http://auth-service:8000', // Docker-compose service name
  changeOrigin: true,
  pathRewrite: { '^/api/auth': '' }, // Remove /api/auth prefix
}));

// Proxy for project-service
app.use('/api/projects', createProxyMiddleware({
  target: 'http://project-service:8000',
  changeOrigin: true,
  pathRewrite: { '^/api/projects': '' },
}));

// Proxy for analysis-service
app.use('/api/analysis', createProxyMiddleware({
  target: 'http://analysis-service:8000',
  changeOrigin: true,
  pathRewrite: { '^/api/analysis': '' },
}));

// Proxy for ai-core-service
app.use('/api/ai', createProxyMiddleware({
  target: 'http://ai-core-service:8000',
  changeOrigin: true,
  pathRewrite: { '^/api/ai': '/api/v1' }, // Map to the correct path
}));

// --- Serve React App ---
// Serve the static files (HTML, CSS, JS) from the 'build' folder
app.use(express.static(path.join(__dirname, 'build')));

// For any other request, send the index.html
// This is for client-side routing (React Router)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Frontend server & proxy running on http://localhost:${PORT}`);
});