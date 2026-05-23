export default function handler(req, res) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Route handling
  if (req.url === '/api' || req.url === '/api/') {
    return res.status(200).json({ 
      message: 'Sport Connect API funcionando!',
      timestamp: new Date().toISOString()
    });
  }

  if (req.url === '/api/health') {
    return res.status(200).json({ 
      status: 'ok',
      timestamp: new Date().toISOString()
    });
  }

  return res.status(404).json({ error: 'Route not found' });
}