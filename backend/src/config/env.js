const dotenv = require('dotenv');
const path = require('path');

function loadEnv() {
  // Load .env from the project root (two levels up from backend/src/config)
  const envPath = path.join(__dirname, '../../../.env');
  const result = dotenv.config({ path: envPath });
  
  if (result.error) {
    console.warn('No .env file found or error loading it; relying on process env.');
    console.warn('Tried to load from:', envPath);
  } else {
    console.log('Environment variables loaded successfully from:', envPath);
  }

  const requiredVars = ['MONGO_URI', 'JWT_SECRET', 'GEMINI_API_KEY'];
  const missing = requiredVars.filter((key) => !process.env[key]);

  if (missing.length) {
    console.warn(
      `Warning: Missing required environment variables: ${missing.join(
        ', '
      )}. The server may not function correctly.`
    );
  }
  
  // Debug: Log the API key (first 10 chars only for security)
  console.log('GEMINI_API_KEY loaded:', process.env.GEMINI_API_KEY ? `${process.env.GEMINI_API_KEY.substring(0, 10)}...` : 'NOT FOUND');
  console.log('GEMINI_MODEL:', process.env.GEMINI_MODEL || 'NOT SET');
}

module.exports = { loadEnv };

