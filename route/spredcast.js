const common = require('spred-common');
const httpHelper = require('spred-http-helper');

function registerRoute (router) {
  router.post('/spredcast', createCast);
  router.post('/spredcast/:id/token', createCastToken);
}

function createCast (req, res, next) {
  if (req.body.name === undefined || req.body.description === undefined || req.body.is_public === undefined || req.body.date === undefined ||
    (req.body.is_public === false && (req.body.members === undefined || !Array.isArray(req.body.members) || req.body.members.length === 0))) {
    httpHelper.sendReply(res, httpHelper.error.invalidRequestError());
  } else {
    common.spredCastModel.createNew(req.user._id, req.body.name, req.body.description, req.body.tags, req.body.date, req.body.is_public,
      req.body.user_capacity, req.body.members, req.body.duration, function (err, cCast) {
        if (err) {
          next(err);
        } else {
          var rep = {
            id: cCast._id,
            name: cCast.name,
            description: cCast.description,
            tags: cCast.tags,
            date: cCast.date,
            is_public: cCast.isPublic,
            user_capacity: cCast.userCapacity,
            members: cCast.members,
            duration: cCast.duration,
            url: req.body.name.replace(' ', '-') + common.utils.uidGen(3)
          };
          httpHelper.sendReply(res, 201, rep);
        }
      });
  }
}

function createCastToken (req, res, next) {
  if (req.body.presenter === undefined || typeof (req.body.presenter) !== 'boolean') {
    httpHelper.sendReply(res, httpHelper.error.invalidRequestError());
  } else {
    common.spredCastModel.userCanJoin(req.params.id, req.user._id, req.body.presenter, function (err, authorization, fCast) {
      if (err) {
        next(err);
      } else if (!authorization && fCast === null) {
        httpHelper.sendReply(res, httpHelper.error.castNotFound());
      } else if (!authorization) {
        httpHelper.sendReply(res, httpHelper.error.castAuthorizationRefused());
      } else {
        common.castTokenModel.createNew(req.authInfo.client, req.user, fCast, req.body.presenter, function (err, cToken) {
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
}

module.exports.registerRoute = registerRoute;
