//dependencies
const express = require('express');
const app = express();
const superagent = require('superagent');
const env = require('dotenv');
const pg = require('pg');
const methodOverride = require('method-override');

//client side configs
app.use(express.urlencoded({ extended: true }));
app.use(express.static('./public'));
app.use(methodOverride('_method'));
app.set('view engine', 'ejs');


//server side configs
env.config();
const PORT = process.env.PORT;
const client = new pg.Client(process.env.DATABASE_URL);

//connect to db 
client.connect();
client.on('error', error => handleErrors(error));
//routes




//catch all for unknown routes
app.get('*', error => handleErrors(error));

//start up the server
app.listen(PORT, () => {
  console.log(`Server is up on port `,PORT);
});
