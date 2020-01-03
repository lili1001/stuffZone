//libraries
const tools = require("./custom_modules/tools.js");

//setup and initialzie mongo db
const mongoClient = require("mongodb").MongoClient;
const dbCredientials = require("./mongo/dbURI.js");

const fs = require("fs");

const cleardatabase = () => {
  const collectionsToClear = ["reviews"];
  const aliDb = mongoDb.db("alibay");

  collectionsToClear.forEach(coll => {
    console.log("dropping " + coll);
    aliDb.collection(coll).drop((err, result) => {
      if (err) {
        console.log(err);
      }
      console.log(coll + " table dropped");
    });
  });
};

let mongoDb = undefined;
mongoClient.connect(dbCredientials, (err, dbRef) => {
  if (err) {
    console.log(err);
  }
  mongoDb = dbRef;
  console.log("-----------database initialized-----------");
  cleardatabase();
});
