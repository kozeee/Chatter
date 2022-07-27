// packages 
require("dotenv").config()
const express = require("express");
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const MongoStore = require('connect-mongo');
const bodyParser = require("body-parser");
const cors = require("cors");

// routes 
const userRoute = require("./routes/Users")
const channelRoute = require("./routes/Channels");

// authentication variables from .env file
const secret = process.env.SECRET;

// express options
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.use(express.static(__dirname + "/views/"));
app.set('view engine', 'ejs');
app.set('trust proxy', 1)

//set up sessions
const sessionStore = new MongoStore({
  mongoUrl: 'mongodb://localhost/Chatter',
  collection: 'sessions'
})

app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    store: sessionStore,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 //1 day
    }
  })
);

// passport auth
require('./config/passport')
app.use(passport.initialize())
app.use(passport.session())

// routes
app.use("/users", userRoute);
app.use("/channel", channelRoute);

// serve index
app.get('/', (req, res) => {
  if (req.isAuthenticated()) {
    res.redirect('/users/home')
  }
  res.render('index')

})

app.listen(8080, () => {
  console.log("Server on port 8080")
})