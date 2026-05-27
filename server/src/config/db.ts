import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn('⚠️  MONGODB_URI no definido en .env — base de datos deshabilitada');
    return;
  }

  try {
    mongoose.set('strictQuery', false);
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,  // 8s máximo para conectar
      socketTimeoutMS:          30000,
    });
    console.log(`✅ MongoDB conectado: ${conn.connection.host}`);
  } catch (error: any) {
    // NO hace process.exit() — el servidor Express sigue corriendo
    console.error('❌ MongoDB no disponible:', error.message);
    throw error; // el caller decide qué hacer
  }
};

export default connectDB;
