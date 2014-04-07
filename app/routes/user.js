'use strict';

var User = require('../models/user');
var Series = require('../models/series');
var Episode = require('../models/episode');

exports.auth = function(req, res){
  res.render('users/auth', {title: 'Registration/Login'});
};

exports.register = function(req, res){
  var user = new User(req.body);
  user.register(function(err, inserted){
    if(inserted){
      res.redirect('/series/index');
    } else {
      res.render('users/auth', {title:'Registration/Login', err: err});
    }
  });
};

exports.login = function(req, res){
  User.findByEmailAndPassword(req.body.email, req.body.password, function(err, user){
    if(user){
      req.session.regenerate(function(){
        req.session.userId = user._id.toString();
        req.session.save(function(){
          res.redirect('/series/index');
        });
      });
    } else {
      req.session.destroy(function(){
        res.render('users/auth', {title: 'Registration/Login', err: err});
      });
    }
  });
};

exports.logout = function(req, res){
  console.log('USER EXPORTS LOGOUT CALLED: ');
  req.session.destroy(function(){
    res.redirect('/');
  });
};

exports.profile = function(req, res){
  // Can add more functionality:
  // can render queue and favorites, once the routes for adding those
  // are in place
  var id = req.session.userId;
  User.findById(id, function(user){
    Series.findByUserId(id, function(seriesesFound){
      Episode.findByUserId(id, function(episodesFound){
        res.render('users/profile', {title:user.name, serieses:seriesesFound,
          episodes:episodesFound, favorites:user.favorites, queue:user.queue});
      });
    });
  });
};
