//libraries
const tools = require("./custom_modules/tools.js");

//setup and initialzie mongo db
const mongoClient = require("mongodb").MongoClient;
const dbCredientials = require("./custom_modules/mongo/dbURI.js");

const fs = require("fs");

const populatemock = () => {
  fs.readFile("./MOCK_DATA.json", (err, data) => {
    if (err) {
      console.log(err);
    }
    console.log("mock data accessed");
    data = JSON.parse(data);
    data.forEach(item => {
      let itemData = {
        itemId: tools.generateId(10),
        price: item.price,
        title: item.title,
        description: item.description,
        sellerId: tools.generateId(6),
        shipsFrom: `${item.city}, ${item.state}, ${item.country}`,
        smallimage: "/nophoto.png",
        largeimage: "/nophoto.png"
      };
      let aliDb = mongoDb.db("alibay");
      aliDb.collection("items").insertOne(itemData, err => {
        if (err) {
          console.log(err);
        }
        console.log("inserted " + item.title);
      });
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
  populatemock();
});
