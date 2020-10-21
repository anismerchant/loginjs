const mongoose = require('mongoose');
const dotenv = require('dotenv');

// configure dotenv
dotenv.config();
const db = process.env.MONGODB_URI;

const connectDB = async () => {
	try {
		await mongoose.connect(db, {
			useNewUrlParser: true,
			useCreateIndex: true,
			useUnifiedTopology: true,
			useFindAndModify: false,
		});
		console.log('MongoDB connected...');
	} catch (err) {
		console.error(err.message);
		// exit process with failure
		process.exit(1);
	}
};

module.exports = connectDB;
