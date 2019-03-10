// This imports in require components with React for the front end and Axios for the database backend
import React, { Component } from "react";
import axios from "axios";

class App extends Component {
  //  This initialises the state that will be used throughout the different parts of this
  state = {
    data: [],
    userid: 0,
    givenName: null,
    time: null,
    email:null,
    created:null,
    familyName:null,
    intervalIsSet: false,
    idToDelete: null,
    idToUpdate: null
  };

  //  This function shows or hides the database data using the GET command later on by the use
  //  of a button at the top of the page.  It uses the ID in the body of the render section
  // to know what to hide and to section it off accordingly

  showGETdata(){

    var divelement = document.getElementById('showdatafromDB');

    if (divelement.style.display ==='none') {
        divelement.style.display ='block';
    }
    else {
        divelement.style.display ='none';
         }
  };


  //  This is used to load the data from the database when the page is First loaded up
  //  by using the componentDidMount function.  It uses an interval of 3 seconds for a refresh
  //  rate, to ensure that the data reflected is up to date.  This can be changed if needed
  componentDidMount() {

    var divelement = document.getElementById('showdatafromDB');    //  Hides the data from the MongoDB data upon loading - can be shown through the button

    divelement.style.display ='none';


    this.getDataFromDb();
    if (!this.state.intervalIsSet) {
      let interval = setInterval(this.getDataFromDb, 3000);
      this.setState({ intervalIsSet: interval });
    }
  }

  //  This stops the process living forever and kills it at the end of each interval
  componentWillUnmount() {
    if (this.state.intervalIsSet) {
      clearInterval(this.state.intervalIsSet);
      this.setState({ intervalIsSet: null });
    }
  }

  // This gets data from the database using the GET method in the server.js file
  getDataFromDb = () => {
    fetch("http://localhost:3001/api/getData")
      .then(data => data.json())
      .then(res => this.setState({ data: res.data }));
  };

  //  This is used to add/post data to the database
  postDataToDB = () => {
    let currentIds = this.state.data.map(data => data.userid);   // Maps the ID's that already exists to an array so it can be searched through
    let givenNameadd = this.state.givenName;
    let emailadd = this.state.email;              //  These all use the current states and entries from the HTML front en
    let familyNameadd = this.state.familyName;
    let idToBeAdded = 0;
    while (currentIds.includes(idToBeAdded)) {   // This searches through existing IDs before submission and automatically
      ++idToBeAdded;                             // inrements the ID value until it finds one that hasn't been used already
    }

    var emailcheck = document.forms["myForm"]["email"].value; // This is email validation whose function is described in the server.js file
    var atsymbolpos = emailcheck.indexOf("@");
    var dotsymbolpos =emailcheck.lastIndexOf(".");
    var errorcheck = null;

    if (atsymbolpos <1 || (dotsymbolpos - atsymbolpos < 2)) {
      errorcheck = "Fail"
    }

    if (errorcheck === "Fail") {
      alert("There are errors with your email input - please ensure you have included an '@' symbol and a '.'")
      return false;
    }

    //  This posts the data from the relevant states in the render method to the Mongo database via the server.js file
    axios.post("http://localhost:3001/api/postData", {
      userid: idToBeAdded,
      givenName: givenNameadd,
      familyName:familyNameadd,
      email:emailadd

    });

    // This simply returns a message alert through the browser saying that a person has been added successfully if the
    // the fields aren't null and the error check earlier has passed

    if (errorcheck === null && emailadd !== null && givenNameadd !== null && familyNameadd !== null){
      alert("Person added sucsessfully");
    }

  };


  //  This is the delete area that removes an ID and associated data to that ID from the database
  deleteFromDB = idTodelete => {
    let objIdToDelete = null;
    var counter = 0;
    var updateOK = String;


    // This is used to search through the database for a matching ID to the one entered on the front end.
    //  If one is found, it sets a variable to OK, if not, it uses a counter for error reporting later on
    this.state.data.forEach(dat => {
      if (dat.userid === parseInt(idTodelete,10)) {
        objIdToDelete = dat.userid;

        updateOK ='Yes';


      }
      else  {
        counter = 1;
      }
    });

    // If the variables for error checks have reported a fail, an error message is displayed through the browser
    // otherwise, a message is displayed saying it has been deleted

    if (counter >= 1 && updateOK !=='Yes') {
      alert ('ID does not exist or the ID field has been left blank, please try again')
    }
    else{
      alert('User has been found and has been deleted')
    }
    //alert(objIdToDelete);
    axios.delete("http://localhost:3001/api/deleteData", {
        data: {userid:objIdToDelete}
      });

  };


  //  This is the section used to update existing data in the database
  updateDB = (idToUpdate,emailupdateToApply, givenNameupdateToApply, familyNameupdateToApply) => {
    let objIdToUpdate = null;
    var updateOK = String;
    var errorcheck2 = null;


    // Same email validation checking as seen eleswhere
    let emailupdcheck = this.state.emailupdateToApply;
    if (emailupdcheck !== undefined){
      var atsymbolposupd = emailupdcheck.indexOf("@");
      var dotsymbolposupd =emailupdcheck.lastIndexOf(".");
    }

    if (atsymbolposupd <1 || (dotsymbolposupd - atsymbolposupd < 2)) {
        errorcheck2 = "Fail"
      }

    if (errorcheck2 === "Fail") {
        alert("There are errors with your email input - please ensure you have included an '@' symbol and a '.'")
        return false;
      }


    //  Same as in the delete section, this searches for an ID that may or may not exist to match up with
    this.state.data.forEach(dat => {
      if (dat.userid === parseInt(idToUpdate,10)) {
        objIdToUpdate = dat.userid;
        updateOK ='Yes';

        }
      });

    if (updateOK !=='Yes') {
        alert ('ID does not exist, has been left blank, or other fields are empty. Please try again')
        }


    axios.put("http://localhost:3001/api/updateData", {
      userid: objIdToUpdate,
      email: emailupdateToApply,
      givenName: givenNameupdateToApply,
      familyName: familyNameupdateToApply   //  All values are passed into the object body that need updating

    });


    if (updateOK === 'Yes' && emailupdateToApply !== undefined && givenNameupdateToApply !== undefined && familyNameupdateToApply !== undefined){
      alert("Person updated sucsessfully");
    }

  };


  // This entire section is dedicated to the front end rendering of the HTML page
  // It begins by rendering the data from the database using the componentDidMount section earlier.  This is hidden/shown
  // by the use of a button at the top of the page.  Next, it displays the form for adding new data into the database.
  // It uses some basic 'required' and 'maxLength' validation for presence and length checks respectively.  These are used
  // in all form entries.  It uses then uses the states on the page for inputs that are passed into their respective
  // functions earlier on as parameters for get, post, put and delete.  It then generates similar forms for the delete command
  // update sections that operate in a very similar way.  Names for inputs are used to assist with checks and similar functions
  // used earlier on.

  render() {

    const { data } = this.state;
    return (

      <div>
        <div>
        <h1 align="center"> Welcome to the Holiday Extra User System </h1>
        <ul id="showdatafromDB">
          {data.length <= 0
            ? "Nothing in the database yet"
            : data.map(dat => (
                <li key={dat._id}>
                    <span> User ID (simpler version):</span>   {dat.userid} <br />
                    <span> User ID (created by MongoDB): </span> {dat._id} <br />
                    <span> Email address of user:     </span>{dat.email} <br />
                    <span> Given (First) name for user:    </span>{dat.givenName} <br />
                    <span> Family (Last) name of user:      </span>{dat.familyName} <br />
                    <span> Time and date entry was created at:      </span>

                            {new Intl.DateTimeFormat('en-GB', {
                              year: 'numeric',
                              month: 'long',
                              day: '2-digit',
                              hour: 'numeric',
                              minute: 'numeric'
                            }).format(dat.created)}
                </li>
              ))}
        </ul>
        <div>
        <h4 align="center"> Click the button below to show/hide data in the database</h4>
        <button align="center disc !important" onClick= {()=>this.showGETdata()}> Click to adjust the page and show all data in the database </button>
        </div>
        </div>
        <br/>
        <br/>
        <form name ="myForm">

        <div>
        <h3 align= "center"> Add new user section </h3>
        <h4 align= "center"> <i> (Note - ID's are auto generated, as is the time and date) </i></h4>

        <label> Please enter the email address here: </label>
          <input
            type="text"
            name ="email"
            onChange={e => this.setState({ email: e.target.value })}
            placeholder="Required to be filled in, max length 100 characters"
            required
            maxLength ="100"
          />
        </div>
        <br/>
        <div>
        <label> Please enter the given name of the person (first name): </label>
          <input
            type="text"
            name = "givenName"
            onChange={e => this.setState({ givenName: e.target.value })}
            placeholder="Required to be filled in, max length 60 characters"
            required
            maxLength ="60"
          />
        </div>
        <br/>
        <div>
        <label> Please enter the family name of the person (last name): </label>
          <input
            type="text"
            name = "familyName"
            onChange={e => this.setState({ familyName: e.target.value })}
            placeholder="Required to be filled in, max length 60 characters"
            required
            maxLength ="60"
          />
          <br/>
          <br/>
          <button onClick={()=>this.postDataToDB(this.state.id)}>
            Add a new person
          </button>
          <br/>
        </div>
        </form>
        <form name ="Delete Form">
        <div>
        <h3 align= "center"> Delete user section </h3>
        <label> Please enter the ID of the person you wish to delete: </label>
          <input
            type="text"
            onChange={e => this.setState({ idToDelete: e.target.value })}
            placeholder="Required to be filled in, max length 4 characters"
            required
            maxLength ="4"
          />
          <br/>
          <br/>
          <button onClick={() => this.deleteFromDB(this.state.idToDelete)}>
            Delete a person/ID
          </button>
          <br/>

        </div>
        </form>
        <div>
        <form name ="Update Form">
        <h3 align= "center"> Update user section </h3>
          <label> Please enter the ID of the person you wish to update : </label>
          <input
            type="text"
            name = "idupd"
            onChange={e => this.setState({ idToUpdate: e.target.value })}
            placeholder="Required to be filled in, max length 4 characters"
            required
            maxLength ="4"
          />
          <br/>
          <br/>
          <label> Please enter the email address of the person you wish to update : </label>
          <input
            type="text"
            name = "emailupd"
            onChange={e => this.setState({ emailupdateToApply: e.target.value })}
            placeholder="Required to be filled in, max length 100 characters"
            required
            maxLength ="100"
          />
          <br/>
          <br/>
          <label> Please enter the given name of the person you wish to update : </label>
          <input
            type="text"
            name="givenNameupd"
            onChange={e => this.setState({ givenNameupdateToApply: e.target.value })}
            placeholder="Required to be filled in, max length 60 characters"
            required
            maxLength ="60"
          />
          <br/>
          <br/>
          <label> Please enter the family name of the person you wish to update : </label>
          <input
            type="text"
            name="familyNameupd"
            onChange={e => this.setState({ familyNameupdateToApply: e.target.value })}
            placeholder="Required to be filled in, max length 60 characters"
            required
            maxLength ="60"
          />
          <br/>
          <br/>
          <button
            onClick={() =>
              this.updateDB(this.state.idToUpdate, this.state.emailupdateToApply, this.state.givenNameupdateToApply, this.state.familyNameupdateToApply)
            }>
            Update the person/ID
          </button>
          <br/>
        </form>
        </div>
      </div>
    );
  }
}

// Simply exports the app to be used for final rendering.
export default App;
