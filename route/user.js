const common = require('spred-common');
const httpHelper = require('spred-http-helper');

function registerRoute (router) {
  router.get('/users/:id', getUserInfo);
  router.patch('/users/me', updateUser);
  router.delete('/users/me', deleteUser);

  router.post('/users/:id/follow', followUser);
  router.post('/users/:id/unfollow', unfollowUser);

  router.get('/users/search/:email', searchUser);
}

function getUserInfo (req, res, next) {
  if (req.params.id === 'me') {
    req.params.id = req.user._id;
  }
  if (req.params.id[0] === '@') {
    common.userModel.getByPseudo(req.params.id.substring(1), function (err, fUser) {
      if (err) {
        next(err);
      } else if (fUser == null) {
        httpHelper.sendReply(res, httpHelper.error.userNotFound());
      } else {
        httpHelper.sendReply(res, 200, fUser);
      }
    });
  } else {
    common.userModel.getById(req.params.id, req.params.id === 'me', function (err, fUser) {
      if (err || fUser == null) {
        httpHelper.sendReply(res, httpHelper.error.userNotFound());
      } else {
        httpHelper.sendReply(res, 200, fUser, next);
      }
    });
  }
}

function updateUser (req, res, next) {
  if (req.body.email !== undefined && req.user.password === undefined) {
    httpHelper.sendReply(res, httpHelper.error.invalidUserUpdate());
  } else {
    if (req.body.email !== undefined) {
      common.userModel.getByEmail(req.body.email, function (err, fUser) {
        if (err) {
          next(err);
        } else if (fUser != null) {
          httpHelper.sendReply(res, httpHelper.error.userExist());
        } else {
          var me = req.user;
          me.email = req.body.email || me.email;
          me.firstName = req.body.first_name || me.firstName;
          me.lastName = req.body.last_name || me.lastName;
          me.pictureUrl = req.body.picture_url || me.pictureUrl;
          me.save(function (err) {
            if (err) {
              next(err);
            } else {
              httpHelper.sendReply(res, 200, me, next);
            }
          });
        }
      });
    } else {
      var me = req.user;
      me.email = req.body.email || me.email;
      me.firstName = req.body.first_name || me.firstName;
      me.lastName = req.body.last_name || me.lastName;
      me.pictureUrl = req.body.picture_url || me.pictureUrl;
      me.save(function (err) {
        if (err) {
          next(err);
        } else {
          httpHelper.sendReply(res, 200, me, next);
        }
      });
    }
  }
}

function deleteUser (req, res, next) {
  common.accessTokenModel.deleteTokenForUser(req.user, function (err) {
    if (err) {
      next(err);
    } else {
      common.refreshTokenModel.deleteTokenForUser(req.user, function (err) {
        if (err) {
          next(err);
        } else {
          req.user.remove(function (err) {
            if (err) {
              next(err);
            } else {
              httpHelper.sendReply(res, 200, {}, next);
            }
          });
        }
      });
    }
  });
}

function searchUser (req, res, next) {
  common.userModel.getByPartialEmail(req.params.email, 10, function (err, fUsers) {
    if (err) {
      next(err);
    } else {
      httpHelper.sendReply(res, 200, fUsers, next);
    }
  });
}

function followUser (req, res, next) {
  common.userModel.getById(req.params.id, false, function (err, fUser) {
    if (err || fUser == null) {
      httpHelper.sendReply(res, httpHelper.error.userNotFound());
    } else {
      common.userModel.getById(req.user._id, true, function (err, me) {
        if (err) {
          next(err);
        } else {
          me.following.forEach(function (elem) {
            if (elem._id.toString() === req.params.id) {
              httpHelper.sendReply(res, httpHelper.error.alreadyFollowing());
            }
          });
          me.follow(fUser, function (err) {
            if (err) {
              next(err);
            } else {
              httpHelper.sendReply(res, 200, 'ok');
            }
          });
        }
      });
    }
  });
}

function unfollowUser (req, res, next) {
  common.userModel.getById(req.params.id, false, function (err, fUser) {
    if (err || fUser == null) {
      httpHelper.sendReply(res, httpHelper.error.userNotFound());
    } else {
      common.userModel.getById(req.user._id, true, function (err, me) {
        if (err) {
          next(err);
        } else {
          var find = false;
          me.following.forEach(function (elem) {
            if (elem._id.toString() === req.params.id) {
              find = true;
            }
          });
          if (find === false) {
            httpHelper.sendReply(res, httpHelper.error.notFollowing());
          } else {
            me.unfollow(fUser, function (err) {
              if (err) {
                next(err);
              } else {
                httpHelper.sendReply(res, 200, 'ok');
              }
            });
          }
        }
      });
    }
  });
}

module.exports.registerRoute = registerRoute;
