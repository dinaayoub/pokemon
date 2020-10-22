DROP TABLE IF EXISTS pokemons;

CREATE TABLE pokemons (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    url VARCHAR(255)
);