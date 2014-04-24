'use strict';

var Series = require('../models/series');
var _ = require('lodash');

exports.index = function(req, res){
  Series.index(function(records){
    var covers = [];
    if(records.length > 0){
      _.each(records, function(series){
        covers.push(series.cover);
      });
      res.render('home/index', {title: 'druFlix', covers:covers});
    } else {
      res.render('home/index', {title: 'druFlix', covers:covers});
    }
  });
};

