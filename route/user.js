const common = require('spred-common');
const httpHelper = require('spred-http-helper');

function registerRoute (router) {
  router.get('/users/follow', getUserFollow);
  router.get('/users/:id', getUserInfo);
  router.patch('/users/me', updateUser);
  router.delete('/users/me', deleteUser);

  router.get('/users/:id/follow', userIsFollowing);
  router.post('/users/:id/follow', followUser);
  router.post('/users/:id/unfollow', unfollowUser);
  router.post('/users/:id/report', reportUser);

  router.get('/users/search/email/:email', searchUserByEmail);
  router.get('/users/search/pseudo/:pseudo', searchUserByPseudo);
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
    common.userModel.getById(req.params.id, function (err, fUser) {
      if (err) {
        next(err);
      } else if (fUser == null) {
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
          me.pseudo = req.body.pseudo || me.pseudo;
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
      me.pseudo = req.body.pseudo || me.pseudo;
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

function searchUserByEmail (req, res, next) {
  common.userModel.getByPartialEmail(req.params.email, 10, function (err, fUsers) {
    if (err) {
      next(err);
    } else {
      httpHelper.sendReply(res, 200, fUsers, next);
    }
  });
}

function searchUserByPseudo (req, res, next) {
  common.userModel.getByPartialPseudo(req.params.pseudo, 10, function (err, fUsers) {
    if (err) {
      next(err);
    } else {
      httpHelper.sendReply(res, 200, fUsers, next);
    }
  });
}

function getUserFollow (req, res, next) {
  common.followModel.getUserFollow(req.user._id, function (err, fFollows) {
    if (err) {
      next(err);
    } else {
      httpHelper.sendReply(res, 200, fFollows);
    }
  });
}

function userIsFollowing (req, res, next) {
  common.userModel.getById(req.params.id, function (err, fUser) {
    if (err) {
      next(err);
    } else if (fUser === null) {
      httpHelper.sendReply(res, httpHelper.error.userNotFound());
    } else {
      common.followModel.userIsFollowing(req.user._id, req.params.id, function (err, result) {
        if (err) {
          next(err);
        } else {
          httpHelper.sendReply(res, 200, { result: result });
        }
      });
    }
  });
}

function followUser (req, res, next) {
  common.userModel.getById(req.params.id, function (err, fUser) {
    if (err) {
      next(err);
    } else if (fUser == null) {
      httpHelper.sendReply(res, httpHelper.error.userNotFound());
    } else {
      common.followModel.userIsFollowing(req.user._id, req.params.id, function (err, result) {
        if (err) {
          next(err);
        } else if (result === true) {
          httpHelper.sendReply(res, httpHelper.error.alreadyFollowing());
        } else {
          common.followModel.createNew(req.user._id, req.params.id, function (err, cFollow) {
            if (err) {
              next(err);
            } else {
              httpHelper.sendReply(res, 201, cFollow);
            }
          });
        }
      });
    }
  });
}

function unfollowUser (req, res, next) {
  common.userModel.getById(req.params.id, function (err, fUser) {
    if (err) {
      next(err);
    } else if (fUser == null) {
      httpHelper.sendReply(res, httpHelper.error.userNotFound());
    } else {
      common.followModel.userIsFollowing(req.user._id, req.params.id, function (err, result) {
        if (err) {
          next(err);
        } else if (result === false) {
          httpHelper.sendReply(res, httpHelper.error.notFollowing());
        } else {
          common.followModel.unFollow(req.user._id, req.params.id, function (err) {
            if (err) {
              next(err);
            } else {
              httpHelper.sendReply(res, 200, {'result': 'ok'});
            }
          });
        }
      });
    }
  });
}

function reportUser (req, res, next) {
  if (req.body.motif === undefined || req.params.id === req.user._id.toString()) {
    httpHelper.sendReply(res, httpHelper.error.invalidRequestError());
  } else {
    common.userModel.getById(req.params.id, function (err, fUser) {
      if (err) {
        next(err);
      } else if (fUser == null) {
        httpHelper.sendReply(res, httpHelper.error.userNotFound());
      } else {
        common.reportModel.createNew(fUser, req.user._id, req.body.motif, function (err, cReport) {
          if (err) {
            next(err);
          } else {
            httpHelper.sendReply(res, 201, {'result': 'ok'});
          }
        });
      }
    });
  }
}

module.exports.registerRoute = registerRoute;
