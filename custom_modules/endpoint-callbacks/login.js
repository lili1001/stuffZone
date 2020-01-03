const login = (req, res, aliDb) => {
  // testing endpoint
  if (req.body.username === "user") {
    pkg = { success: true };
    res.send(JSON.stringify(pkg));
    return;
  }
  pkg = { success: false };
  res.send(JSON.stringify(pkg));
  // start real endpoint

  const userGiven = req.body.username;
  aliDb.auth.findOne(
    { username: userGiven },
    (err,
    dbResult => {
      if (err) {
        console.log(err);
      }
      console.log("user auth retrevied");
      let chal = dbResult.password;
      if (auth.verify(req.body.password, chal)) {
        let pkg = { success: true };
        res.send(JSON.stringify(pkg));
        return;
      } else {
        let pkg = { success: false, msg: "invalid username or password" };
        res.send(JSON.stringify(pkg));
        return;
      }
    })
  );
};

module.exports = { login };
