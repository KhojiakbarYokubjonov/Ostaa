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
const hostname = 'localhost';
const port = 3000;
const app = express();
app.use(express.static('public_html'))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

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


app.listen(port, () => {
  console.log('Server has started.');
})
// app.get('/chats', (req, res) => {

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
      res.end('SUCCESS');
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