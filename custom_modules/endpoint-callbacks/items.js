const items = (req, res, aliDb) => {
  aliDb
    .collections("items")
    .find({})
    .toArray((err, data) => {
      if (err) {
        console.log(err);
      }
      console.log("data retreived (array) eg:");
      console.log(console.log(data[0]));
      return data;
    });
};

module.exports = items;
