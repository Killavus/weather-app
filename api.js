const TrieSearch = require("trie-search");
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

const { readFileSync } = require("fs");
const cities = JSON.parse(readFileSync("./city.list.json"));
const trie = new TrieSearch(undefined, { splitOnRegEx: false });
const axios = require("axios");

cities.forEach((city, index) => {
  trie.map(city.name, index);
});

let openweather_api_key = null;
let openweather_api_root = null;
const data = require("dotenv").parse(readFileSync(".env.development.local"));
openweather_api_key =
  process.env.OPENWEATHER_API_KEY || data.OPENWEATHER_API_KEY;
openweather_api_root =
  process.env.OPENWEATHER_API_URL || data.OPENWEATHER_API_URL;

if (!openweather_api_key || !openweather_api_root) {
  console.error(
    "Please set up OPENWEATHER_API_URL and OPENWEATHER_API_KEY environment variables."
  );
  process.exit(1);
}

const app = express();

app.use(cors({ origin: "http://localhost:3000" }));
app.use(morgan("tiny"));
app.use(
  express.urlencoded({ extended: false, limit: "1kb", parameterLimit: 1 })
);
app.use(express.json());

app.get("/city", (req, res) => {
  const { q: city } = req.query;
  const searchResults = trie.search(city);

  res.json(
    searchResults.map((idx) => {
      const { id, country, name, coord: coords } = cities[idx];

      return { id, country, name, coords };
    })
  );
});

app.post("/stations", (req, res) => {
  const response = axios.post(
    `${openweather_api_root}/data/3.0/stations?appid=${openweather_api_key}`,
    req.body,
    { headers: { "Content-Type": "application/json" } }
  );

  response.then(
    (response) => {
      res.status(response.status);
      res.json(response.data);
    },
    (err) => {
      res.status(err.response.status);
      res.json(err.response.data);
    }
  );
});

app.delete("/stations/:id", (req, res) => {
  const response = axios.delete(
    `${openweather_api_root}/data/3.0/stations/${req.params.id}?appid=${openweather_api_key}`,
    { headers: { "Content-Type": "application/json" } }
  );
  response.then(
    (response) => {
      res.status(response.status);
      res.json(response.data);
    },
    (err) => {
      res.status(err.response.status);
      res.json(err.response.data);
    }
  );
});

app.listen(9000, () => {
  console.log("API listening on port 9000");
});
