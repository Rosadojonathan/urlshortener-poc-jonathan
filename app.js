const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;
const mongoose = require('mongoose');
const shortUrl = require('./models/shortUrl');
app.use(bodyParser.json());
app.use(cors());

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/shortUrls');

app.use(express.static(__dirname + '/public'));

app.get('/new/:urlToShorten(*)', (req,res)=>{
	const { urlToShorten } = req.params;
	console.log(urlToShorten);
	var regex = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;﻿
	if (regex.test(urlToShorten) === true){
		var short = Math.floor(Math.random()*100000).toString();

		var data = new shortUrl({
			originalUrl: urlToShorten,
			shorterUrl: short
		});

		data.save(err=>{
			if(err){
				return res.send('Error with database' + err);
			}
		});

		return res.json(data);
	}
	var data = new shortUrl({
		originalUrl: 'urlToShorten does not match standard format',
		shorterUrl: 'Invalid Url'
	});
	return res.json(data);
});

app.get('/url/:urlToForward', (req,res,next)=>{
	var shorterUrl = req.params.urlToForward;

	shortUrl.findOne({'shorterUrl': shorterUrl}, (err,data)=>{
		if(err) { res.send('No shorterUrl going by that name')};
		var re = new RegExp("^(http|https)://","i");
		var strToCheck = data.originalUrl;
		if(re.test(strToCheck)){
			res.redirect(301,data.originalUrl);
		}
		else{
			res.redirect(301, 'http://'+data.originalUrl)
		}
	});

})

app.listen(port, function(){
	console.log('server listening on port ' + port);
})
