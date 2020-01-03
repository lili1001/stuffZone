const mongoClient = require("mongodb").MongoClient;
const dbCredientials = "/path/to/databaseURI.js";

let mongoDb = undefined;
mongoClient.connect(dbCredientials, (err, dbRef) => {
  if (err) {
    console.log(err);
  }
  mongoDb = dbRef;
  console.log("-----------database initialized-----------");
});
