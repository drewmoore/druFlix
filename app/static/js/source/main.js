(function(){

  'use strict';

  $(document).ready(initialize);

  function initialize(){
    $(document).foundation();
    //$('#add-movie-form').submit(submitMovie);
  }

  /*
  function submitMovie(event){
    var addMovieForm = $('#add-movie-form');
    var title = addMovieForm.find($('input[name=title]')).val();
    var directors = addMovieForm.find($('input[name=directors]')).val().split(', ');
    var releaseYear = addMovieForm.find($('input[name=releaseYear]')).val();
    var videoFile = addMovieForm.find($('input[name=videoFile]')).val();
    var coverFile = addMovieForm.find($('input[name=coverFile]')).val();
    var type = 'movie';
    var series = {
      title: title,
      directors: directors,
      releaseYear: releaseYear,
      type: type
    };
    var episode = {
      seriesTitle: title,
      title: title,
      season: 0,
      episodeNo: 0,
      type: type
    };
    var url = window.location.origin + '/series/create';
    var success = movieSubmitted;
    var ajaxType = 'POST';
    var data = {series:series, episode:episode, coverFile:coverFile, videoFile:videoFile};

    $.ajax({url:url, type:ajaxType, success:success, data:data});

    event.preventDefault();
    console.log('submitMovie: ', title, directors, releaseYear, videoFile, coverFile, type, series, episode);
  }

  function movieSubmitted(data){
    console.log('movieSubmitted: ', data);
  }

  */

})();

