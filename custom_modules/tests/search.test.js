const itemSearch = require("../search.js");

const mongoClient = require("mongodb").MongoClient;
const dbCredientials = require("../../mongo/dbURI.js");
let mongoDb = undefined;
let aliDb = undefined;

beforeAll(done => {
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

test("should find some stuff maybe idk", done => {
  const testQuery = { keyword: "user", minPrice: 40, maxPrice: 60 };

  let searchResult = undefined;
  itemSearch(testQuery, aliDb).then(result => {
    searchResult = result.data;
    console.log(result);
    expect(searchResult.length).toBe(15);
    done();
  });
});
