const itemSearch = (searchObj, aliDb) => {
  let searchResults = new Promise((resolve, reject) => {
    aliDb
      .collection("items")
      .find({
        $text: { $search: searchObj.keyword, $caseSensitive: false }
      })
      .toArray((err, result) => {
        if (err) {
          console.log(err);
        }
        console.log(result);
        if (searchObj.minPrice) {
        }
        resolve({ success: true, data: result });
      });
  });
  return searchResults;
};

module.exports = itemSearch;
