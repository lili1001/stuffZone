const items = require("../items.js");

const mongoClient = require("mongodb").MongoClient;
let mongoDb = undefined;
let aliDb = undefined;

beforeAll(done => {
  console.log("starting setup");
  //setup and initialzie mongo db
  const dbCredientials = require("../../mongo/dbURI.js");
  mongoClient.connect(dbCredientials, (err, dbRef) => {
    if (err) {
      console.log(err);
    }
    mongoDb = dbRef;
    aliDb = mongoDb.db("alibay");
    console.log("-----------database initialized-----------");
    done();
  });
});

test("should return an array of all the objects in the db", done => {
  const req = jest.fn();
  const res = jest.fn();
  let numItems = aliDb
    .collection("items")
    .find({})
    .toArray((err, result) => {
      if (err) {
        console.log(err);
      }
      numItems = result.length;
      done();
      return result;
    });
  expect(numItems).toBe(50);
});
