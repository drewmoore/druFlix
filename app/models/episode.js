'use strict';

var Episode;
var episodes = global.nss.db.collection('episodes');
var path = require('path');
var fs = require('fs');
var Mongo = require('mongodb');

module.exports = Episode;

function Episode(episode){
  this.seriesId = episode.seriesId;
  this.seriesTitle = episode.seriesTitle;
  this.title = episode.title || '';
  this.season = parseInt(episode.season);
  this.episodeNo = parseInt(episode.episodeNo);
  this.userId = episode.userId;
  this.userName = episode.userName;
  this.filePath = '';
  this.fileType = '';
  this.type = episode.type || '';
}

Episode.prototype.insert = function(fn){
  var self = this;
  if(typeof self.seriesId === 'string'){
    self.seriesId = new Mongo.ObjectID(self.seriesId);
  }

  episodes.find({seriesId:self.seriesId, season:self.season, episodeNo:self.episodeNo}).toArray(function(err, foundEntries){
    if(foundEntries.length === 0){
      episodes.insert(self, function(err, records){
        fn(err, records);
      });
    } else {
      fn('That one\'s already in here, yo!');
    }
  });
};

Episode.prototype.addVideo = function(oldname, fn){
  var self= this;
  var extension = path.extname(oldname);
  var id = this._id.toString();
  var absolutePath = __dirname + '/../static';
  var episodesPath = absolutePath + '/videos/episodes';
  var relativePath = '/videos/episodes/' + id + extension;

  fs.mkdir(episodesPath, function(){
    fs.rename(oldname, absolutePath + relativePath, function(err){

      console.log('EPISODE ADD VIDEO: ', err, oldname, absolutePath, relativePath);

      self.filePath = relativePath;
      self.fileType = extension;
      fn(err);
    });
  });
};

Episode.findById = function(id, fn){
  var mongoId = new Mongo.ObjectID(id);
  episodes.findOne({_id:mongoId}, function(err, record){
    fn(record);
  });
};

Episode.findBySeriesId = function(id, fn){
  var mongoId = new Mongo.ObjectID(id);
  episodes.find({seriesId:mongoId}).toArray(function(err, records){
    fn(records);
  });
};

Episode.findBySeriesTitle = function(title, fn){
  episodes.find({seriesTitle:title}).toArray(function(err, records){
    fn(records);
  });
};

Episode.findBySeason = function(id, seasonNo, fn){
  var mongoId = new Mongo.ObjectID(id);
  episodes.find({seriesId:mongoId, season:seasonNo}).toArray(function(err, records){
    fn(records);
  });
};

Episode.findByUserId = function(id,fn){
  var mongoId = new Mongo.ObjectID(id);
  episodes.find({userId:mongoId}).toArray(function(err, records){
    fn(records);
  });
};

Episode.prototype.update = function(fn){
  var self = this;
  episodes.update({_id:self._id}, self, function(err, count){
    Episode.findById(self._id.toString(), function(record){
      fn(record);
    });
  });
};














