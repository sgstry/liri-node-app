var keys = require('./keys.js');
var fs = require('fs');

var command = process.argv[2];
var numParams = process.argv.length;

var lookup = {
	'my-tweets': function showTweets() {
		var Twitter = require('twitter');
		var client = new Twitter(keys.twitterKeys);

		var params = {screen_name: 'steven_stry', count: 20};
		client.get('statuses/user_timeline', params, function(error, tweets, response) {
			if (!error) {
				var log = "";
    			for(var tweet in tweets) {
    				log += (tweets[tweet].text + '\r\n' + tweets[tweet].created_at + '\r\n');
    			}
    			console.log(log);
    			fs.appendFile('log.txt', log + '\r\n', function(error) {
					if(error) {
						return console.log(error);
					}
				});
  			} else {console.log(error);}
		});
	},
	'spotify-this-song': function spotify(subject) {
		if(subject) {
			var song = subject;
			var Spotify = require('node-spotify-api');

			var spotify = new Spotify(keys.spotifyKeys);
			spotify.search({type: 'track', query: song.trim(), limit: 1}, function(err, data) {
				if(err) {
					return console.log('Error occurred: ' + err);
				}
				var artistString = 'Artists: ';
				var first = true;
				for(var artist in data.tracks.items[0].artists) {
					artistString += (first === true ? '' : ', ') + data.tracks.items[0].artists[artist].name;
					first = false;
				}
				var log = artistString + '\r\n';
				log += 'Song: ' + data.tracks.items[0].name + '\r\n';
				log += 'Preview Link: ' + (data.tracks.items[0].preview_url === null ? 'No link provided' : data.tracks.items[0].preview_url) + '\r\n';
				log += 'Album: ' + data.tracks.items[0].album.name + '\r\n';
				console.log(log);
				fs.appendFile('log.txt', log + '\r\n', function(error) {
						if(error) {
							return console.log(error);
						}
				});
			})
		} else {
			console.log('Invalid Request: Please enter the correct number of arguments (4)');
		}
	},
	'movie-this': function omdb(subject) {

		String.prototype.replaceAll = function(target, replacement) {
		  return this.split(target).join(replacement);
		};

		var request = require("request");
		var apiKey = keys.omdbKey.apiKey;


		if(subject) {
			var movie = subject.replaceAll(" ", "+");
			request("http://www.omdbapi.com/?t="+movie+"&plot=short&r=json&apikey=40e9cece", function(error, response, body) {
				var data = JSON.parse(body);
			  	if (!error && response.statusCode === 200) {
			  		var log = "Title: " + data.Title + '\r\n';
			  		log += "Year: " + data.Year + '\r\n';
			  		log += "IMDB Rating: " + data.imdbRating + '\r\n';
			  		log += "Country: " + data.Country + '\r\n';
			  		log += "Language: " + data.Language + '\r\n';
			  		log += "Plot: " + data.Plot + '\r\n';
			  		log += "Actors: " + data.Actors + '\r\n';
			  		log += "Rotten Tomatoes URL: " + data.Website;
			  		console.log(log);
			  		fs.appendFile('log.txt', log + '\r\n', function(error) {
						if(error) {
							return console.log(error);
						}
					});

			  	} else {
			  		console.log(error);
			  	}

			});
		} else {
			console.log('Invalid Request: Please enter the correct number of arguments (4)');
		}
	},
	'do-what-it-says': function doIt() {
		fs.readFile('random.txt', 'utf8', function(error, data) {

			if(error) {
				return console.log(error);
			}

			if(data) {
				var args = data.split(',');
				var len = args.length;
				var command;
				var subject;
				if(len > 0 && len < 3) {
					command = args[0];
					if(lookup[command] !== undefined){
						if(len == 2) {
							lookup[command](args[1]);
						}
						else {
							lookup[command]();
						}
					}

				} else {
					console.log('Invalid Request: Incorrect number of arguments');
				} 
			}

		});

	}
};

if(lookup[command] !== undefined){
	if(numParams == 4) {
		lookup[command](process.argv[3]);
	}
	else {
		lookup[command]();
	}
}