const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    throw new Error('MONGO_URI is not defined in environment variables');
  }

  mongoose.set('strictQuery', true);

  await mongoose.connect(uri, {
    // options intentionally minimal; use defaults for modern mongoose
  });

  console.log('Connected to MongoDB');
}

module.exports = { connectDB };

