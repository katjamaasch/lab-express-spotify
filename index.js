require('dotenv').config();

const express = require('express');
const hbs = require('hbs');
const path = require('path');

// require spotify-web-api-node package here:
const SpotifyWebApi = require('spotify-web-api-node');

const app = express();

app.set('view engine', 'hbs');
//app.set('views', __dirname + '/views');
app.set(path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
hbs.registerPartials(path.join(__dirname, 'views', 'partials'));

// setting the spotify-api goes here:
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET
});

// Retrieve an access token
spotifyApi
  .clientCredentialsGrant()
  .then((data) => spotifyApi.setAccessToken(data.body['access_token']))
  .catch((error) =>
    console.log('Something went wrong when retrieving an access token', error)
  );

//TEST
function standby() {
  document.getElementById('foo').src = '/images/mic.jpeg';
}

// Our routes go here:

app.get('/', (req, res) => {
  res.render('home');
});

app.get('/artist-search', (req, res) => {
  const searchQuery = req.query.q;
  spotifyApi
    .searchArtists(searchQuery /*'HERE GOES THE QUERY ARTIST'*/)

    .then((data) => {
      //console.log('The received data from the API: ', data.body.artists.items);
      // ----> 'HERE WHAT WE WANT TO DO AFTER RECEIVING THE DATA FROM THE API'
      const arrayOfArtists = data.body.artists.items;
      res.render('artist-search', {
        searchQuery: searchQuery,
        arrayOfArtists: arrayOfArtists
      });
    })
    .catch((err) =>
      console.log('This error while searching artists occurred: ', err)
    );
});

app.get('/albums/:artistId', (req, res, next) => {
  const artistId = req.params.artistId;
  //.getArtistAlbums() code goes here
  spotifyApi.getArtistAlbums(artistId).then(
    function (data) {
      //console.log('Artist albums', data.body.items[0]);
      //console.log('Artist albums', data.body.items[0].id);
      //console.log('Artists', data.body.items[0].artists[0].name);
      const albumDetails = data.body.items;
      res.render('albums', { albumDetails: albumDetails });
    },
    function (err) {
      console.error(err);
    }
  );
});

app.get('/tracks/:albumId', (req, res, next) => {
  const albumId = req.params.albumId;
  spotifyApi.getAlbumTracks(albumId, { limit: 15, offset: 0 }).then(
    function (data) {
      //console.log(data.body);
      //console.log('Artists', data.body.items[1].artists);
      const trackDetails = data.body.items;
      res.render('tracks', { trackDetails: trackDetails });
    },
    function (err) {
      console.log('Something went wrong!', err);
    }
  );
});

app.get('*', (req, res) => {
  res.render('error');
});

app.listen(3003, () =>
  console.log('My Spotify project running on port 3003 🎧 🥁 🎸 🔊')
);
