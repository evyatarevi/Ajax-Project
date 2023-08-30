const path = require('path');

const express = require('express');

const blogRoutes = require('./routes/blog');
const db = require('./data/database');

const app = express();

// Activate EJS view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// important: express.urlencoded() and express.json() don't parse the body for know if execute, instead they look at the headers of the incoming requests that contain information about the encoding type (urlencoded or JSON) of the request.
app.use(express.urlencoded({ extended: true })); // Parse incoming request bodies for data that attached in Form.
// but if we send data by own with fetch, the data no urlencoded. Instead we send as json type. For that we will use in json():
app.use(express.json());  //parsing JSON data. Parse all incoming requests if they are in the JSON format and parse that data for us.

app.use(express.static('public')); // Serve static files (e.g. CSS files)

app.use(blogRoutes);

app.use(function (error, req, res, next) {
  // Default error handling function
  // Will become active whenever any route / middleware crashes
  console.log(error);
  res.status(500).render('500');
});

db.connectToDatabase().then(function () {
  app.listen(3000);
});

