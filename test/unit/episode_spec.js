'use strict';

process.env.DBNAME = 'druFlix-test';
var expect = require('chai').expect;
var Episode;
var Series;
var User;
var Mongo = require('mongodb');
var exec = require('child_process').exec;
var fs = require('fs');

describe('Episode', function(){
  this.timeout(10000);
  before(function(done){
    var initMongo = require('../../app/lib/init-mongo');
    initMongo.db(function(){
      Episode = require('../../app/models/episode');
      Series = require('../../app/models/series');
      User = require('../../app/models/user');
      done();
    });
  });

  beforeEach(function(done){
    var testdir = __dirname + '/../../app/static/videos/episodes';
    var cmd = 'rm -rf ' + testdir;
    exec(cmd, function(){
      var origfile = __dirname + '/../fixtures/test.avi';
      var copyfile = __dirname + '/../fixtures/test-copy.avi';
      fs.createReadStream(origfile).pipe(fs.createWriteStream(copyfile));

      global.nss.db.dropDatabase(function(err, result){
        done();
      });
    });
  });

  describe('new', function(){
    it('should create a new Episode object', function(done){
      var u1 = new User({email:'episodetestguy@nomail.com', name:'episode test guy', password:'1234'});
      u1.register(function(err, body){
        var s1 = new Series({title:'Game of Thrones', directors:['some dude', 'some chick'],
          releaseYear:'2011', userId:u1._id, userName:u1.name});
        s1.insert(function(err, records){
          var e1 = new Episode({season:1, episodeNo:1, seriesId:s1._id, seriesTitle:s1.title,
            userId:u1._id, userName:u1.name, title:'Winter is Coming'});
          expect(e1).to.be.instanceof(Episode);
          expect(e1.seriesId).to.be.instanceof(Mongo.ObjectID);
          expect(e1.userId).to.be.instanceof(Mongo.ObjectID);
          expect(e1.seriesTitle).to.equal('Game of Thrones');
          expect(e1.userName).to.equal('episode test guy');
          done();
        });
      });
    });
  });

  describe('#insert', function(){
    it('should insert a new Episode into database', function(done){
      var u1 = new User({email:'episodetestguy@nomail.com', name:'episode test guy', password:'1234'});
      u1.register(function(err, body){
        var s1 = new Series({title:'Game of Thrones', directors:['some dude', 'some chick'],
          releaseYear:'2011', userId:u1._id, userName:u1.name});
        s1.insert(function(err, records){
          var e1 = new Episode({season:1, episodeNo:1, seriesId:s1._id, seriesTitle:s1.title,
            userId:u1._id, userName:u1.name, title:'Winter is Coming'});
          e1.insert(function(err, records){
            expect(e1._id).to.be.instanceof(Mongo.ObjectID);
            expect(records[0].title).to.equal(e1.title);
            done();
          });
        });
      });
    });

    it('should not insert a duplicate Episode into database', function(done){
      var u1 = new User({email:'episodetestguy@nomail.com', name:'episode test guy', password:'1234'});
      u1.register(function(err, body){
        var s1 = new Series({title:'Game of Thrones', directors:['some dude', 'some chick'],
          releaseYear:'2011', userId:u1._id, userName:u1.name});
        s1.insert(function(err, records){
          var e1 = new Episode({season:1, episodeNo:1, seriesId:s1._id, seriesTitle:s1.title,
            userId:u1._id, userName:u1.name, title:'Winter is Coming'});
          e1.insert(function(err, records){
            var e2 = new Episode({season:1, episodeNo:1, seriesId:s1._id, seriesTitle:s1.title,
              userId:u1._id, userName:u1.name, title:'Winter is Coming'});
            e2.insert(function(err, records){
              expect(typeof err).to.equal('string');
              done();
            });
          });
        });
      });
    });
  });

  describe('#addVideo', function(){
    it('should add a video filepath to the Episode', function(done){
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
              expect(e1.filePath).to.equal('/videos/episodes/' + e1._id.toString() + '.avi');
              expect(e1.fileType).to.equal('.avi');
              done();
            });
          });
        });
      });
    });
  });

  describe('findById', function(){
    it('should find Episode by id', function(done){
      var u1 = new User({email:'episodetestguy@nomail.com', name:'episode test guy', password:'1234'});
      u1.register(function(err, body){
        var s1 = new Series({title:'Game of Thrones', directors:['some dude', 'some chick'],
          releaseYear:'2011', userId:u1._id, userName:u1.name});
        s1.insert(function(err, records){
          var e1 = new Episode({season:1, episodeNo:1, seriesId:s1._id, seriesTitle:s1.title,
            userId:u1._id, userName:u1.name, title:'Winter is Coming'});
          e1.insert(function(err, records){
            var id = e1._id.toString();
            Episode.findById(id, function(record){
              expect(record._id).to.deep.equal(e1._id);
              expect(record.title).to.equal(e1.title);
              done();
            });
          });
        });
      });
    });
  });

  describe('findBySeriesId', function(){
    it('should find Episodes by Series id', function(done){
      var u1 = new User({email:'episodetestguy@nomail.com', name:'episode test guy', password:'1234'});
      u1.register(function(err, body){
        var s1 = new Series({title:'Game of Thrones', directors:['some dude', 'some chick'],
          releaseYear:'2011', userId:u1._id, userName:u1.name});
        s1.insert(function(err, records){
          var e1 = new Episode({season:1, episodeNo:1, seriesId:s1._id, seriesTitle:s1.title,
            userId:u1._id, userName:u1.name, title:'Winter is Coming'});
          e1.insert(function(err, records){
            var id = s1._id.toString();
            Episode.findBySeriesId(id, function(records){
              expect(records[0]._id).to.deep.equal(e1._id);
              expect(records[0].title).to.equal(e1.title);
              done();
            });
          });
        });
      });
    });
  });

  describe('findBySeriesTitle', function(){
    it('should find Episodes by Series title', function(done){
      var u1 = new User({email:'episodetestguy@nomail.com', name:'episode test guy', password:'1234'});
      u1.register(function(err, body){
        var s1 = new Series({title:'Game of Thrones', directors:['some dude', 'some chick'],
          releaseYear:'2011', userId:u1._id, userName:u1.name});
        s1.insert(function(err, records){
          var e1 = new Episode({season:1, episodeNo:1, seriesId:s1._id, seriesTitle:s1.title,
            userId:u1._id, userName:u1.name, title:'Winter is Coming'});
          e1.insert(function(err, records){
            var title = s1.title;
            Episode.findBySeriesTitle(title, function(records){
              expect(records[0]._id).to.deep.equal(e1._id);
              expect(records[0].title).to.equal(e1.title);
              done();
            });
          });
        });
      });
    });
  });

  describe('findByUserId', function(){
    it('should find an Episode by its userId', function(done){
      var u1 = new User({email:'episodetestguy@nomail.com', name:'episode test guy', password:'1234'});
      u1.register(function(err, body){
        var s1 = new Series({title:'Game of Thrones', directors:['some dude', 'some chick'],
          releaseYear:'2011', userId:u1._id, userName:u1.name});
        s1.insert(function(err, records){
          var e1 = new Episode({season:1, episodeNo:1, seriesId:s1._id, seriesTitle:s1.title,
            userId:u1._id, userName:u1.name, title:'Winter is Coming'});
          e1.insert(function(err, records){
            var id = u1._id.toString();
            Episode.findByUserId(id, function(episodesFound){
              expect(episodesFound).to.have.length(1);
              expect(episodesFound[0].title).to.equal('Winter is Coming');
              done();
            });
          });
        });
      });
    });
  });

  describe('findBySeason', function(){
    it('should find Episodes by the Season of a Series', function(done){
      var u1 = new User({email:'episodetestguy@nomail.com', name:'episode test guy', password:'1234'});
      u1.register(function(err, body){
        var s1 = new Series({title:'Game of Thrones', directors:['some dude', 'some chick'],
          releaseYear:'2011', userId:u1._id, userName:u1.name});
        s1.insert(function(err, records){
          var e1 = new Episode({season:1, episodeNo:1, seriesId:s1._id, seriesTitle:s1.title,
            userId:u1._id, userName:u1.name, title:'Winter is Coming'});
          var e2 = new Episode({season:1, episodeNo:2, seriesId:s1._id, seriesTitle:s1.title,
            userId:u1._id, userName:u1.name, title:'The Pointy End'});
          var e3 = new Episode({season:2, episodeNo:1, seriesId:s1._id, seriesTitle:s1.title,
            userId:u1._id, userName:u1.name, title:'Blackwater Bay'});
          e1.insert(function(err, records){
            e2.insert(function(err, records){
              e3.insert(function(err, records){
                var id = s1._id.toString();
                var seasonNo = 1;
                Episode.findBySeason(id, seasonNo, function(records){
                  expect(records.length).to.equal(2);
                  done();
                });
              });
            });
          });
        });
      });
    });
  });

  describe('#update', function(){
    it('should update an Episode in the database', function(done){
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
              e1.season = 2;
              e1.update(function(result){
                var id = e1._id.toString();
                Episode.findById(id, function(record){
                  expect(record.filePath).to.equal('/videos/episodes/' + e1._id.toString() + '.avi');
                  expect(record.season).to.equal(2);
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
