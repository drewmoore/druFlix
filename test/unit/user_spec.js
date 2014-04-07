'use strict';

process.env.DBNAME = 'druFlix-test';
var expect = require('chai').expect;
var User;
var u1;
var Mongo = require('mongodb');
var Series;
var Episode;

describe('User', function(){
  this.timeout(10000);
  before(function(done){
    var initMongo = require('../../app/lib/init-mongo');
    initMongo.db(function(){
      User = require('../../app/models/user');
      Series = require('../../app/models/series');
      Episode = require('../../app/models/episode');
      done();
    });
  });

  beforeEach(function(done){
    global.nss.db.dropDatabase(function(err, result){
      u1 = new User({name:'Drew', email:'drew@nomail.com', password:'1234'});
      u1.register(function(err, body){
        done();
      });
    });
  });

  describe('new', function(){
    it('should create a new User object', function(){
      var u2 = new User({email:'test@noiseshift.com', name:'Bob', password: '1234'});
      expect(u2).to.be.instanceof(User);
      expect(u2.name).to.equal('Bob');
      expect(u2.email).to.equal('test@noiseshift.com');
      expect(u2.password).to.equal('1234');
    });
  });

  describe('register', function(){
    it('should register a new user into the database', function(done){
      var u2 = new User({email:'test@noiseshift.com', name:'Bob', password: '1234'});
      u2.register(function(err, body){
        expect(err).to.equal(null);
        expect(u1.password).to.not.equal('1234');
        expect(u1.password).to.have.length('60');
        expect(u1._id).to.be.instanceof(Mongo.ObjectID);
        /*
        // COMMENTED OUT TILL THE INTERNET WORKS!
        body = JSON.parse(body);
        if (body.id === undefined){
          console.log('MAILGUN ISSUE, YO!');
        }
        expect(typeof body.id).to.equal('string');
        */
        done();
      });
    });

    it('should not register a new user if a duplicate email is found', function(done){
      var u2 = new User({email:'drew@nomail.com', name:'Bob', password: '1234'});
      u2.register(function(err, body){
        expect(typeof err).to.equal('string');
        done();
      });
    });

    it('should not register a new user if a duplicate name is found', function(done){
      var u2 = new User({email:'nothing@nomail.com', name:'Drew', password: '1234'});
      u2.register(function(err, body){
        expect(typeof err).to.equal('string');
        done();
      });
    });
  });

  describe('findById', function(){
    it('should find a user by id', function(done){
      var u2 = new User({email:'nothing@nomail.com', name:'Bob', password: '1234'});
      u2.register(function(err, body){
        User.findById(u2._id.toString(), function(record){
          expect(record.name).to.equal('Bob');
          done();
        });
      });
    });
  });

  describe('findByName', function(){
    it('should find a user by name', function(done){
      var u2 = new User({email:'nothing@nomail.com', name:'Bob', password: '1234'});
      u2.register(function(err, body){
        User.findByName(u2.name, function(record){
          expect(record.email).to.equal('nothing@nomail.com');
          done();
        });
      });
    });
  });

  describe('findByEmailAndPassword', function(){
    it('should find a user by email and password for login purposes', function(done){
      var u2 = new User({email:'nothing@nomail.com', name:'Bob', password: '1234'});
      u2.register(function(err, body){
        User.findByEmailAndPassword(u2.email, '1234', function(err, record){
          expect(record.email).to.equal('nothing@nomail.com');
          expect(record.password).to.equal(u2.password);
          expect(record._id).to.deep.equal(u2._id);
          done();
        });
      });
    });
    it('should not find a user by email and password', function(done){
      var u2 = new User({email:'nothing@nomail.com', name:'Bob', password: '1234'});
      u2.register(function(err, body){
        User.findByEmailAndPassword(u2.email, 'abcd', function(err, record){
          expect(typeof err).to.equal('string');
          done();
        });
      });
    });
  });

  describe('findByEmail', function(){
    it('should find a user by email.', function(done){
      var u2 = new User({email:'nothing@nomail.com', name:'Bob', password: '1234'});
      u2.register(function(err, body){
        User.findByEmail(u2.email, function(err, record){
          expect(record.email).to.equal('nothing@nomail.com');
          expect(record._id).to.deep.equal(u2._id);
          done();
        });
      });
    });
  });

  describe('#update', function(){
    it('should update a users info in the database', function(done){
      var u2 = new User({email:'nothing@nomail.com', name:'Bob', password: '1234'});
      u2.register(function(err, body){
        u2.name = 'notBob';
        u2.update(function(record){
          expect(record.name).to.equal('notBob');
          done();
        });
      });
    });
  });

  describe('#addSeries', function(){
    it('should add a Series id to the Users series array', function(done){
      var u2 = new User({email:'nothing@nomail.com', name:'Bob', password: '1234'});
      u2.register(function(err, body){
        var s1 = new Series({title:'Game of Thrones', directors:['some dude', 'some chick'],
          releaseYear:'2011', userId:u2._id, userName:u2.name});
        s1.insert(function(err, records){
          u2.addSeries(s1._id);
          u2.update(function(record){
            expect(record.series.length).to.equal(1);
            done();
          });
        });
      });
    });
  });

  describe('#addToQueue', function(){
    it('should add a Series id to the Users queue array', function(done){
      var u2 = new User({email:'nothing@nomail.com', name:'Bob', password: '1234'});
      u2.register(function(err, body){
        var s1 = new Series({title:'Game of Thrones', directors:['some dude', 'some chick'],
          releaseYear:'2011', userId:u2._id, userName:u2.name});
        s1.insert(function(err, records){
          u2.addToQueue(s1._id);
          u2.update(function(record){
            expect(record.queue.length).to.equal(1);
            done();
          });
        });
      });
    });
  });

  describe('#addEpisode', function(){
    it('should add an Episode id to the Users episodes array.', function(done){
      var u2 = new User({email:'morenothing@nomail.com', name:'addEpisode guy', password: '1234'});
      u2.register(function(err, body){
        var s1 = new Series({title:'Game of Thrones', directors:['some dude', 'some chick'],
          releaseYear:'2011', userId:u2._id, userName:u2.name});
        s1.insert(function(err, records){
          var e1 = new Episode({season:1, episodeNo:1, seriesId:s1._id, seriesTitle:s1.title,
            userId:u2._id, userName:u2.name, title:'Winter is Coming'});
          e1.insert(function(err, records){
            var oldname = __dirname + '/../fixtures/test-copy.avi';
            e1.addVideo(oldname, function(){
              e1.update(function(result){
                var id = e1._id.toString();
                Episode.findById(id, function(record){
                  u2.addEpisode(record._id);
                  expect(u2.episodes.length).to.equal(1);
                  done();
                });
              });
            });
          });
        });
      });
    });
  });

  describe('#addToFavorites', function(){
    it('should add an Episode id to the Users favorites array.', function(done){
      var u2 = new User({email:'morenothing@nomail.com', name:'addEpisode guy', password: '1234'});
      u2.register(function(err, body){
        var s1 = new Series({title:'Game of Thrones', directors:['some dude', 'some chick'],
          releaseYear:'2011', userId:u2._id, userName:u2.name});
        s1.insert(function(err, records){
          var e1 = new Episode({season:1, episodeNo:1, seriesId:s1._id, seriesTitle:s1.title,
            userId:u2._id, userName:u2.name, title:'Winter is Coming'});
          e1.insert(function(err, records){
            var oldname = __dirname + '/../fixtures/test-copy.avi';
            e1.addVideo(oldname, function(){
              e1.update(function(result){
                var id = e1._id.toString();
                Episode.findById(id, function(record){
                  u2.addToFavorites(record._id);
                  expect(u2.favorites.length).to.equal(1);
                  expect(u2.favorites[0]).to.deep.equal(e1._id);
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


















