'use strict';

process.env.DBNAME = 'druFlix-test';
var expect = require('chai').expect;
var fs = require('fs');
var exec = require('child_process').exec;
var Mongo = require('mongodb');
var Series;
var User;
var Episode;

describe('Series', function(){
  this.timeout(10000);
  before(function(done){
    var initMongo = require('../../app/lib/init-mongo');
    initMongo.db(function(){
      Series = require('../../app/models/series');
      User = require('../../app/models/user');
      Episode = require('../../app/models/episode');
      done();
    });
  });

  beforeEach(function(done){
    var testdir = __dirname + '/../../app/static/img/covers';
    var cmd = 'rm -rf ' + testdir;
    exec(cmd, function(){
      var origfile = __dirname + '/../fixtures/test.jpg';
      var copyfile = __dirname + '/../fixtures/test-copy.jpg';
      fs.createReadStream(origfile).pipe(fs.createWriteStream(copyfile));

      global.nss.db.dropDatabase(function(err, result){
        done();
      });
    });
  });

  describe('new', function(){
    it('should create a new Series object', function(done){
      var u1 = new User({email:'seriestest@nomail.com', name:'seriesTest', password:'1234'});
      u1.register(function(err, body){
        var s1 = new Series({title:'Game of Thrones', directors:['some dude', 'some chick'],
          releaseYear:'2011', userId:u1._id, userName:u1.name});
        expect(s1).to.be.instanceof(Series);
        expect(s1.title).to.equal('Game of Thrones');
        expect(s1.directors).to.have.length(2);
        expect(s1.releaseYear).to.equal('2011');
        expect(s1.userName).to.equal(u1.name);
        expect(s1.userId).to.equal(u1._id);
        done();
      });
    });
  });

  describe('addCover', function(){
    it('should add a cover photo', function(done){
      var oldname = __dirname + '/../fixtures/test-copy.jpg';
      var s1 = new Series({title:'Game of Thrones', directors:['some dude', 'some chick'],
        releaseYear:'2011'});
      s1.addCover(oldname, function(){
        expect(s1.cover).to.equal('/img/covers/game-of-thrones-2011.jpg');
        done();
      });
    });
  });

  describe('insert', function(){
    it('should add a new Series record to the database', function(done){
      var oldname = __dirname + '/../fixtures/test-copy.jpg';
      var u1 = new User({email:'seriestest@nomail.com', name:'seriesTest', password:'1234'});
      u1.register(function(err, body){
        var s1 = new Series({title:'Game of Thrones', directors:['some dude', 'some chick'],
          releaseYear:'2011', userId:u1._id, userName:u1.name});
        s1.addCover(oldname, function(){
          s1.insert(function(err, records){
            expect(s1._id).to.be.instanceof(Mongo.ObjectID);
            expect(records[0].title).to.equal(s1.title);
            done();
          });
        });
      });
    });

    it('should not add a duplicate Series to the database', function(done){
      var oldname = __dirname + '/../fixtures/test-copy.jpg';
      var u1 = new User({email:'seriestest@nomail.com', name:'seriesTest', password:'1234'});
      u1.register(function(err, body){
        var s1 = new Series({title:'Game of Thrones', directors:['some dude', 'some chick'],
          releaseYear:'2011', userId:u1._id, userName:u1.name});
        s1.addCover(oldname, function(){
          s1.insert(function(err, records){
            var s2 = new Series({title:'Game of Thrones', directors:['some other dude', 'some other chick'],
              releaseYear:'2011'});
            s2.insert(function(err, records){
              expect(typeof err).to.equal('string');
              done();
            });
          });
        });
      });
    });
  });

  describe('findById', function(){
    it('should find a Series by its Id', function(done){
      var s1 = new Series({title:'Game of Thrones', directors:['some dude', 'some chick'],
        releaseYear:'2011'});
      s1.insert(function(err, records){
        var id = (s1._id).toString();
        Series.findById(id, function(record){
          expect(record._id).to.deep.equal(s1._id);
          done();
        });
      });
    });
  });

  describe('findByTitle', function(){
    it('should find a series by its title', function(done){
      var s1 = new Series({title:'Game of Thrones', directors:['some dude', 'some chick'],
        releaseYear:'2011'});
      s1.insert(function(err, records){
        Series.findByTitle(s1.title, function(records){
          expect(records).to.have.length(1);
          expect(records[0].releaseYear).to.equal('2011');
          done();
        });
      });
    });
  });

  describe('findByDirector', function(){
    it('should find a series by its director(s)', function(done){
      var s1 = new Series({title:'Game of Thrones', directors:['some dude', 'some chick'],
        releaseYear:'2011'});
      var s2 = new Series({title:'Breaking Bad', directors:['whatshisname', 'some chick'],
        releaseYear:'2008'});
      s1.insert(function(err, records){
        s2.insert(function(err, records2){
          Series.findByDirector(s1.directors[0], function(records3){
            Series.findByDirector(s1.directors[1], function(records4){
              expect(records3.length).to.equal(1);
              expect(records3[0].releaseYear).to.equal('2011');
              expect(records4.length).to.equal(2);
              done();
            });
          });
        });
      });
    });
  });

  describe('findByUserId', function(){
    it('should find a series by its userId', function(done){
      var u1 = new User({email:'episodetestguy@nomail.com', name:'episode test guy', password:'1234'});
      u1.register(function(err, body){
        var s1 = new Series({title:'Game of Thrones', directors:['some dude', 'some chick'],
          releaseYear:'2011', userId:u1._id, userName:u1.name});
        s1.insert(function(err, records){
          var e1 = new Episode({season:1, episodeNo:1, seriesId:s1._id, seriesTitle:s1.title,
            userId:u1._id, userName:u1.name, title:'Winter is Coming'});
          e1.insert(function(err, records){
            var oldname = __dirname + '/../fixtures/test-copy.avi';
            e1.addVideo(oldname, function(){
              e1.update(function(result){
                var id = s1.userId.toString();
                Series.findByUserId(id, function(results){
                  expect(results.length).to.equal(1);
                  expect(results[0].title).to.equal('Game of Thrones');
                  done();
                });
              });
            });
          });
        });
      });
    });
  });

  describe('index', function(){
    it('should find and return all series', function(done){
      var s1 = new Series({title:'Game of Thrones', directors:['some dude', 'some chick'],
        releaseYear:'2011'});
      var s2 = new Series({title:'Breaking Bad', directors:['whatshisname', 'some chick'],
        releaseYear:'2008'});
      s1.insert(function(err, records){
        s2.insert(function(err, records2){
          Series.index(function(records3){
            expect(records3.length).to.equal(2);
            done();
          });
        });
      });
    });
  });

  describe('#update', function(){
    it('should update a Series info in the database', function(done){
      var s1 = new Series({title:'Game of Thrones', directors:['some dude', 'some chick'],
        releaseYear:'2011'});
      s1.insert(function(err, records){
        s1.directors = ['some other dude', 'some other chick'];
        s1.update(function(result){
          var id = (s1._id).toString();
          Series.findById(id, function(record){
            expect(record.directors).to.deep.equal(s1.directors);
            done();
          });
        });
      });
    });
  });

  describe('#addSeason', function(){
    it('should add a season to the Series number of total seasons', function(done){
      var s1 = new Series({title:'Game of Thrones', directors:['some dude', 'some chick'],
        releaseYear:'2011'});
      s1.insert(function(err, records){
        s1.addSeason();
        s1.update(function(result){
          var id = (s1._id).toString();
          Series.findById(id, function(record){
            expect(record.seasons).to.equal(1);
            done();
          });
        });
      });
    });
  });

  describe('#addEpisode', function(){
    it('should add an Episode to the Series episodes array', function(done){
      var u1 = new User({email:'episodetestguy@nomail.com', name:'episode test guy', password:'1234'});
      u1.register(function(err, body){
        var s1 = new Series({title:'Game of Thrones', directors:['some dude', 'some chick'],
          releaseYear:'2011', userId:u1._id, userName:u1.name});
        s1.insert(function(err, records){
          var e1 = new Episode({season:1, episodeNo:1, seriesId:s1._id, seriesTitle:s1.title,
            userId:u1._id, userName:u1.name, title:'Winter is Coming'});
          e1.insert(function(err, records){
            var oldname = __dirname + '/../fixtures/test-copy.avi';
            e1.addVideo(oldname, function(){
              e1.update(function(result){
                var id = e1._id.toString();
                Episode.findById(id, function(record){
                  s1.addEpisode(record);
                  expect(s1.episodes.length).to.equal(1);
                  expect(s1.episodes[0].title).to.equal(e1.title);
                  done();
                });
              });
            });
          });
        });
      });
    });
  });

  describe('#addMovie', function(){
    it('should add a movie Episode to a Series that is intended as a movie', function(done){
      var u1 = new User({email:'episodetestguy@nomail.com', name:'episode test guy', password:'1234'});
      u1.register(function(err, body){
        var s1 = new Series({title:'Idiocracy', directors:['Mike Judge'],
          releaseYear:'2004', userId:u1._id, userName:u1.name});
        s1.insert(function(err, records){
          var e1 = new Episode({season:0, episodeNo:0, seriesId:s1._id, seriesTitle:s1.title,
            userId:u1._id, userName:u1.name, title:'Idiocracy'});
          e1.insert(function(err, records){
            var oldname = __dirname + '/../fixtures/test-copy.avi';
            e1.addVideo(oldname, function(){
              e1.update(function(result){
                var id = e1._id.toString();
                Episode.findById(id, function(record){
                  s1.addMovie(record._id);
                  expect(s1.movie).to.deep.equal(e1._id);
                  done();
                });
              });
            });
          });
        });
      });
    });
  });

});
