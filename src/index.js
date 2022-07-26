// packages 
require("dotenv").config()
const express = require("express");
const mongoose = require('mongoose');
const session = require('express-session');
var passport = require('passport');
const MongoStore = require('connect-mongo');
const bodyParser = require("body-parser");
const cors = require("cors");

// routes 
const userRoute = require("./routes/Users")
const channelRoute = require("./routes/Channels")

// authentication variables from .env file
const spaceDomain = process.env.SPACE_URL;
const username = process.env.PROJECT_ID;
const password = process.env.API_KEY

// express options
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.use(express.static(__dirname + "/views"));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');



// routes
app.use("/users", userRoute);
app.use("/channel", channelRoute);

// serve index
app.get('/', (req, res) => {
  res.sendFile('views/index.html', { root: 'src' });
});


app.listen(8080, () => {
  console.log("Server on port 8080")
})