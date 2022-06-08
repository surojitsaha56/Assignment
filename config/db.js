const { MongoClient } = require('mongodb');

async function main() {
    const uri = 'mongodb://localhost:27017';
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log('MongoDB is connected');
    } catch (err) {
        console.log(err.message);
    }
    finally {
        await client.close();
    }
}
module.exports = main;