const { MongoClient } = require('mongodb')
const client = new MongoClient(process.env.MONGODB_URI, {
   useNewUrlParser: true,
   useUnifiedTopology: true
})

module.exports = async (db_name, is_collection) => {
   await client.connect()
   const db = client.db(db_name).collection(is_collection)
   return db
}