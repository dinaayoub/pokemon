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
app.post('/pokemon', saveFavoritePokemon)
app.get('/favorites', getFavoritesFromDB);

//object constructors
function Pokemon (data){
  this.name = data.name;
  this.url = data.url;
}


//functions
//get the first 100 pokemon from the api
function getPokemonFromAPI(req,res) {
  let pokeapiURL = `https://pokeapi.co/api/v2/pokemon?limit=20&offset=0`
  superagent.get(pokeapiURL)
    .then(data => {
      //console.log(data);
      var pokemonsObjectArray= [];
      if (data.body.results.length > 0) {
        let tempArray = data.body.results.sort((a,b) => {
          if (a.name.toLowerCase() < b.name.toLowerCase()) return -1;
          if (a.name.toLowerCase()> b.name.toLowerCase()) return 1;
          return 0;
        });
        pokemonsObjectArray = tempArray.map(item => new Pokemon(item));
        res.render('pages/show', {pokemons : pokemonsObjectArray});
      }
      else handleErrors(new Error('No pokemon returned from the API'), res);
    })
    .catch(error => handleErrors(error,res));
}

function saveFavoritePokemon(req,res) {
  //let id = req.params.id;
  let { name } = req.body;
  let SQL = `INSERT INTO pokemons (name) VALUES ($1);`;
  let values = [ name ];
  client.query(SQL, values)
    .then (() => {
      res.redirect('/');
    })
    .catch(error => handleErrors(error,res));
}

function getFavoritesFromDB(req,res) {
  let SQL = 'SELECT * FROM pokemons;';
  client.query(SQL)
    .then (data => {
      res.render('pages/favorites', {pokemons : data.rows});
    })
    .catch(error => handleErrors(error,res));
}
function handleErrors(error,res) {
  if (!error.message) error = new Error('page not found');
  console.error(error);
  res.render('pages/error', { error: error });
}

//catch all for unknown routes
//app.get('*', handleErrors);

//start up the server
app.listen(PORT, () => {
  console.log(`Server is up on port `,PORT);
});
