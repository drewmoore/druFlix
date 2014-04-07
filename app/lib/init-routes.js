'use strict';

var d = require('../lib/request-debug');
var initialized = false;

module.exports = function(req, res, next){
  if(!initialized){
    initialized = true;
    load(req.app, next);
  }else{
    next();
  }
};

function load(app, fn){
  var home = require('../routes/home');
  var user = require('../routes/user');
  var series = require('../routes/series');
  var episodes = require('../routes/episodes');

  app.get('/', d, home.index);
  app.get('/auth', d, user.auth);
  app.get('/user/profile', d, user.profile);
  app.get('/series/show/:id', d, series.show);
  app.get('/series/create', d, series.createPage);
  app.get('/series/index', d, series.index);
  app.get('/episodes/create/:id', d, episodes.createPage);
  app.get('/episodes/watch/:id', d, episodes.watch);
  app.post('/register', d, user.register);
  app.post('/login', d, user.login);
  app.post('/logout', d, user.logout);
  app.post('/series/create', d, series.create);
  app.post('/episodes/create', d, episodes.create);
  console.log('Routes Loaded');
  fn();
}

