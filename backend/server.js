//Sets up all required dependencies and imports in the Data schema as defined in data.js

const mongoose = require("mongoose");
const express = require("express");
const bodyParser = require("body-parser")
const logger = require("morgan");
const Data = require("./data");

//Sets up port to be used for router/CRUD requests.

const API_PORT = 3001;
const app = express();  //Sets up app as express
const router = express.Router();

//Imports in/uses the express validators and sanitsation libraries for sanitising user inputs

const { body,check,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

// connects to the MongoDB database (hosted on MongoDB Atlas - internet connection required)
// I would normally not do the database connection through an exposed/insecure route like in the line below - this is purely for testing purposes
mongoose.connect('mongodb+srv://harmonaj:Test1@cluster0-il89n.mongodb.net/test?retryWrites=true',{useNewUrlParser:true});
mongoose.Promise=global.Promise;

// This ensures that Mongoose doesn't produce a deprecated command warning related to FindAndModify and indexing of items

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

// This sets up the connection to our database for use with the router sections below

let db = mongoose.connection;

// Outputs to the console that the connection to the database has been made

db.once("open", () => console.log("Now connected to the Mongo DB database (hosted on MLab - please keep an active internet connection)"));

// This checks for a successful database connection and reports back if not
db.on("error", console.error.bind(console, "MongoDB connection error:"));

// This is used for logging and the bodyParser is then used to parse the request body of the below area into JSON format

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Uses the Express validator modules needed to validation later on

app.use(logger("dev"));
app.use(express.json());

// This allows the browswer to be used for CORS requests without proxies or other options.  I am aware it is not the safest in some ways, but it is here for convenience

app.use(function(req, res, next) {

    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");

    next();
});



//This is the GET request to retrieve all existing data from the database.  Can be done in Postman, CURL or through the React front end
router.get("/getData", (req, res) => {
  Data.find((err, data) => {
    if (err) return res.json({ message: "Unable to fetch data from database - please check your request"});
    return res.json({ success: true, data: data });
  });
});


//This is the PUT (update) request that is used to update the existing data in the database with new entries posted in the Postman body or React front end

router.put("/updateData",[    // The first part of this post section is dedicated to sanitising the inputs from the user.
  body('id').trim().escape(),
  body('email').trim().escape(),
  body('givenName').trim().escape(),   // The trim and escape commands combined should remove all additional characters that can be used to cause injections, XSS or similar
  body('familyName').trim().escape(),
  ],




  (req, res) => {

  // This then sets up the required elements of the body that will be submitted

  const { userid, email, givenName,familyName} = req.body;

  // This is where the validation begins for the back end/Postman route.  Please note - the validation seen
  // below is done automatically through the 'required' and 'maxlength' attributes on the React front end and isn't
  // needed there.  Here, if being used with Postman, it would need it's own coding, as seen below

  var errorcheck = String;

  if (!userid && userid !== 0) {
      errorcheck = "Fail"
      }

  if (email ===undefined || email.length <=0 || email.length >= 100) {
      errorcheck = "Fail"
      }

  if (familyName ===undefined || familyName.length <=0 || familyName.length >= 60) {
        errorcheck = "Fail"
      }

  if (givenName ===undefined || givenName.length <=0 || givenName.length >= 60) {
        errorcheck = "Fail"
      }

  // If the validation variable 'errorcheck' has Fail in it as a result of any of the above conditions not being met,
  // it will output a message to Postman/curl using a JSON output to say there is a problem

  if (errorcheck === "Fail") {
      return res.json({
        success: false,
        error: "Invalid inputs (check the length of them too) or missing data - please check"
      });
  }

  //  The validation below checks if the email address entered has a '@' symbol in it or
  // a '.' in suitable places of an email adddress.  It is basic, yet effective validation.
  //  Further email validation can be done with the express validator with the 'normalizeEmail'
  // command if needed

  emailerrorcheck ='';
  var atsymbolpos = email.indexOf("@");
  var dotsymbolpos =email.lastIndexOf(".");

  if (atsymbolpos <1 || (dotsymbolpos - atsymbolpos < 2)) {
      emailerrorcheck = "Fail"
  }

  if (emailerrorcheck === "Fail") {
    return res.json({
        success: false,
        error: "Your email has not been inputted in the correct format - please try again"
      });
  }


  // This uses the ID as the identifier to know which entry to update in the database, with the other values
  // in the body passed through as the values to update.  Again, messages are sent either way depending on
  // success or failure

    Data.findOneAndUpdate({userid:userid}, {$set: {email:email,givenName:givenName,familyName:familyName}},{new:true}, (err,result) => {                // passes through all necessary items for updating
      if (err) {
      return res.send({ success: false, error: err});
    }
      if (result !== null){
        return res.status(200).send({
        message: "Person updated sucsessfully"});
      }   else  {
        return res.status(402).send({
        message: "Failed to update - please check your entries"});
         }

      });
  });


//  This is the delete method to be used to remove data from the database
router.delete("/deleteData", [    // More sanitisation in the same method as used earlier in update
  body('userid').trim().escape(),

],

(req, res) => {

  const { userid } = req.body;

// This is a simple check to see if the ID hasn't been left blank in Postman/curl.  If it has,
// a message is displayed saying it has failed, otherwise the error can be difficult to track

  if (userid=== undefined) {
    return res.json({
        success: false,
        error: "ID has been left blank, please try again"
      });
  }

//  Uses the findOneAndDelete command to locate the ID entered and delete it accordingly from the
// Mongo DB database

  Data.findOneAndDelete({userid:userid}, (err,result) => {
    if (err) {
    return res.send({ success: false, error: err});
  }
    if (result !== null){
      return res.status(200).send({
      message: "Person deleted sucsessfully"});
    }   else  {
      return res.status(402).send({
      message: "Failed to delete - please check your entries"});
       }

    });
});

//  This is the create method that adds data to the database
router.post("/postData", [
  body('email').trim().escape().normalizeEmail(),
  body('givenName').trim().escape(),    //  The same sanitisation as used earlier on
  body('familyName').trim().escape(),
  ],

  (req, res) => {



  let data = new Data();

// This passes the values from the body/ HTML front end to be used when adding to the
// database

  const { userid, givenName ,email,familyName } = req.body;

// Same validation as used earlier, just modified for this section

  var errorcheck = String;

  if (email ===undefined ||email ===null || email.length <=0 || email.length >= 100) {
    errorcheck = "Fail"
    }

  if (familyName ===undefined ||familyName ===null ||familyName.length <=0 || familyName.length >= 60) {
      errorcheck = "Fail"
    }

  if (givenName ===undefined ||givenName ===null ||givenName.length <=0 || givenName.length >= 60) {
      errorcheck = "Fail"
    }

  if (errorcheck === "Fail") {
    return res.json({
      success: false,
      error: "Invalid inputs (check the length of them too) or missing data - please check"
    });
  }

  emailerrorcheck ='';
  var atsymbolpos = email.indexOf("@");
  var dotsymbolpos =email.lastIndexOf(".");

  if (atsymbolpos <1 || (dotsymbolpos - atsymbolpos < 2)) {
    emailerrorcheck = "Fail"
  }

  if (emailerrorcheck === "Fail") {
    return res.json({
      success: false,
      error: "Your email has not been inputted in the correct format - please try again"
    });
  }


// This is adding the required data from above ready to save to the database


  data.userid = userid;
  data.email=email;
  data.givenName = givenName;
  data.familyName=familyName;

  data.save(err => {
    if (err) return res.send({ message: "There is an error somewhere else in your inputs - please check you haven't used an ID that is already present" });
    return res.status(200).send({
   message: "Person added sucsessfully"
    });
  });
});


// This is used for HTTP requests
app.use("/api", router);

//  This outputs to the console, terminal or similar to say the app is running and the port that it is running on
app.listen(API_PORT, () => console.log(`The app is currently listening on port: ${API_PORT}`));
