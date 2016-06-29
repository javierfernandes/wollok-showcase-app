var express = require('express')
var router = express.Router()
var path = require('path')
var fs = require('fs');
var glob = require("multi-glob").glob;
var request = require('request');

// var config = JSON.parse(fs.readFileSync(__dirname + '/../config.json', 'utf8'));

function localRepoPath() {
	return __dirname + '/../data'
}

// MIDDLEWARES
//  info.showcase format
//  {
//	   id: '',
//	   title : ''
//   }

router.get('/api/components', function(req, res, next) {
	glob(localRepoPath() + '/**/info.showcase', function(err, files) {
	  var components = files.map(function(f) {
	  	return JSON.parse(fs.readFileSync(f, "utf8"))
	  })
	  res.send(JSON.stringify(components))
	})
});

router.get('/api/components/:componentId', function(req, res, next) {
	glob(localRepoPath() + '/**/info.showcase', function(err, files) {
	  console.log("Reading all components  from files: " + files.length);
	  var found = files.filter(function(f) {
	  	var component = JSON.parse(fs.readFileSync(f, "utf8"))
	  	return component.id == req.params.componentId
	  })
	  if (!found || found.length < 1 ) {
	  	res.status(500).json({ error: "No component with id " + req.params.componentId });
	  }
	  else {
	  	var folder = path.dirname(found[0]);
	  	console.log("Looking for files on " + folder)
	  	glob([folder + '/**/*.wlk', folder + '/**/*.wpgm'], function(err, files) {
		  var filesAsJSON = files.map(function(f) {
		  	return {
		  		name: path.basename(f),
		  		fqn: encodeURIComponent(f)
		  	}
		  })
		  res.send(JSON.stringify(filesAsJSON))
		})
	  }
	});
});


// FILES
 
router.get('/api/files', function(req, res, next) {
	glob(localRepoPath() + '/**/*.wlk', function(err, files) {
	  var filesAsJSON = files.map(function(f) {
	  	return {
	  		name: path.basename(f),
	  		fqn: encodeURIComponent(f)
	  	};
	  });
	  res.send(JSON.stringify(filesAsJSON))
	});
});

router.get('/api/file/:id', function(req, res, next) {
	var fileName = req.params.id
	fs.readFile(fileName, 'utf8', function (err,data) {
  		if (err) res.status(500).json({ error: err });
  		res.send(data);
	});
})

router.get('/api/file/run/:id', function(req, res, next) {
	var fileName = req.params.id
	fs.readFile(fileName, 'utf8', function (err,data) {
		request({
			uri: 'http://server.wollok.org:8080/run',
			method: 'POST',
			preambleCRLF: true,
			postambleCRLF: true,
			body: data
		},
		function (error, response, body) {
			res.status(response.statusCode).send(body)
		}
		);
	});
})

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Wollok ShowCase' });
});


module.exports = router;
