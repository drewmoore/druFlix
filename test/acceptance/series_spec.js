'use strict';

process.env.DBNAME = 'druFlix-acceptance-test';
var app = require('../../app/app');
var request = require('supertest');
var expect = require('chai').expect;
var fs = require('fs');
var exec = require('child_process').exec;
var Series;
var User;
var Episode;
var u1;
var cookie;

describe('series', function(){
  this.timeout(10000);
  before(function(done){
    request(app)
    .get('/')
    .end(function(err, res){
      Series = require('../../app/models/series');
      User = require('../../app/models/user');
      Episode = require('../../app/models/episode');
      done();
    });
  });

  beforeEach(function(done){
    var testdir = __dirname + '/../../app/static/img/covers';
    var testdir2 = __dirname + '/../../app/static/videos/episodes';
    var cmd = 'rm -rf ' + testdir;
    var cmd2 = 'rm -rf ' + testdir2;
    exec(cmd, function(){
      var origfile = __dirname + '/../fixtures/test.jpg';
      var copyfile = __dirname + '/../fixtures/test-copy.jpg';
      fs.createReadStream(origfile).pipe(fs.createWriteStream(copyfile));

      exec(cmd2, function(){
        var origfile2 = __dirname + '/../fixtures/test.avi';
        var copyfile2 = __dirname + '/../fixtures/test-copy.avi';
        fs.createReadStream(origfile2).pipe(fs.createWriteStream(copyfile2));
        global.nss.db.dropDatabase(function(err, result){
          u1 = new User({email:'seriesacceptance@nomail.com', name:'series Accept guy', password:'1234'});
          u1.register(function(err, inserted){
            request(app)
            .post('/login')
            .field('email', 'seriesacceptance@nomail.com')
            .field('password', '1234')
            .end(function(err, res){
              cookie = res.headers['set-cookie'];

              var coverFile = __dirname + '/../fixtures/test-copy.jpg';
              var videoFile = __dirname + '/../fixtures/test-copy.avi';
              var series = {
                title:'South Park',
                directors: ['Trey Parker', 'Matt Stone'],
                releaseYear: '1998',
                seasons: 16,
                type: 'tv'
              };
              var episode = {
                seriesTitle: 'South Park',
                title: 'Chicken Pox',
                season: 2,
                episodeNo: 3,
                type: 'tv'
              };
              request(app)
              .post('/series/create')
              .set('cookie', cookie)
              .send({series:series, episode:episode, coverFile:coverFile, videoFile:videoFile})
              .end(function(err, res){

                var coverFile = __dirname + '/../fixtures/test-copy.jpg';
                var videoFile = __dirname + '/../fixtures/test-copy.avi';
                var series = {
                  title:'Fight Club',
                  directors: ['David Fincher'],
                  releaseYear: '1999',
                  seasons: 0,
                  type: 'movie'
                };
                var episode = {
                  seriesTitle: 'Fight Club',
                  title: 'Fight Club',
                  season: 0,
                  episodeNo: 0,
                  type: 'movie'
                };
                request(app)
                .post('/series/create')
                .set('cookie', cookie)
                .send({series:series, episode:episode, coverFile:coverFile, videoFile:videoFile})
                .end(function(err, res){
                  done();
                });
              });
            });
          });
        });
      });
    });
  });

  describe('create tv', function(){
    it('should create a new tv Series object, add to DB', function(done){
      var coverFile = __dirname + '/../fixtures/test-copy.jpg';
      var videoFile = __dirname + '/../fixtures/test-copy.avi';
      var series = {
        title:'Game of Thrones',
        directors: ['R.R. Martin', 'some badass'],
        releaseYear: '2011',
        seasons: 3,
        type: 'tv'
      };
      var episode = {
        seriesTitle: 'Game of Thrones',
        title: 'Winter is Coming',
        season: 1,
        episodeNo: 1,
        type: 'tv'
      };
      request(app)
      .post('/series/create')
      .set('cookie', cookie)
      .send({series:series, episode:episode, coverFile:coverFile, videoFile:videoFile})
      .end(function(err, res){
        expect(res.status).to.equal(302);
        done();
      });
    });

  });

  describe('create movie', function(){
    it('should create a new movie Series object, add to DB', function(done){
      var coverFile = __dirname + '/../fixtures/test-copy.jpg';
      var videoFile = __dirname + '/../fixtures/test-copy.avi';
      var series = {
        title:'Idiocracy',
        directors: ['Mike Juge'],
        releaseYear: '2004',
        seasons: 0,
        type: 'movie'
      };
      var episode = {
        seriesTitle: 'Idiocracy',
        title: 'Idiocracy',
        season: 0,
        episodeNo: 0,
        type: 'movie'
      };
      request(app)
      .post('/series/create')
      .set('cookie', cookie)
      .send({series:series, episode:episode, coverFile:coverFile, videoFile:videoFile})
      .end(function(err, res){
        expect(res.status).to.equal(302);
        done();
      });
    });
  });


  describe('create, no duplicates', function(){
    it('should not create a new tv series, no duplicates', function(done){
      var coverFile = __dirname + '/../fixtures/test-copy.jpg';
      var videoFile = __dirname + '/../fixtures/test-copy.avi';
      var series = {
        title:'South Park',
        directors: ['Trey Parker', 'Matt Stone'],
        releaseYear: '1998',
        seasons: 16,
        type: 'tv'
      };
      var episode = {
        seriesTitle: 'South Park',
        title: 'Chicken Pox',
        season: 2,
        episodeNo: 3,
        type: 'tv'
      };
      request(app)
      .post('/series/create')
      .set('cookie', cookie)
      .send({series:series, episode:episode, coverFile:coverFile, videoFile:videoFile})
      .end(function(err, res){
        //expect(res.text).to.include('already');
        expect(res.status).to.equal(200);
        done();
      });
    });
  });

  describe('GET series/create page', function(){
    it('should render the page for creating a new series/movie', function(done){
      request(app)
      .get('/series/create')
      .end(function(err, res){
        expect(res.status).to.equal(200);
        done();
      });
    });
  });

  describe('show', function(){
    it('should GET the series show page', function(done){
      Series.findByTitle('South Park', function(seriesFound){
        console.log('SERIES ACCEPTANCE GET SHOW PAGE: ', seriesFound);
        request(app)
        .get('/series/show/' + seriesFound[0]._id.toString())
        .end(function(err, res){
          expect(res.status).to.equal(200);
          expect(res.text).to.include('South Park');
          expect(res.text).to.include('Trey Parker');
          done();
        });
      });
    });
  });

  describe('index', function(){
    it('should GET the page that shows all movies and shows', function(done){
      request(app)
      .get('/series/index')
      .end(function(err, res){
        expect(res.status).to.equal(200);
        expect(res.text).to.include('South Park');
        expect(res.text).to.include('Fight Club');
        done();
      });
    });
  });

});

