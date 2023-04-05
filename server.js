/**
 *  author: Khojiakbar Yokubjonov
 *  date: 3/26/2023
 *  description: this file implements the server side of an online-marketplace app called Ostaa.
 * The server should support a number of different kind of requests (including static file requests
 * These request paths are:
 *      /get/users/ (GET) Should return a JSON array containing the information for every user
 *             in the database.
        /get/items/ (GET) Should return a JSON array containing the information for every item 
            in the database.
        /get/listings/USERNAME (GET) Should return a JSON array containing every listing (item)for 
        the user USERNAME.
        /get/purchases/USERNAME (GET) Should return a JSON array containing every purchase (item) 
        for the user USERNAME.
        /search/users/KEYWORD (GET) Should return a JSON list of every user whose username has the 
        substring KEYWORD.
        /search/items/KEYWORD (GET) Should return a JSON list of every item whose description has 
        the substring KEYWORD.
        /add/user/ (POST) Should add a user to the database. The username and password should be 
        sent as POST parameter(s).
        /add/item/USERNAME (POST) Should add an item to the database. The items information (title, description,
           image, price, status) should be included as POST parameters. The item should be added the USERNAMEs 
           list of listings.
 * 
 */
const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require("body-parser");  
const cookieParser = require('cookie-parser');

const hostname = 'localhost';
const port = 3000;
const app = express();
app.use(cookieParser());
// app.use('/public_html/*', authenticate); 
app.use('/app/*', authenticate);    //If authenticate fails, doesn't open everything else
app.use(express.static('public_html'))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use('/local-files', express.static('/'));


// database to store all the messages
mongoose.connect('mongodb+srv://khyokubjonov:L5E5Imuo8EWo9rzf@khojiakbardb.pfv0hgx.mongodb.net/?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected...'))
    .catch((err) => console.log(err));
var Schema = mongoose.Schema;

// Items
var ItemSchema = new Schema({ 
    title: String,
    description: String,
    image: String,
    price: Number,
    stat: String });
    
var Item = mongoose.model('Item', ItemSchema );
   
  // User
  var UserSchema = new Schema({ 
    username: String,
    password: String,
    listings: [String],
    purchases: [String] 
});

var User = mongoose.model("User", UserSchema);
//  keeps track of the login sessions
let sessions = [];

function addSession(user){
  let sessionId = Math.floor(Math.random() + 100000);
  let sessionStart = Date.now();
  sessions[user] = { 'sid':sessionId, 'start':sessionStart};
  return sessionId;
}

function doesUserHaveSession(user){
  let entry = sessions[user.username];
  if (entry != undefined){
    return entry.sid == user.sid;
  }
  return false;
}

const SESSION_LENGTH = 60000;

function cleanupSessions () {
  let currentTime = Date.now();
  for (i in sessions) {
    let sess = sessions[i];
    if (sess.start + SESSION_LENGTH < currentTime){
      console.log("Removing session id")
      delete sessions[i];
    }
  }
}

setInterval(cleanupSessions, 2000);

function authenticate(req, res, next){
  let c = req.cookies;
  // console.log("line 105, req.cookies: ");
  // console.log(c);
  if (c && Object.getPrototypeOf(c) !== null){
    let result = doesUserHaveSession(c.login);
    // console.log(result);
    if (result) {
      next();
      return;
    }
  }
  console.log('redirecting to login page');
  res.redirect('/index.html');
}

////////////////////////////////////////////////////////////

app.listen(port, () => {
  console.log('Server has started.');
})



//  (GET) Should return a JSON array containing the information for every user in the database.
app.get("/get/users/", (req,res) => {
    console.log("Sending a list of all users");
    let p1 = User.find({}).exec();
    p1.then( (results) => { 
      res.end( JSON.stringify(results, undefined, 2) );
    });
    p1.catch( (error) => {
      console.log(error);
      res.end('FAIL');
    });

});


// (GET) Should return a JSON array containing the information for every item in the database.
app.get('/get/items/', (req, res) => {
    console.log("Sending a list of all items");
    let p1 = Item.find({}).exec();
    p1.then( (results) => { 
      res.end( JSON.stringify(results, undefined, 2) );
    });
    p1.catch( (error) => {
      console.log(error);
      res.end('FAIL');
    });

});



// authenticates the user login 
app.get('/account/login/:USERNAME/:PASSWORD', (req, res) => {
  console.log("validating login"); 
  let u = req.params.USERNAME;
  let p = req.params.PASSWORD;
  let p1 = User.find({username: u, password:p}).exec();
  p1.then((results => {
    if(results.length >0){
      id = addSession(u);
      res.cookie('login', {username: u, sid : id}, {maxAge:30000});
      // res.cookie('login', {username: u});
      //send back a string with a user id (session id) - cookies, keep track of who logged in
      res.end('SUCCESS');
      // res.redirect('/public_html/home.html');
    }else{
      res.end('LOGIN FAILED');
    }
  }))
});

// (GET) Should return a JSON array containing every listing (item)for the user USERNAME.
app.get('/get/listings/:USERNAME', (req, res) => {
    console.log("Sending listings for a username");
    let name = req.params.USERNAME;
    let p1 = User.findOne({username: name}).exec();
    p1.then( (results) => { 
      if(results === null){
        res.status(404).send({ status: 'Not found'});
        res.end();
      }else{
        res.end( JSON.stringify(results.listings, undefined, 2) );
      }
      
    });
    p1.catch( (error) => {
      console.log(error);
      res.end('FAIL');
    });

});


// (GET) Should return a JSON array containing every purchase (item) for the user USERNAME.
app.get('/get/purchases/:USERNAME', (req, res) => {
    console.log("Sending all purchases for a user");
    let name = req.params.USERNAME;
    let p1 = User.findOne({username: name}).exec();
    p1.then( (results) => { 
      if(results === null){
        res.status(404).send({ status: 'Not found'});
        res.end();
      }else{
        res.end(  JSON.stringify(results.purchases, undefined, 2) );
      }
      
    });
    p1.catch( (error) => {
      console.log(error);
      res.status(404).send({ status: 'NotOK'});
    });
});

app.get('/get/purchases-data/:USERNAME', (req, res) => {
  console.log("Sending all purchases for a user");
  let name = req.params.USERNAME;
  let p1 = User.findOne({username: name}).exec();
  var allPurchases = [];
  let counter = 0;
  p1.then( (results) => { 
    if(results === null){
      res.status(404).send({ status: 'Not found'});
      res.end();
    }else{

      let purchases = results.purchases;
      
      for(let i=0; i<purchases.length; i++){
        let p2 = Item.findOne({_id: purchases[i]}).exec();
        p2.then( (results) => {
          allPurchases.push(results);
          counter += 1; // counts the # of purchases added to the list
          if( counter === purchases.length){
            res.end(  JSON.stringify(allPurchases, undefined, 2) );
          }


        });
        p2.catch( (error) => {
          console.log(error);
          res.end('FAIL');
        });

        
        
      }
      
    }
    
  });
  p1.catch( (error) => {
    console.log(error);
    res.status(404).send({ status: 'NotOK'});
  });
});




app.get('/get/listings-data/:USERNAME', (req, res) => {
  console.log("Sending all listings for a user");
  let name = req.params.USERNAME;
  let p1 = User.findOne({username: name}).exec();
  var allListings = [];
  let counter = 0;
  p1.then( (results) => { 
    if(results === null){
      res.status(404).send({ status: 'Not found'});
      res.end();
    }else{

      let posts = results.listings;
      
      for(let i=0; i<posts.length; i++){
        let p2 = Item.findOne({_id: posts[i]}).exec();
        p2.then( (results) => {
          allListings.push(results);
          counter += 1; // counts the # of purchases added to the list
          if( counter === posts.length){
            res.end(  JSON.stringify(allListings, undefined, 2) );
          }


        });
        p2.catch( (error) => {
          console.log(error);
          res.end('FAIL');
        });

        
        
      }
      
    }
    
  });
  p1.catch( (error) => {
    console.log(error);
    res.status(404).send({ status: 'NotOK'});
  });

});

// (GET) Should return a JSON list of every user whose username has the substring KEYWORD.
app.get('/search/users/:KEYWORD', (req, res) => {
    console.log("Sending all matching users");
    let keyword = req.params.KEYWORD;
    let p1 = User.find({username: { $regex: keyword, $options: 'i' }}).exec();
    p1.then( (results) => { 
      res.end( JSON.stringify(results, undefined, 2) );
    });
    p1.catch( (error) => {
      console.log(error);
      res.end('FAIL');
    });
});

// (GET) Should return a JSON list of every item whose description has the substring KEYWORD.
app.get('/search/items/:KEYWORD', (req, res) => {
    console.log("Sending all matching items");
    let keyword = req.params.KEYWORD;
    let p1 = Item.find({description: { $regex: keyword, $options: 'i' }}).exec();
    p1.then( (results) => {
      console.log("found matches");
      res.end( JSON.stringify(results, undefined, 2) );
    });
    p1.catch( (error) => {
      console.log(error);
      res.end('FAIL');
    });
});


//  (POST) Should add a user to the database. The username and password should be sent as POST parameter(s).
app.post('/add/user/', (req, res) => {
  console.log("Saving a new user")
  let newUserToSave = req.body;
  console.log(req.url);
  console.log(req.body);
  let userData = null;
  try{
    userData = JSON.parse(newUserToSave);
  }catch (e){
    userData = newUserToSave;
  }
  
  let p3 = User.find({username: userData.username, password: userData.password}).exec();
p3.then((results) => {
  console.log(results);
  if(results.length ==0){
    let newUser = new User(newUserToSave);
    let p1 = newUser.save();
    p1.then( (doc) => { 
      res.end('SAVED SUCCESFULLY');
    });
    p1.catch( (err) => { 
      console.log(err);
      res.end('FAIL');
    });
  }else{
    res.end("Invalid credentials");
  }
})
  
  
  

})


// (POST) Should add an item to the database. The items information 
// (title, description, image, price, status) should be included as POST parameters. 
// The item should be added the USERNAMEs list of listings.
app.post('/add/item/:USERNAME', (req, res) => {
    let name = req.params.USERNAME;
    let newItemToSave = req.body;
    

    let p2 = User.findOne({username: name}).exec();
    p2.then((user) => {
      if(user === null){
        res.status(404).send({ status: 'Not found'});
        res.end();
      }else{
        console.log(newItemToSave);
        console.log('Saving the item for ' + user);
        var newItem = new Item(newItemToSave);
        let p1 = newItem.save();
        p1.then( (doc) => { 
          res.end('Item created');
        });
        p1.catch( (err) => { 
            console.log(err);
            res.end('FAIL');
        });
        user.listings.push(newItem._id);
        let result = user.save();
        result.then( (doc) => { 
          res.end('Item added to the user');
        });
        result.catch( (err) => { 
            console.log(err);
            res.end('failed to add to the user');
        });
      }
        
      
    })
    p2.catch((err) =>{
      console.log(err);
      res.end('FAIL');
    });

});

app.post('/purchase/item/:USERNAME', (req, res) => {
  console.log('buying an item')
  let username = req.params.USERNAME;
  let purchase = req.body;
  let purchasedItem = null;
  try{
    purchasedItem = JSON.parse(purchase);
  }catch (e){
    purchasedItem = purchase;
  }
  let p1 = Item.findOne({title:purchasedItem.title, description:purchasedItem.description, price:purchasedItem.price}).exec();
  p1.then((item) => {
    if(item === null){
      console.log("Item to purchase not found");
      res.status(404).send({ status: 'Item not found'});
        res.end();
    }else{
      console.log("user bought an item");
      item.stat = 'sold';
      let p2 = item.save();
      recordUserPurchase(username, item,req,res);
      p2.then((doc) => {res.send('item sold')});
    }
  });
});

function recordUserPurchase(username, purchase,req,res){
  let p2 = User.findOne({username: username}).exec();
  p2.then((user) => {
    if(user === null){
      res.status(404).send({ status: 'Not found'});
      res.end();
    }else{
      console.log('Recording a purchase for ' + username);
      user.purchases.push(purchase._id);
      let result = user.save();
      result.then( (doc) => { 
        res.end('purchase recorded');
      });
      result.catch( (err) => { 
          console.log(err);
          res.end('failed to record the purchase');
      });

    }

  });
}