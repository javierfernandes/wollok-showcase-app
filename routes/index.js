var express = require('express')
var router = express.Router()
var GitHubApi = require('github')
var path = require('path')
var fs = require('fs');
//var glob = require('glob'); 
var glob = require("multi-glob").glob;

var config = {
	"github" : {
	  "repoOwner" : 'uqbar-project',
	  "clientID": 'YOURS_HERE',
      "clientSecret": 'YOURS_HERE',
      "callbackURL": 'http://localhost:3000/api/auth/github/callback'
    },
    "localRepo" : '/Users/jfernandes/dev/data/repo/wollok-dev/wollok-showcase-content/src'
};

// connect github api client
var github = new GitHubApi({
    // required
    "version": '3.0.0',
    // optional
    "debug": true,
    "headers": {
        'user-agent': 'Wollok-Showcase'
    }
});
console.log('Authenticating Github API...')
github.authenticate({
    "type": 'oauth',
    "key": config.github.clientID,
    "secret": config.github.clientSecret
});
console.log('Github API authenticated!')


// MIDDLEWARES


router.get('/api/components', function(req, res, next) {
	glob(config.localRepo + '/**/info.showcase', function(err, files) {
	  var components = files.map(function(f) {
	  	return JSON.parse(fs.readFileSync(f, "utf8"))
	  })
	  res.send(JSON.stringify(components))
	})
});

router.get('/api/components/:componentId', function(req, res, next) {
	glob(config.localRepo + '/**/info.showcase', function(err, files) {
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
	glob(config.localRepo + '/**/*.wlk', function(err, files) {
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









// TAGS / BRANCHES

router.get('/api/tags', function(req, res, next) {
    var msg = {
        user : config.github.repoOwner,
        repo : 'wollok'
    }
    github.repos.getTags(msg, function(err, data) {
        if (err) return res.status(500).json({ error: err });
        res.json(data)
    });
});

router.get('/api/branches', function(req, res, next) {
    var msg = {
        user : config.github.repoOwner,
        repo : 'wollok'
    };
    github.repos.getBranches(msg, function(err, data) {
        if (err) return res.status(500).json({ error: err });
        res.json(data)
    });
});

router.get('/api/branch/:id', function(req, res, next) {
    var msg = {
        user : config.github.repoOwner,
        repo : 'wollok',
        branch: req.params.id
    }
    github.repos.getBranch(msg, function(err, data) {
        if (err) return res.status(500).json({ error: err })

		var branchTree = data.commit.commit.tree

		github.gitdata.getTree({
			user : config.github.repoOwner,
	        repo : 'wollok',
	        branch: req.params.id,
	        sha: branchTree.sha
		}, function(err, data) {
			res.json(data)
		})
    });
});


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


module.exports = router;
