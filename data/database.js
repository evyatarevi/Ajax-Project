const mongodb = require('mongodb');

const MongoClient = mongodb.MongoClient;

let database;

async function connect() {
  //mongoDB: server -> db -> collection -> documents
  /*
  server: 127.0.0.1:27017
  db: 'blog'
  collection: 'posts','authors','comments'
  documents: post1,post2,post3 / 'Evyatar','Morya' / comment1,comment2,comment3
  */
  const client = await MongoClient.connect('mongodb://127.0.0.1:27017'); //connect to server.
  database = client.db('blog');  //connect to DB and save reference in 'database' variable.
}

function getDb() {
  if (!database) {
    throw { message: 'Database connection not established!' };
  }
  return database;
}

module.exports = {
  connectToDatabase: connect,
  getDb: getDb
};
