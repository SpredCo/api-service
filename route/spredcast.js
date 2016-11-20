const common = require('spred-common');
const httpHelper = require('spred-http-helper');

function registerRoute (router) {
  router.get('/spredcast', getUserCast);
  router.post('/spredcast', createCast);
  router.post('/spredcast/:id/token', createCastToken);
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
  if (req.body.name === undefined || req.body.description === undefined || req.body.is_public === undefined || req.body.date === undefined ||
    (req.body.is_public === false && (req.body.members === undefined || !Array.isArray(req.body.members) || req.body.members.length === 0))) {
    httpHelper.sendReply(res, httpHelper.error.invalidRequestError());
  } else {
    common.spredCastModel.createNew(req.user._id, req.body.name, req.body.description, req.body.tags, req.body.date, req.body.is_public,
      req.body.user_capacity, req.body.members, req.body.duration, req.body.name.replace(' ', '-') + common.utils.uidGen(3), req.body.cover_url, function (err, cCast) {
        if (err) {
          next(err);
        } else {
          httpHelper.sendReply(res, 201, cCast);
        }
      });
  }
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

module.exports.registerRoute = registerRoute;
