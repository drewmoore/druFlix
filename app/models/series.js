'use strict';

module.exports = Series;

var path = require('path');
var fs = require('fs');
var serieses = global.nss.db.collection('serieses');
var Mongo = require('mongodb');

function Series(series){
  this.title = series.title;
  this.directors = series.directors;
  this.releaseYear = series.releaseYear;
  this.userId = series.userId;
  this.userName = series.userName;
  this.seasons = parseInt(series.seasons || 0);
  this.episodes = [];
  this.movie = '';
  this.type = series.type || '';

}

Series.prototype.addCover = function(oldname, fn){
  var self = this;
  var extension = path.extname(oldname);
  var title = this.title.replace(/\s/g, '-').toLowerCase();
  var absolutePath = __dirname + '/../static';
  var coversPath = absolutePath + '/img/covers';
  var relativePath = '/img/covers/' + title + '-' + this.releaseYear + extension;

  fs.mkdir(coversPath, function(){
    fs.rename(oldname, absolutePath + relativePath, function(err){
      self.cover = relativePath;
      fn(err);
    });
  });
};

Series.prototype.insert = function(fn){
  var self = this;
  serieses.find({title:self.title, releaseYear:self.releaseYear}).toArray(function(err, foundEntries){
    if(foundEntries.length === 0){
      serieses.insert(self, function(err, records){
        fn(err, records);
      });
    } else {
      fn('That show/movie already exists, yo! Try again...');
    }
  });
};

Series.prototype.addSeason = function(){
  this.seasons ++;
};

Series.findById = function(id, fn){
  var mongoId = new Mongo.ObjectID(id);
  serieses.findOne({_id:mongoId}, function(err, record){
    fn(record);
  });
};

Series.findByUserId = function(id, fn){
  var mongoId = new Mongo.ObjectID(id);
  serieses.find({userId:mongoId}).toArray(function(err, records){
    fn(records);
  });
};

Series.findByTitle = function(title, fn){
  serieses.find({title:title}).toArray(function(err, records){
    fn(records);
  });
};

Series.findByDirector = function(director, fn){
  serieses.find({directors:director}).toArray(function(err, records){
    fn(records);
  });
};

Series.prototype.update = function(fn){
  var self = this;
  serieses.update({_id:self._id}, self, function(err, count){
    Series.findById(self._id.toString(), function(record){
      fn(record);
    });
  });
};

Series.prototype.addEpisode = function(episode){
  this.episodes.push(episode);
};

Series.prototype.addMovie = function(movieId){
  this.movie = movieId;
};

Series.index = function(fn){
  serieses.find().toArray(function(err, records){
    fn(records);
  });
};

















