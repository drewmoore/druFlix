'use strict';

var bcrypt = require('bcrypt');
var users = global.nss.db.collection('users');
//var email = require('../lib/send-email');
var Mongo = require('mongodb');
var User;

module.exports = User;

function User(user){
  this.name = user.name;
  this.email = user.email;
  this.password = user.password;
  this.series = [];
  this.queue = [];
  this.episodes = [];
  this.favorites = [];

}

User.prototype.register = function(fn){
  var self = this;
  hashPassword(self.password, function(hashed){
    self.password = hashed;
    User.dupeCheckEmail(self.email, function(dupeResult){
      if(dupeResult.response){
        User.dupeCheckName(self.name, function(dupeResult){
          if(dupeResult.response){
            insert(self, function(err, inserted){
              fn(err, inserted);
              //
              // COMMENTED OUT TILL THE INTERNET WORKS
              //email.sendWelcome({to:self.email, name:self.name}, function(err, body){
                //fn(err, body);
              //});
            });
          } else {
            fn('There\'s already a user with that name, yo!');
          }
        });
      } else {
        fn('Your email\'s already in here. Just login, yo!');
      }
    });
  });
};

function hashPassword(password, fn){
  bcrypt.hash(password, 8, function(err, hash){
    fn(hash);
  });
}

User.dupeCheckEmail = function(email, fn){
  users.findOne({email:email}, function(err, foundUser){
    if(foundUser === null){
      fn({response:true});
    } else {
      fn({response:false, failedOn:foundUser._id});
    }
  });
};

User.dupeCheckName = function(name, fn){
  users.findOne({name:name}, function(err, foundUser){
    if(foundUser === null){
      fn({response:true});
    } else {
      fn({response:false, failedOn:foundUser._id});
    }
  });
};

function insert(user, fn){
  users.insert(user, function(err, record){
    fn(err, record);
  });
}

User.findById = function(id, fn){
  var mongoId = new Mongo.ObjectID(id);
  users.findOne({_id:mongoId}, function(err, record){
    fn(record);
  });
};

User.findByName = function(name, fn){
  users.findOne({name:name}, function(err, record){
    fn(record);
  });
};

User.findByEmailAndPassword = function(email, password, fn){
  users.findOne({email:email}, function(err, record){
    if(record){
      bcrypt.compare(password, record.password, function(err, result){
        if(result){
          fn(err, record);
        } else {
          fn('That password is wack, yo!');
        }
      });
    } else {
      fn('That username(email) is wack, yo!');
    }
  });
};

User.findByEmail = function(email, fn){
  users.findOne({email:email}, function(err, record){
    fn(err, record);
  });
};


User.prototype.update = function(fn){
  var self = this;
  users.update({_id:self._id}, self, function(err, count){
    User.findById(self._id.toString(), function(record){
      fn(record);
    });
  });
};

User.prototype.addSeries = function(id){
  this.series.push(id);
};

User.prototype.addToQueue = function(id){
  this.queue.push(id);
};

User.prototype.addEpisode = function(id){
  this.episodes.push(id);
};

User.prototype.addToFavorites = function(id){
  this.favorites.push(id);
};















