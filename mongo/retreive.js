const retreive = (collection, query, dbRef) => {
  let dbResult = new Promise((resolve, reject) => {
    dbRef
      .collection(collection)
      .find(query)
      .toArray((err, result) => {
        if (err) {
          resolve({ success: false, err: err });
        }
        if (result.length < 1) {
          resolve({ success: false, msg: "entry does not exist" });
        }
        resolve({ success: true, data: { ...result[0] } });
      });
  });
  return dbResult;
};

module.exports = retreive;
