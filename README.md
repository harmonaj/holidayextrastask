<h4>Overview -</h4>

Please follow these instructions for the deployment of the Web API.  This has been produced with Node js, React and Mongo DB/Mongoose.  You will only need to ensure that Node is installed for this to work, everything else is installed automatically through the commands seen below. The Mongo DB database is hosted online at MongoDB Atlas, so please ensure that you have an active internet connection for this to run effectively.

Please note that this app has been left in development mode and has not been built.

<h4> Interacting with/using the Web API through React front-end/Postman/curl - </h4>

When interacting with the API, it can be done through the React/HTML front end or through Postman/curl, depending on your preferences.  It will auto launch a web browser for you to use with the instructions below, but you can just as easily use Postman to interact with the API by launching it and using GET/POST/PUT/DELETE requests in the same way you normally would.  It is all done through port 3001 on your machine, so for example, to post data using Postman, you would use localhost:3001/api/postData and select the POST method/request through the dropdown on the left.  All required entries then go through the body as normal, but please ensure that the 'raw' radio button is selected for the data and that JSON is used on the respective drop down.  Alternatively, follow the instructions below for use through a web front end.

<h4> Installation instructions - </h4>

1) Download/clone the Github repository into a directory or area of your choice.

2) Ensure that Node is installed on your respective operating system, if it is not already.  It can be found at (https://nodejs.org/en/).  Instructions to install it depend on your operating system, so cannot be fully explained here.

3) Load up Terminal or your respective CLI for your operating system.

4) Switch to the directory where the Github repository has been downloaded to (or go to where the clone of it is), typically with the 'cd' command.  For example, if your repository has been downloaded as a zip file (please ensure you have unzipped the contents first if this is the case) and is in a folder called 'webpapi' in your root directory, a command such as 'cd webapi' may switch to it.  You will then need to change into the sub-directory called 'holidayextrastask-master' using the 'cd' command.

5) Type in 'npm install' and let the application download all required dependencies.

6) Type in 'npm start' to launch the Web API.  It should automatically open up an internet browser window (using your default installed browser) and from there you can use the system.
