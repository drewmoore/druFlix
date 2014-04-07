'use strict';

var Series = require('../models/series');
var User = require('../models/user');
var Episode = require('../models/episode');
var Mongo = require('mongodb');
//var fs = require('fs');

exports.createPage = function(req, res){
  var seriesIdString = req.params.id;
  Series.findById(seriesIdString, function(series){
    res.render('episodes/create', {title:'Add a New Episode', series:series});
  });
};

exports.create = function(req, res){

  var episode = req.body.episode || {
    seriesId: req.body.episodeSeriesId,
    seriesTitle: req.body.episodeSeriesTitle,
    title: (req.body.episodeTitle || ''),
    season: req.body.episodeSeason,
    episodeNo: req.body.episodeEpisodeNo,
    type: req.body.episodeType
  };

  if(req.body.episodeSeriesId){
    episode.seriesId = new Mongo.ObjectID(req.body.episodeSeriesId);
  }

  var videoFile = req.body.videoFile || req.files.videoFile.path;

  var userIdString = req.session.userId.toString();
  var seriesIdString;
  if(req.body.episode){
    seriesIdString = req.body.episode.seriesId.toString();
  } else {
    seriesIdString = req.body.episodeSeriesId.toString();
  }

  User.findById(userIdString, function(user){
    episode.userId = user._id;
    episode.userName = user.name;

    var e1 = new Episode(episode);
    e1.insert(function(err, episodeRecords){

      Series.findById(seriesIdString, function(series){

        // Check for duplicate episodes.
        if(typeof err === 'string'){
          res.render('episodes/create', {title:'Add a New Episode', series:series, err:err});
        } else {
          // Check to make sure movies aren't erroneously given multiple 'episodes'.
          if(e1.type === 'tv'){

            e1.addVideo(videoFile, function(){
              series.__proto__ = Series.prototype;
              series.addEpisode(e1);
              series.update(function(seriesRecord){
                e1.update(function(episodeRecord){
                  user.__proto__ = User.prototype;
                  user.update(function(userRecord){
                    res.redirect('series/show/' + seriesIdString);
                  });
                });
              });
            });

          } else {
            if(e1.type === 'movie'){
              res.render('episodes/create', {title:'Add a New Episode',
                series:series, err:'Movies don\'t have episodes, yo!'});
            }
          }
        }
      });
    });
  });
};

exports.watch = function(req, res){
  var episodeIdString = req.params.id;
  Episode.findById(episodeIdString, function(episode){

    console.log('EPISODE WATCH FOR MOVIE: ', episodeIdString);

    //fs.createReadStream(episode.filePath);

    res.render('episodes/watch', {title:episode.title, episode:episode});
  });
};






















