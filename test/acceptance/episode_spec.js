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

describe('episodes', function(){
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

  describe('GET episode create', function(){
    it('should get the page for creating an episode', function(done){
      Series.findByTitle('South Park', function(records){
        request(app)
        .get('/episodes/create/' + records[0]._id.toString())
        .end(function(err, res){
          expect(res.status).to.equal(200);
          expect(res.text).to.include('South Park');
          done();
        });
      });
    });
  });

  describe('POST Episode', function(){
    it('should create a new episode', function(done){
      var videoFile = __dirname + '/../fixtures/test-copy.avi';
      Series.findByTitle('South Park', function(records){
        var series = records[0];
        var episode = {
          seriesTitle: series.title,
          seriesId: series._id,
          title: 'Cow Days',
          season: 2,
          episodeNo: 4,
          type: 'tv'
        };

        request(app)
        .post('/episodes/create')
        .set('cookie', cookie)
        .send({episode:episode, videoFile:videoFile})
        .end(function(err, res){
          expect(res.status).to.equal(302);
          done();
        });
      });

    });

    it('should not create a duplicate episode', function(done){
      var videoFile = __dirname + '/../fixtures/test-copy.avi';
      Series.findByTitle('South Park', function(records){
        var series = records[0];
        var episode = {
          seriesTitle: series.title,
          seriesId: series._id,
          title: 'Chicken Pox',
          season: 2,
          episodeNo: 3,
          type: 'tv'
        };

        request(app)
        .post('/episodes/create')
        .set('cookie', cookie)
        .send({episode:episode, videoFile:videoFile})
        .end(function(err, res){
          expect(res.status).to.equal(200);
          expect(res.text).to.include('already in');
          done();
        });
      });
    });

    it('should not add another episode to a movie', function(done){
      var videoFile = __dirname + '/../fixtures/test-copy.avi';
      Series.findByTitle('Fight Club', function(records){
        var series = records[0];
        var episode = {
          seriesTitle: series.title,
          seriesId: series._id,
          title: 'Fight Club',
          season: 1,
          episodeNo: 2,
          type: 'movie'
        };

        request(app)
        .post('/episodes/create')
        .set('cookie', cookie)
        .send({episode:episode, videoFile:videoFile})
        .end(function(err, res){
          expect(res.status).to.equal(200);
          expect(res.text).to.include('have episodes');
          done();
        });
      });
    });
  });

  describe('watch', function(){
    it('should display page for watching a tv episode', function(done){
      Episode.findBySeriesTitle('South Park', function(episodes){
        var episode = episodes[0];
        request(app)
        .get('/episodes/watch/' + episode._id.toString())
        .end(function(err, res){
          expect(res.status).to.equal(200);
          expect(res.text).to.include(episode.filePath);
          done();
        });
      });
    });

    it('should display page for watching a movie', function(done){
      Episode.findBySeriesTitle('Fight Club', function(episodes){
        var episode = episodes[0];
        request(app)
        .get('/episodes/watch/' + episode._id.toString())
        .end(function(err, res){
          expect(res.status).to.equal(200);
          expect(res.text).to.include(episode.filePath);
          done();
        });
      });
    });
  });

});
















