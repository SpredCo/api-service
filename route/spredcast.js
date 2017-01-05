const common = require('spred-common');
const httpHelper = require('spred-http-helper');

var indexerFunc;

function registerRoute (router, indexFunc) {
  router.get('/spredcasts', getUserCast);
  router.get('/spredcasts/reminders', getUserReminder);
  router.get('/spredcasts/remind', userIsRemindedForCast);
  router.post('/spredcasts', createCast);
  router.delete('/spredcasts/:id', deleteCast);
  router.get('/spredcasts/:id/remind', userIsReminded);
  router.post('/spredcasts/:id/remind', remindCast);
  router.delete('/spredcasts/:id/remind', removeReminder);
  router.get('/spredcasts/:id/reminders', getCastReminder);
  router.post('/spredcasts/:id/token', createCastToken);

  indexerFunc = indexFunc;
}

function getUserCast (req, res, next) {
  common.spredCastModel.getByUser(req.user._id, function (err, fCasts) {
    if (err) {
      next(err);
    } else {
      httpHelper.sendReply(res, 200, fCasts);
    }
  });
}

function createCast (req, res, next) {
  if (req.body.name === undefined || req.body.description === undefined || req.body.is_public === undefined || req.body.date === undefined || req.body.tags === undefined || !Array.isArray(req.body.tags) ||
    (req.body.is_public === false && (req.body.members === undefined || !Array.isArray(req.body.members) || req.body.members.length === 0))) {
    httpHelper.sendReply(res, httpHelper.error.invalidRequestError());
  } else {
    common.tagModel.checkExist(req.body.tags, function (err, result) {
      if (err) {
        next(err);
      } else if (result === false) {
        httpHelper.sendReply(res, httpHelper.error.invalidRequestError());
      } else {
        const url = encodeURIComponent(req.body.name.split(' ').join('-') + '-' + common.utils.uidGen(3));
        common.spredCastModel.createNew(req.user._id, req.body.name, req.body.description, req.body.tags, req.body.date, req.body.is_public,
          req.body.user_capacity, req.body.members, req.body.duration, url.toLowerCase(), req.body.cover_url, function (err, cCast) {
            if (err) {
              next(err);
            } else {
              common.spredCastModel.getByUrl(cCast.url, function (err, fCast) {
                if (err) {
                  next(err);
                } else if (fCast.isPublic) {
                  addCastToIndex(fCast, function (err) {
                    if (err) {
                      next(err);
                    } else {
                      httpHelper.sendReply(res, 201, fCast);
                    }
                  });
                } else {
                  httpHelper.sendReply(res, 201, fCast);
                }
              });
            }
          });
      }
    });
  }
}

function deleteCast (req, res, next) {
  common.spredCastModel.removeCast(req.params.id, req.user._id, function (err, result) {
    if (err) {
      next(err);
    } else if (result === false) {
      httpHelper.sendReply(res, httpHelper.error.castNotFound());
    } else {
      httpHelper.sendReply(res, 200, { result: result });
    }
  });
}

function createCastToken (req, res, next) {
  common.spredCastModel.userCanJoin(req.params.id, req.user._id, function (err, authorization, presenter, fCast) {
    if (err) {
      next(err);
    } else if (!authorization && fCast === null) {
      httpHelper.sendReply(res, httpHelper.error.castNotFound());
    } else if (!authorization) {
      httpHelper.sendReply(res, httpHelper.error.castAuthorizationRefused());
    } else {
      common.castTokenModel.createNew(req.authInfo.client, req.user, fCast, presenter, function (err, cToken) {
        if (err) {
          next(err);
        } else {
          const reply = {
            cast_token: cToken.token,
            spredcast: fCast._id,
            presenter: cToken.presenter,
            pseudo: cToken.pseudo
          };
          httpHelper.sendReply(res, 201, reply);
        }
      });
    }
  });
}

function getUserReminder (req, res, next) {
  common.spredcastReminderModel.getUserReminder(req.user._id, function (err, fReminders) {
    if (err) {
      next(err);
    } else {
      httpHelper.sendReply(res, 200, fReminders);
    }
  });
}

function remindCast (req, res, next) {
  common.spredCastModel.getById(req.params.id, function (err, fCast) {
    if (err) {
      next(err);
    } else if (fCast === null) {
      httpHelper.sendReply(res, httpHelper.error.castNotFound());
    } else {
      common.spredcastReminderModel.userIsReminded(req.params.id, req.user._id, function (err, result) {
        if (err) {
          next(err);
        } else if (result === true) {
          httpHelper.sendReply(res, httpHelper.error.alreadyReminded());
        } else {
          common.spredcastReminderModel.createNew(req.params.id, req.user._id, function (err, cReminders) {
            if (err) {
              next(err);
            } else {
              httpHelper.sendReply(res, 201, cReminders);
            }
          });
        }
      });
    }
  });
}

function userIsReminded (req, res, next) {
  common.spredCastModel.getById(req.params.id, function (err, fCast) {
    if (err) {
      next(err);
    } else if (fCast === null) {
      httpHelper.sendReply(res, httpHelper.error.castNotFound());
    } else {
      common.spredcastReminderModel.userIsReminded(req.params.id, req.user._id, function (err, result) {
        if (err) {
          next(err);
        } else {
          httpHelper.sendReply(res, 200, {result: result});
        }
      });
    }
  });
}

function userIsRemindedForCast (req, res, next) {
  var castIds = req.query.cast_id;
  if (castIds === undefined) {
    httpHelper.sendReply(res, httpHelper.error.invalidRequestError());
  } else {
    if (!Array.isArray(castIds)) {
      castIds = [castIds];
    }
    common.spredcastReminderModel.getUserReminderByCastIds(castIds, req.user._id, function (err, fReminders) {
      if (err) {
        next(err);
      } else if (fReminders === false) {
        httpHelper.sendReply(res, httpHelper.error.castNotFound());
      } else {
        var rep = [];
        var exist;
        castIds.forEach(function (castId) {
          exist = false;
          fReminders.every(function (reminder) {
            if (reminder.cast.toString() === castId) {
              exist = true;
              return false;
            }
            return true;
          });
          rep.push({
            id: castId,
            result: exist
          });
        });
        httpHelper.sendReply(res, 200, rep);
      }
    });
  }
}

function removeReminder (req, res, next) {
  common.spredCastModel.getById(req.params.id, function (err, fCast) {
    if (err) {
      next(err);
    } else if (fCast === null) {
      httpHelper.sendReply(res, httpHelper.error.castNotFound());
    } else {
      common.spredcastReminderModel.userIsReminded(req.params.id, req.user._id, function (err, result) {
        if (err) {
          next(err);
        } else if (result === false) {
          httpHelper.sendReply(res, httpHelper.error.notReminded());
        } else {
          common.spredcastReminderModel.removeReminder(req.params.id, req.user._id, function (err, result) {
            if (err) {
              next(err);
            } else {
              httpHelper.sendReply(res, 200, {result: result});
            }
          });
        }
      });
    }
  });
}

function getCastReminder (req, res, next) {
  common.spredCastModel.getById(req.params.id, function (err, fCast) {
    if (err) {
      next(err);
    } else if (fCast === null) {
      httpHelper.sendReply(res, httpHelper.error.castNotFound());
    } else if (fCast.creator.toString() !== req.user._id.toString()) {
      httpHelper.sendReply(res, httpHelper.error.notCastCreator());
    } else {
      common.spredcastReminderModel.getCastReminder(req.params.id, function (err, fReminders) {
        if (err) {
          next(err);
        } else {
          httpHelper.sendReply(res, 200, fReminders);
        }
      });
    }
  });
}

function addCastToIndex (cCast, cb) {
  var cast = {
    objectID: cCast._id,
    name: cCast.name,
    type: 'cast',
    url: cCast.url
  };
  indexerFunc(['global', 'cast'], [cast], cb);
}

module.exports.registerRoute = registerRoute;
