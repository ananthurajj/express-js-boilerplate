import mongoose from 'mongoose';

const connectDB = async (uri) => {
  try {
    console.log(`Connecting to MongoDB... ${uri}`);
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
