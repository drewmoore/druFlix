'use strict';

var Series = require('../models/series');
var User = require('../models/user');
var Episode = require('../models/episode');
var _ = require('lodash');

exports.createPage = function(req, res){
  res.render('series/create', {title:'Add a New Movie or TV Show'});
};

exports.create = function(req, res){
  var series = req.body.series || {
    title: req.body.title,
    directors: req.body.directors,
    releaseYear: req.body.releaseYear,
    type: req.body.type,
    seasons: req.body.seasons
  };
  var episode = req.body.episode || {
    seriesTitle: req.body.title,
    title: req.body.episodeTitle || req.body.title,
    season: req.body.episodeSeason || req.body.season,
    episodeNo: req.body.episodeEpisodeNo || req.body.episodeNo,
    type: req.body.episodeType || req.body.type
  };

  var coverFile = req.body.coverFile || req.files.coverFile.path;
  var videoFile = req.body.videoFile || req.files.videoFile.path;
  var userIdString = req.session.userId.toString();

  User.findById(userIdString, function(user){
    series.userId = user._id;
    series.userName = user.name;
    episode.userId = user._id;
    episode.userName = user.name;

    var s1 = new Series(series);
    var e1 = new Episode(episode);

    s1.addCover(coverFile, function(){
      s1.insert(function(err, seriesRecords){
        if(typeof err === 'string'){
          res.render('series/create', {title:'Add a Series/Movie', err:err});
        } else {
          e1.seriesId = s1._id;
          e1.insert(function(err, episodeRecords){
            user.__proto__ = User.prototype;
            user.addSeries(s1._id);
            user.addEpisode(e1._id);
            e1.addVideo(videoFile, function(){
              if(s1.type === 'tv'){
                s1.addEpisode(e1);
              } else {
                if(s1.type === 'movie'){
                  s1.addMovie(e1._id);
                }
              }
              s1.update(function(seriesRecord){
                e1.update(function(episodeRecord){
                  user.update(function(userRecord){
                    res.redirect('/series/index');
                  });
                });
              });
            });
          });
        }
      });
    });
  });
};

exports.show = function(req, res){
  var seriesId = req.params.id;
  Series.findById(seriesId, function(series){

    series.episodes.sort(function(a, b){
      return 2 * (a.season > b.season ? 1 : a.season < b.season ? -1 : 0) + 1 * (a.episodeNo > b.episodeNo ? 1 : a.episodeNo < b.episodeNo ? -1 : 0);
    });

    res.render('series/show', series);
  });
};

exports.index = function(req, res){
  Series.index(function(records){
    var serieses = [];
    _.each(records, function(record){
      var series = {_id:record._id, cover:record.cover, title:record.title};
      serieses.push(series);
    });
    res.render('series/index', {title:'All Movies and Shows', serieses:serieses});
  });
};

