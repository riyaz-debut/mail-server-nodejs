import  'dotenv/config'
import { connect } from 'mongoose';
async function connectDB() {
    try {
        await connect(process.env.MONGO_CONNECTION_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Database connected');
    } catch (error) {
        console.error('Error connecting to database:', error.message);
        process.exit(1);
    }
}
export default connectDB;