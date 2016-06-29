/* jshint node:true */
'use strict';

var gulp = require('gulp');
var karma = require('karma').server;
var argv = require('yargs').argv;
var $ = require('gulp-load-plugins')();
var git = require('gulp-git');
var clean = require('gulp-clean');
var runSequence = require('run-sequence');
const minimist = require('minimist')


const options = minimist(process.argv.slice(2))

// get examples files from github

gulp.task('clone-examples', function(cb) {
  git.clone('https://github.com/uqbar-project/wollok.git', {args: __dirname + '/datatmp'}, function(err) {
      console.log("Finished cloning")
      cb(err)
  });
});

gulp.task('checkout-examples', function(cb) {

  var branchName = options.branch || 'master'
  console.log("Checking out " + branchName)
  git.checkout(branchName, {cwd: __dirname + '/datatmp'}, function (err) {
    console.log("Checked out " + branchName)
    cb(err)
  });
});

gulp.task('copy-examples', function() {
  return gulp.src('datatmp/wollok-tests/**')
      .pipe(gulp.dest('data'))
})

gulp.task('clean-cloned-examples', function() {
  return gulp.src('gulp-data', {read: false})
      .pipe(clean());
})

gulp.task('fetch-examples', function(done) {
  runSequence('clone-examples', 'checkout-examples', 'copy-examples', 'clean-cloned-examples', function() {
    done();
  });
})

// lint / compile

var config = {
  src : ['public/scripts/*.js', 'public/scripts/controllers/**/*.js']
}

gulp.task('jshint', function() {
  return gulp.src(config.src)
      .pipe($.jshint())
      // TODO: see how to fail only on errors and not warning
      // .pipe($.jshint.reporter('jshint-stylish'))
      // .pipe($.jshint.reporter('failOnError'));
});

gulp.task('jscs', function() {
  return gulp.src(config.src)
      .pipe($.jscs());
});

// build

gulp.task('styles', function() {
  return gulp.src('public/styles/main.less')
    .pipe($.plumber())
    .pipe($.less())
    .pipe($.autoprefixer({browsers: ['last 1 version']}))
    .pipe(gulp.dest('.tmp/styles'));
});

gulp.task('html', function() {
  var lazypipe = require('lazypipe');
  var cssChannel = lazypipe()
    .pipe($.csso)
    .pipe($.replace, 'public/scripts/lib/bootstrap/fonts', 'fonts');

  var assets = $.useref.assets({searchPath: '{.tmp, public}'});

  return gulp.src('public/**/*.html')
    .pipe(assets)
    .pipe($.if('*.js', $.ngAnnotate()))
    .pipe($.if('*.js', $.uglify()))
    .pipe($.if('*.css', cssChannel()))
    .pipe(assets.restore())
    .pipe($.useref())
    .pipe($.if('*.html', $.minifyHtml({conditionals: true, loose: true})))
    .pipe(gulp.dest('.tmp/'));
});

// gulp.task('fonts', function() {
//   return gulp.src(require('main-bower-files')().concat('public/fonts/**/*')
//     .concat('public/scripts/lib/bootstrap/fonts/*'))
//     .pipe($.filter('**/*.{eot,svg,ttf,woff,woff2}'))
//     .pipe($.flatten())
//     .pipe(gulp.dest('.tmp/fonts'));
// });

gulp.task('clean', function() {
  return gulp.src('.tmp/', {read: false})
      .pipe(clean());
});

gulp.task('test', function(done) {
  karma.start({
    configFile: __dirname + '/test/karma.conf.js',
    singleRun: true
  }, done);
});

// inject bower components
gulp.task('wiredep', function() {
  var wiredep = require('wiredep').stream;
  var exclude = [
    'bootstrap',
    'jquery',
    'es5-shim',
    'json3',
    'angular-scenario'
  ];

  gulp.src('public/styles/*.less')
    .pipe(wiredep())
    .pipe(gulp.dest('public/styles'));

  gulp.src('public/*.html')
    .pipe(wiredep({exclude: exclude}))
    .pipe(gulp.dest('public'));

  gulp.src('test/*.js')
    .pipe(wiredep({exclude: exclude, devDependencies: true}))
    .pipe(gulp.dest('test'));
});

gulp.task('build', function(done) {
  runSequence(['clean', 'jshint', /*'jscs',*/ 'html', 'styles'], function() {
    done();
  });
})
