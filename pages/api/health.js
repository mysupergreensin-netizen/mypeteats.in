import connectDB from '../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check database connection
    await connectDB();
    
    return res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'mypeteats-api'
    });
  } catch (error) {
    return res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Database connection failed'
    });
  }
}

