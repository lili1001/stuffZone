//libraries setup
const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
app.use(cookieParser());

const multer = require("multer");
const upload = multer();

const auth = require("password-hash");

const stripeKey = require("./custom_modules/stripeKeys.js");
const stripe = require("stripe")(stripeKey.private);

//setup and initialzie mongo db
const mongoClient = require("mongodb").MongoClient;
const dbCredientials = require("./mongo/dbURI.js");
const retreive = require("./mongo/retreive.js");

let mongoDb = undefined;
let aliDb = undefined;
mongoClient.connect(dbCredientials, (err, dbRef) => {
  if (err) {
    console.log(err);
  }
  mongoDb = dbRef;
  aliDb = mongoDb.db("alibay");
  console.log("-----------database initialized-----------");
});

//boilerplate
let reloadMagic = require("./reload-magic.js");
reloadMagic(app);
const tools = require("./custom_modules/tools.js");

app.use("/", express.static("build")); // Needed for the HTML and JS files
app.use("/", express.static("public")); // Needed for local assets

//global vars grr
let sessions = {};
//array of objedct:  message = {"itemId":"", "sellerId":"", "buyer":"", "msgs":[]}
//let messages = [];

//modules and stuff
const itemSearch = searchObj => {
  let searchResults = new Promise((resolve, reject) => {
    if (aliDb === undefined) {
      setTimeout();
    }
    let queries = Object.keys(searchObj);
    let found = Promise.all(
      queries.map(query => {
        if (query == "title" || query == "description" || query == "location") {
          aliDb
            .collection("items")
            .find({
              $text: { $search: searchObj[query], $caseSensitive: false }
            })
            .toArray((err, result) => {
              if (err) {
                console.log(err);
              }
              return result;
            });
        }
        if (query === searchObj[minPrice]) {
          aliDb
            .collection("items")
            .find({ price: { $gt: searchObj.minPrice } })
            .toArray((err, result) => {
              if (err) {
                console.log(err);
              }
              return result;
            });
        }
        if (query === searchObj[maxPrice]) {
          aliDb
            .collection("items")
            .find({ price: { $lt: searchObj.maxPrice } })
            .toArray((err, result) => {
              if (err) {
                console.log(err);
              }
              return result;
            });
        }
      })
    ).then(result => {
      result.forEach(item => {
        console.log(item);
      });
      resolve({ success: true, data: result });
    });
  });
  return searchResults;
};

//updating user data

// Your endpoints go after this line

app.post("/items", upload.none(), (req, res) => {
  //sends an array of itemData objects if body.search is undefined
  //WIP - expects body.search to be a JSON formatted object
  //possible (but not required properties) are:
  //keyword, minPrice, maxPrice, location
  console.log("POST: /items");
  let query = {};
  if (req.body.search === undefined) {
    aliDb
      .collection("items")
      .find(query)
      .toArray((err, data) => {
        if (err) {
          console.log(err);
        }
        console.log("data retreived " + data.length + " items");
        let pkg = data;
        res.send(pkg);
      });
  }
});
//user authentication endpoints------------------------------------------------------------------------------------------
app.get("/autologin", (req, res) => {
  const sid = req.cookies.sid;
  if (sessions[sid] != undefined) {
    console.log("active session found");
    retreive("users", { userId: sessions[sid] }, aliDb).then(dbResult => {
      if (dbResult.success) {
        console.log("session user data retreived");
        console.log(dbResult.data);
        let pkg = { success: true, user: dbResult.data };
        res.send(JSON.stringify(pkg));
        return;
      }
      console.log("unknown user");
      res.send(JSON.stringify({ success: false, msg: "no session found" }));
    });
  }
  res.send(JSON.stringify({ success: false, msg: "no session found" }));
});

app.post("/login", upload.none(), (req, res) => {
  const sid = req.cookies.sid;
  const userGiven = req.body.username;
  aliDb.collection("auth").findOne({ username: userGiven }, (err, dbResult) => {
    if (err) {
      console.log(err);
      res.send(
        JSON.stringify({
          success: false,
          msg: "auth info could not be retreived"
        })
      );
      return;
    }
    console.log("user auth retrevied");
    if (dbResult === null) {
      res.send(
        JSON.stringify({ success: false, msg: "invalid username password" })
      );
      return;
    }
    let chal = dbResult.password;
    if (auth.verify(req.body.password, chal)) {
      console.log("logged in " + dbResult.username);
      retreive("users", { username: dbResult.username }, aliDb).then(dbUser => {
        if (dbUser.success) {
          let pkg = { success: true, user: dbUser.data };
          let newSid = tools.generateId(6);
          sessions[newSid] = dbResult.id;
          res.cookie("sid", newSid);
          res.send(JSON.stringify(pkg));
          return;
        }
        let pkg = { success: false, msg: "invalid username or password" };
        res.send(JSON.stringify(pkg));
        return;
      });
    }
  });
});

app.post("/signup", upload.none(), async (req, res) => {
  let userGiven = req.body.username;
  aliDb
    .collection("auth")
    .find({ username: userGiven })
    .toArray((err, dbResult) => {
      if (err) {
        console.log(err);
      }
      if (dbResult.length > 0) {
        console.log("username exists");
        pkg = {
          success: false,
          msg: "that username is taken, please try another"
        };
        res.send(JSON.stringify(pkg));
        return;
      } else {
        let hpass = auth.generate(req.body.password);
        let uid = tools.generateId(6);
        let newSid = tools.generateId(6);
        //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        sessions[newSid] = uid;
        //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        aliDb
          .collection("auth")
          .insertOne(
            { username: userGiven, password: hpass, id: uid },
            (err, dbResult) => {
              if (err) {
                console.log(err);
              }
              console.log("user auth info stored");
              let pkg = { success: true };
              let newSid = tools.generateId(6);
              res.cookie("sid", newSid);
              sessions[newSid] = uid;
              res.send(JSON.stringify(pkg));
            }
          );
        let userdata = {
          userId: uid,
          username: userGiven,
          displayName: userGiven,
          location: "",
          paymentMethods: [],
          email: req.body.email,
          orders: [],
          sales: [],
          cart: []
        };
        aliDb.collection("users").insertOne(
          userdata,
          (err,
          dbResult => {
            if (err) {
              console.log(err);
            }
            console.log("user data pushed to db");
          })
        );
      }
    });
});

app.post("/change-password", upload.none(), (req, res) => {
  const uid = sessions[req.cookies.sid];
  retreive("users", { userId: uid }, aliDb).then(dbResult => {
    if (dbResult.success === false) {
      console.log(dbResult.err);
      res.send({ success: false, msg: "could not retreive auth from db" });
      return;
    }
    console.log("user data retreived to reset pw");
    console.log(dbResult);
    const userData = dbResult.data;
    const username = userData.username;

    retreive("auth", { username: username }, aliDb).then(dbResult => {
      if (dbResult.success) {
        console.log("retreived user auth data");
        if (auth.verify(req.body.oldPassword, dbResult.data.password)) {
          console.log("oldpass verification passed");
          const newPass = auth.generate(req.body.newPassword);
          aliDb
            .collection("auth")
            .updateOne(
              { username: username },
              { $set: { password: newPass } },
              (err, result) => {
                if (err) {
                  console.log(err);
                  res.send({
                    success: false,
                    msg: "failed writing new password to db"
                  });
                  return;
                }
                console.log("new password written to db");
                res.send({ success: true });
              }
            );
        } else {
          console.log("auth verification failed");
          res.send({ success: false, msg: "invalid username or password" });
          return;
        }
      } else {
        console.log(dbResult.err);
      }
    });
  });
});

app.get("/logout", (req, res) => {
  sessions[req.cookies.sid] = undefined;
  res.send(JSON.stringify({ success: true }));
});

//commerce endpoints------------------------------------------------------------------------------------------
app.post("/additem", upload.none(), (req, res) => {
  //expects formdata with the following fields:
  //title, price, description, location, image, largeImage
  console.log("POST:/additem");
  let sellerId = sessions[req.cookies.sid];
  let sellerData = {};
  retreive("users", { userId: sellerId }, aliDb).then(dbResult => {
    if (dbResult.success === false) {
      console.log("retreiving seller data failed");
      res.send(
        JSON.stringify({
          success: false,
          msg: "seller data could not be found"
        })
      );
      return;
    }
    sellerData = dbResult.data;
    let newItem = {
      itemId: tools.generateId(10),
      price: parseInt(req.body.price),
      title: req.body.title,
      description: req.body.description,
      sellerId: sellerData.userId,
      shipsFrom: req.body.location,
      smallImage: req.body.image,
      largeImage: req.body.largeImage
    };
    aliDb.collection("items").insertOne(newItem, (err, result) => {
      if (err) {
        console.log(err);
        res.send(JSON.stringify({ success: false }));
        return;
      }
      console.log("new item pushed to db");
      res.send(JSON.stringify({ success: true, item: newItem }));
      return;
    });
  });
});

app.get("/fetch-cart", (req, res) => {
  // sends a json formatted array of itemData objects
  console.log("GET: /cart");
  const uid = sessions[req.cookies.sid];
  retreive("users", { userId: uid }, aliDb).then(dbResult => {
    console.log("db user info retreived");
    let userData = dbResult.data;
    let cart = userData.cart;
    if (cart === undefined || cart.length < 1) {
      res.send(JSON.stringify([]));
      return;
    }
    Promise.all(
      cart.map(itemId => {
        return retreive("items", { itemId: itemId }, aliDb).then(dbResult => {
          console.log(dbResult);
          return dbResult.data;
        });
      })
    ).then(result => {
      res.send(JSON.stringify(result));
    });
  });
});

app.post("/cart", upload.none(), (req, res) => {
  //expects body with adding:true if adding and adding:false if removing, and itemId:string id of item
  const uid = sessions[req.cookies.sid];
  retreive("users", { userId: uid }, aliDb).then(dbResult => {
    if (dbResult.success === false) {
      console.log(dbResult.err);
      res.send({ success: false, msg: "user data not found" });
      return;
    }
    let userData = dbResult.data;
    console.log(userData);
    let oldCart = userData.cart;
    let newCart = [];
    let isAdd = JSON.parse(req.body.adding);
    console.log("adding:" + isAdd);
    if (isAdd) {
      console.log("adding to cart");
      newCart = oldCart.concat(req.body.itemId);
    }
    if (isAdd === false) {
      console.log("removing from cart");
      newCart = oldCart.filter(id => {
        if (id === req.body.itemId) {
          return false;
        }
        return true;
      });
    }
    userData = { ...userData, cart: newCart };
    aliDb
      .collection("users")
      .updateOne(
        { userId: userData.userId },
        { $set: { ...userData } },
        (err, result) => {
          if (err) {
            console.log(err);
            res.send({ success: false, msg: "writing cart to db failed" });
            return;
          }
          console.log("new cart written to db");
          res.send(JSON.stringify({ success: true, cart: newCart }));
        }
      );
  });
});
// chat room---------------------------------------------------------------------------------------------------
//fetch info
app.post("/getId", upload.none(), (req, res) => {
  let name = req.body.username;
  console.log("get id", "username:", name);
  aliDb.collection("users").findOne({ displayName: name }, (err, dbResult) => {
    if (err) {
      console.log(err);
      res.send("user info retrevied err");
      return;
    }
    console.log("user info retrevied", dbResult);
    let id = dbResult.id;
    res.send(JSON.stringify({ id: id }));
  });
});
//new chat message----------------------------------------------------------------------------
app.post("/newMessage", upload.none(), (req, res) => {
  console.log("/new mwssage go here!!!!!!!");
  //data:{"itemId":"", "sellerId":"", "buyerId":"", "msg":""}
  console.log("body", req.body);
  let chatInfo = req.body;
  let senderId = sessions[req.cookies.sid];
  console.log("senderId", senderId);
  console.log("get sender name");
  //get sender name
  let senderName = "";
  aliDb.collection("auth").findOne({ id: senderId }, (err, dbResult) => {
    if (err) {
      console.log(err);
      res.send("sender auth retrevied err");
      return;
    }
    console.log("sender auth retrevied", dbResult);
    senderName = dbResult.username;
    console.log("senderName", senderName);
    //newMsg:{"itemId":"", "sellerId":"", "buyerId":"", chat:{sender: "", msg:""}}}
    let newMsg = {
      itemId: chatInfo.itemId,
      sellerId: chatInfo.sellerId,
      buyerId: chatInfo.buyerId,
      chat: { sender: senderName, msg: chatInfo.msg, senderId: senderId }
    };
    console.log("new message", newMsg);
    //push msg data to the data base------------------------------------
    aliDb.collection("messages").insertOne(newMsg, (err, dbResult) => {
      if (err) {
        console.log(err);
      }
      console.log("message info stored");
      res.send(JSON.stringify({ success: true }));
    });
    // messages.push(newMsg)
    // console.log("updated messages", messages);
    // res.send(JSON.stringify({ success: true }));
  });
});

//messages----------------------------------------------------------------------------------------------
app.post("/messages", upload.none(), (req, res) => {
  //send the messages with unique itemsId, seller, buyer
  let chaterId = sessions[req.cookies.sid];
  console.log("messages/POST", req.body);
  let chatInfo = req.body;
  console.log("chatInfo", chatInfo);
  let itemId = chatInfo.itemId;
  let sellerId = chatInfo.sellerId;
  let buyerId = chatInfo.buyerId;
  //retrive all messages from database----------------

  // let result = messages.filter(message => {
  //   if (
  //     message.itemId === itemId &&
  //     message.sellerId === sellerId &&
  //     message.buyerId === buyerId
  //   )
  //     return true;
  //   return false;
  // });
  aliDb
    .collection("messages")
    .find({ itemId: itemId, sellerId: sellerId, buyerId: buyerId })
    .toArray((err, data) => {
      if (err) {
        console.log(err);
      }
      console.log("message data retreived " + data.length + " messages");
      let msgs = data.map(r => r.chat);
      for (let i = 0; i < msgs.length; i++) {
        if (msgs[i].senderId === chaterId) {
          console.log(
            "chater is sender go here!!!!!!!!",
            chaterId,
            msgs[i].senderId
          );
          msgs[i].chaterIsSender = true;
        } else {
          console.log(
            "chater isnotnpm start sender go here!!!!!!!!",
            chaterId,
            msgs[i].senderId
          );
          msgs[i].chaterIsSender = false;
        }
      }
      console.log("send frontend messages", msgs);
      res.send(JSON.stringify(msgs));
    });
  //msgs is an array of object{sender: senderName, msg: chatInfo.msg, senderId:senderId}
});
//mychat---------------------------------------------------------------------
//messages is array of object:{"itemId":"", "sellerId":"", "buyerId":"", chat:{sender: "", msg:""}}}
app.get("/getmychat", (req, res) => {
  let uid = sessions[req.cookies.sid];
  aliDb
    .collection("messages")
    .find({})
    .toArray((err, messages) => {
      if (err) {
        console.log(err);
      }
      console.log("messages data retreived " + messages.length + " messages");
      let chatsAsSeller = messages.filter(m => m.sellerId === uid);
      let chatAsBuyer = messages.filter(m => m.buyerId === uid);
      let mychats = { asSeller: chatsAsSeller, asBuyer: chatAsBuyer };
      console.log("mychats for frontend", mychats);
      res.send(JSON.stringify(mychats));
    });
});
// check out------------------------------------------------------------------------------------------------

app.get("/item-reviews", (req, res) => {
  let reviewId = req.query.itemId;
  aliDb
    .collection("reviews")
    .find({ itemId: reviewId })
    .toArray((err, result) => {
      if (err) {
        console.log(err);
        res.send(
          JSON.stringify({ success: false, msg: "error retreiving from db" })
        );
        return;
      }
      if (result.length < 1) {
        res.send(JSON.stringify({ success: false, msg: "no reviews found" }));
        return;
      }
      console.log(result[0]);
      let review = result[0];
      let pkgReview = {
        title: review.title,
        review: review.review
      };
      console.log(result);
      res.send(JSON.stringify({ success: true, review: pkgReview }));
      return;
    });
});
app.get("/seller-reviews", (req, res) => {
  console.log("GET: /seller reviews");
  let reviewId = req.query.itemId;
  aliDb
    .collection("reviews")
    .find({ sellerId: reviewId })
    .toArray((err, result) => {
      if (err) {
        console.log(err);
        res.send(
          JSON.stringify({ success: false, msg: "error retreiving from db" })
        );
        return;
      }
      if (result.length < 1) {
        res.send(JSON.stringify({ success: false, msg: "no reviews found" }));
        return;
      }
      let pkgReview = result;
      console.log("sending" + result.length + "reviews");
      res.send(JSON.stringify({ success: true, reviews: pkgReview }));
      return;
    });
});
app.post("/review", upload.none(), (req, res) => {
  if (req.body.title === undefined || req.body.reviewTxt === undefined) {
    console.log("review missing mandatory pieces");
    res.send(
      JSON.stringify({
        success: false,
        msg: "review needs to have a title and body"
      })
    );
  }
  let newReview = {
    title: req.body.title,
    review: req.body.reviewTxt,
    sellerId: req.body.seller,
    itemId: req.body.item
  };
  aliDb.collection("reviews").insertOne(newReview, (err, result) => {
    if (err) {
      console.log(err);
      res.send(
        JSON.stringify({ success: false, msg: "could not write review to db" })
      );
      return;
    }
    console.log("review written to db");
    console.log(req.body.order);
    retreive("orders", { orderId: req.body.order }, aliDb).then(dbResult => {
      if (dbResult.success) {
        let order = dbResult.data;
        let orderItems = order.items;
        let found = orderItems.filter(item => {
          if (item.itemId === newReview.itemId) {
            return true;
          }
          return false;
        });
        updateItem = found[0];
        let iupdate = orderItems.indexOf(updateItem);
        updateItem.reviewed = true;
        let newItems = orderItems.slice(0, iupdate);
        newItems = newItems.concat(updateItem);
        newItems = newItems.concat(
          orderItems.slice(iupdate + 1, orderItems.length)
        );
        console.log(newItems);
        aliDb
          .collection("orders")
          .updateOne(
            { orderId: req.body.order },
            { $set: { items: newItems } },
            (err, result) => {
              if (err) {
                console.log(err);
                return;
              }
              console.log("item review status updated");
              res.send(JSON.stringify({ success: true }));
              return;
            }
          );
      } else {
        console.log("failed to retreive order info from db for review");
      }
    });
  });
});

app.get("/fetch-checkout", (req, res) => {
  // sends an array of payment method objects and and array of
  const uid = sessions[req.cookies.sid];
  aliDb.collection("users").findOne({ userId: uid }, (err, result) => {
    if (err) {
      console.log(err);
    }
    res.send(
      JSON.stringify({ cart: result.cart, payments: result.paymentMethods })
    );
  });
});

app.post("/checkout", upload.none(), (req, res) => {
  console.log("submitting payment details to stripe");
  const processPayment = async (total, token) => {
    let charge = await stripe.charges.create({
      amount: total,
      currency: "usd",
      source: token
    });
    return charge;
  };
  console.log("POST: /checkout");
  //expects cart:array of itemIds, paymentInfo:
  const uid = sessions[req.cookies.sid];
  let clientTotal = req.body.total;
  let token = req.body.token;
  let items = JSON.parse(req.body.cart);
  console.log("checking out");
  Promise.all(
    items.map(id => {
      return retreive("items", { itemId: id }, aliDb).then(dbResult => {
        if (!dbResult.success) {
          console.log(err);
          return { success: false };
        }
        console.log("item data retreived for " + dbResult.data.itemId);
        return dbResult.data;
      });
    })
  ).then(cartItems => {
    let subtotal = 0;
    cartItems.forEach(item => {
      subtotal = subtotal + item.price;
    });
    let total = subtotal;
    let date = new Date();
    let newOrder = {
      orderId: tools.generateId(8),
      items: cartItems,
      total: total,
      createdAt: date
    };
    processPayment(clientTotal, token).then(charge => {
      console.log("payment result");
      console.log(charge);
      if (!charge.paid) {
        console.log("payment failed");
        res.send(
          JSON.stringify({
            success: false,
            msg: "payment could not be processed"
          })
        );
        return;
      }
      let orderMerchants = [];
      cartItems.forEach(itemData => {
        if (orderMerchants.includes(itemData.sellerId)) {
          return;
        }
        orderMerchants.push(itemData.sellerId);
      });
      let saleOrders = {};
      orderMerchants.forEach(sellerId => {
        let orderItems = cartItems.filter(itemData => {
          if (itemData.sellerId === sellerId) {
            return true;
          }
          return false;
        });
        let orderTotal = 0;
        orderItems.forEach(itemData => {
          orderTotal = orderTotal + itemData.price;
        });
        saleOrders[sellerId] = {
          orderId: tools.generateId(8),
          items: orderItems,
          total: orderTotal
        };
      });
      dbOrders = [];
      orderMerchants.forEach(merchantId => {
        dbOrders.push(saleOrders[merchantId]);
        aliDb
          .collection("users")
          .findOne({ userId: merchantId }, (err, result) => {
            if (err) {
              console.log(err);
              return;
            }
            console.log("merchant user info retreived");
            let userData = result;
            let newOrders = userData.sales.concat(
              saleOrders[merchantId].orderId
            );
            let newPayout = userData.payout + saleOrders[merchantId].total;
            aliDb
              .collection("users")
              .updateOne(
                { userId: merchantId },
                { $set: { ...userData, sales: newOrders, payout: newPayout } },
                (err, result) => {
                  if (err) {
                    console.log(err);
                  }
                  console.log("merchant order history updated");
                }
              );
          });
      });
      aliDb.collection("orders").insertMany(dbOrders, (err, result) => {
        if (err) {
          console.log(err);
        }
        console.log("pushed " + dbOrders.length + " merchant orders to db");
      });
      aliDb.collection("orders").insertOne(newOrder, (err, result) => {
        if (err) {
          console.log(err);
          res.send({ success: false });
          return;
        }
        console.log("order pushed to db:");
      });
      retreive("users", { userId: uid }, aliDb).then(dbResult => {
        if (dbResult.success === false) {
          console.log(dbResult.err);
          res.send({ success: false });
          return;
        }
        console.log("user info retreived from db for order history");
        let userData = dbResult.data;
        let newHistory = userData.orders.concat(newOrder.orderId);
        aliDb
          .collection("users")
          .updateOne(
            { userId: userData.userId },
            { $set: { ...userData, orders: newHistory, cart: [] } },
            (err, result) => {
              if (err) {
                console.log(err);
                res.send({ success: false });
                return;
              }
              console.log(
                "order history updated for user " + userData.displayName
              );
              res.send({ success: true });
            }
          );
      });
    });
  });

  aliDb.collection("users").findOne({ userId: uid }, (err, result) => {
    if (err) {
      console.log(err);
    }
  });
});

app.get("/update-vendor", (req, res) => {
  console.log("GET: /update-orders");
  const uid = sessions[req.cookies.sid];
  //if (req.query.state === uid) {
  console.log(req.query);
  const userCode = req.query.code;
  stripe.oauth
    .token({
      grant_type: "authorization_code",
      code: userCode
    })
    .then(userAcctRef => {
      const userAcct = userAcctRef.stripe_user_id;
      aliDb
        .collection("users")
        .updateOne(
          { userId: uid },
          { $set: { vendorAcct: userAcct } },
          (err, result) => {
            if (err) {
              console.log(err);
              return;
            }
            console.log("vendor account information updated");
          }
        );
    });
  //}
  //console.log("state mismatch for vendor signup");
  res.redirect("/");
});

app.get("/payout", (req, res) => {
  console.log("GET: /payout");
  const uid = sessions[req.cookies.sid];
  retreive("users", { userId: uid }, aliDb).then(dbResult => {
    if (dbResult.success) {
      let userData = dbResult.data;
      if (userData.vendorAcct) {
        stripe.payouts.create(
          { amount: 1000, currency: "cad" },
          (err, payout) => {
            if (err) {
              console.log(err);
              aliDb
                .collection("users")
                .updateOne(
                  { userId: userData.userId },
                  { $set: { payout: 0 } },
                  (err, uUser) => {
                    if (err) {
                      console.log(err);
                      res.send(
                        JSON.parse({
                          success: true,
                          msg: "updating user payout failed"
                        })
                      );
                      return;
                    }
                    console.log("merchant data updated");
                    res.send(JSON.parse({ success: true, userData: uUser }));
                  }
                );
              return;
            }
            console.log("payout successful");
            aliDb
              .collection("users")
              .updateOne(
                { userId: userData.userId },
                { $set: { payout: 0 } },
                (err, uUser) => {
                  if (err) {
                    console.log(err);
                    res.send(
                      JSON.parse({
                        success: true,
                        msg: "updating user payout failed"
                      })
                    );
                    return;
                  }
                  console.log("merchant data updated");
                  res.send(JSON.parse({ success: true, userData: uUser }));
                }
              );
          }
        );
      }
      console.log("user does not have payout acct setup");
      res.send(
        JSON.stringify({
          success: false,
          msg: "user needs to set up payout account"
        })
      );
      return;
    }
    console.log("could not retreive user info for payout");
  });
});

app.get("/fetch-orders", (req, res) => {
  // sends an array of order data objects
  console.log("GET: /orders");
  let uid = sessions[req.cookies.sid];
  aliDb.collection("users").findOne({ userId: uid }, (err, result) => {
    if (err) {
      console.log(err);
      res.send({ success: false, msg: "user data could not be found" });
    }
    console.log("user data retreived");
    let userData = result;
    let orders = userData.orders;
    Promise.all(
      orders.map(orderId => {
        return retreive("orders", { orderId: orderId }, aliDb).then(result => {
          if (result.success === false) {
            console.log(result.err);
            return result;
          }
          return result.data;
        });
      })
    ).then(orderData => {
      res.send(JSON.stringify(orderData));
    });
  });
});

//account management endpoints---------------------------------------------------------------------------------------
app.post("/account", upload.none(), (req, res) => {
  const updateUser = (userData, newData) => {
    //newData = JSON.parse(newData);
    const updatedUser = { ...userData, ...newData };
    return updatedUser;
  };
  console.log("POST: /account");
  //updates user info from form submission
  let userData = {};
  const uid = sessions[req.cookies.sid];
  retreive("users", { userId: uid }, aliDb).then(dbResult => {
    const mongoUid = dbResult.data._id;
    if (dbResult.success) {
      console.log("user data retreived");
      userData = dbResult.data;
      console.log(req.body);
      userData = updateUser(userData, req.body);
      console.log("user data updated");
      aliDb
        .collection("users")
        .updateOne(
          { userId: uid },
          { $set: { ...userData } },
          (err, result) => {
            if (err) {
              console.log(err);
            }
            console.log("account information updated");
            res.send(JSON.stringify({ success: true, data: result }));
            return;
          }
        );
      return;
    } else {
      console.log(dbResult.err);
      res.send(
        JSON.stringify({
          success: false,
          msg: "user data could not be retreived"
        })
      );
      return;
    }
  });
});
app.get("/fetch-account", (req, res) => {
  //sends current user data to populate form
  let uid = sessions[req.cookies.sid];
  aliDb.collection("users").findOne({ userId: uid }, (err, dbResult) => {
    if (err) {
      console.log(err);
    }
    console.log("user data retreived");
    console.log(dbResult);
    res.send(JSON.stringify(dbResult));
  });
});

// Your endpoints go before this line

app.all("/*", (req, res, next) => {
  // needed for react router
  res.sendFile(__dirname + "/build/index.html");
});

app.listen(4000, "0.0.0.0", () => {
  console.log("Server running on port 4000");
});

module.exports = { itemSearch };
