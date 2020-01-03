//libraries
const tools = require("./custom_modules/tools.js");

//setup and initialzie mongo db
const mongoClient = require("mongodb").MongoClient;
const dbCredientials = require("./mongo/dbURI.js");

const fs = require("fs");

const updateDb = () => {
  const aliDb = mongoDb.db("alibay");
  aliDb
    .collection("users")
    .find({})
    .toArray((err, result) => {
      if (err) {
        console.log(err);
        return;
      }
      console.log("users retreived from db");
      result.forEach(dbDoc => {
        aliDb
          .collection("users")
          .updateOne(
            { userId: dbDoc.userId },
            { $set: { payout: 0 } },
            (err, result) => {
              if (err) {
                console.log(err);
                return;
              }
              console.log("updated db entry");
            }
          );
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
  updateDb();
});
