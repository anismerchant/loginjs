const mongoose = require('mongoose');
const dotenv = require('dotenv');

// configure dotenv
dotenv.config();

const connectDB = async (dbURI) => {
	try {
		await mongoose.connect(dbURI, {
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
