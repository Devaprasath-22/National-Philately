const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const updateResult = await mongoose.connection.db.collection('users').updateOne(
      { email: 'bishwanthkumar1295@gmail.com' },
      { $set: { username: 'bishwanth', role: 'admin', location: 'New Delhi, India', isPublic: true } }
    );
    console.log('Update result:', updateResult);
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

run();
