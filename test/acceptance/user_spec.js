'use strict';

process.env.DBNAME = 'druFlix-acceptance-test';
var app = require('../../app/app');
var request = require('supertest');
var expect = require('chai').expect;
var User;
var u1;
var Series;
var Episode;

describe('users', function(){

  before(function(done){
    this.timeout(10000);
    request(app)
    .get('/')
    .end(function(err, res){
      User = require('../../app/models/user');
      Series = require('../../app/models/series');
      Episode = require('../../app/models/episode');
      done();
    });
  });

  beforeEach(function(done){
    global.nss.db.dropDatabase(function(err, result){
      u1 = new User({name:'Drew before each accept', email:'drewbeforeeach@nomail.com', password:'1234'});
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
                  u1.addEpisode(record._id);
                  u1.addSeries(s1._id);
                  u1.update(function(record){
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

  describe('GET /', function(){
    it('should display the home page', function(done){
      request(app)
      .get('/')
      .expect(200, done);
    });
  });

  describe('GET /auth', function(){
    it('should display the login/register page', function(done){
      request(app)
      .get('/auth')
      .end(function(err, res){
        expect(res.status).to.equal(200);
        //expect(res.text).to.include('Register or login, yo!');
        done();
      });
    });
  });

  describe('POST /register', function(){
    it('should register a new user', function(done){
      request(app)
      .post('/register')
      .field('name', 'Drew accept')
      .field('email', 'drewAcceptance@nomail.com')
      .field('password', '1234')
      .end(function(err, res){
        expect(res.status).to.equal(302);
        done();
      });
    });
    it('should not register a duplicate user', function(done){
      request(app)
      .post('/register')
      .field('name', 'Drew before each accept')
      .field('email', 'whatever@nomail.com')
      .field('password', '1234')
      .end(function(err, res){
        expect(res.status).to.equal(200);
        //expect(res.text).to.include('Register or login, yo!');
        expect(res.text).to.include('already a user');
        done();
      });
    });
  });

  describe('POST /login', function(){
    it('should login a user', function(done){
      request(app)
      .post('/login')
      .field('email', 'drewbeforeeach@nomail.com')
      .field('password', '1234')
      .end(function(err, res){
        expect(res.status).to.equal(302);
        expect(res.headers['set-cookie']).to.have.length(1);
        done();
      });
    });
    it('should not login a user', function(done){
      request(app)
      .post('/login')
      .field('email', 'drewbeforeeach@nomail.com')
      .field('password', 'abcd')
      .end(function(err, res){
        expect(res.status).to.equal(200);
        expect(res.text).to.include('wack,');
        done();
      });
    });
  });

  describe('POST /logout', function(){
    it('should logout a user', function(done){
      request(app)
      .post('/logout')
      .end(function(err, res){
        expect(res.status).to.equal(302);
        done();
      });
    });
  });

  describe('GET /user/profile', function(){
    it('should get a users profile page', function(done){
      request(app)
      .post('/login')
      .field('email', 'drewbeforeeach@nomail.com')
      .field('password', '1234')
      .end(function(err, res){
        var cookie = res.headers['set-cookie'];
        request(app)
        .get('/user/profile')
        .set('cookie', cookie)
        .end(function(err, res){
          expect(res.status).to.equal(200);
          expect(res.text).to.include('Winter is Coming');
          done();
        });
      });
    });
  });

});



















