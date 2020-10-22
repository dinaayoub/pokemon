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
const PORT = process.env.PORT || 3000;
const client = new pg.Client(process.env.DATABASE_URL);

//connect to db 
client.connect();
client.on('error', error => handleErrors(error));

//routes
app.get('/', getPokemonFromAPI);

//object constructors
function Pokemon (data){
  this.name = data.name;
  this.url = data.url;
}

//functions
function getPokemonFromAPI(req,res) {
  let pokeapi = `https://pokeapi.co/api/v2/pokemon?limit=100&offset=0`
  superagent.get(pokeapi)
    .then(data => {
      if (data.results.length > 0) {
        data.results.forEach(item => new Pokemon(item));
      }
      res.render('/pages/show', {pokemons : data})
    })
    .catch(error => handleErrors(error,res));
}
function handleErrors(error,res) {
    if (!error.message) error = new Error('page not found');
    console.error(error);
    res.render('pages/error', { error: error });
}

//catch all for unknown routes
app.get('*', handleErrors);

//start up the server
app.listen(PORT, () => {
  console.log(`Server is up on port `,PORT);
});
