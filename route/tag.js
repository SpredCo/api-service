const common = require('spred-common');
const httpHelper = require('spred-http-helper');

function registerRoute (router) {
  router.get('/tags/subscription', getUserSubscription);
  router.get('/tags/:id/subscription', userIsSubscribed);
  router.post('/tags/:id/subscription', subscribeTag);
  router.delete('/tags/:id/subscription', unSubscribeTag);
}

function getUserSubscription (req, res, next) {
  common.tagSubscriptionModel.getUserSubscription(req.user._id, function (err, fSubscriptions) {
    if (err) {
      next(err);
    } else {
      httpHelper.sendReply(res, 200, fSubscriptions);
    }
  });
}

function userIsSubscribed (req, res, next) {
  common.tagModel.getById(req.params.id, function (err, fTag) {
    if (err) {
      next(err);
    } else if (fTag == null) {
      httpHelper.sendReply(res, httpHelper.error.tagNotFound());
    } else {
      common.tagSubscriptionModel.userIsSubscribed(req.params.id, req.user._id, function (err, result) {
        if (err) {
          next(err);
        } else {
          httpHelper.sendReply(res, 200, { result: result });
        }
      });
    }
  });
}

function subscribeTag (req, res, next) {
  common.tagModel.getById(req.params.id, function (err, fTag) {
    if (err) {
      next(err);
    } else if (fTag == null) {
      httpHelper.sendReply(res, httpHelper.error.tagNotFound());
    } else {
      common.tagSubscriptionModel.userIsSubscribed(req.params.id, req.user._id, function (err, result) {
        if (err) {
          next(err);
        } else if (result === true) {
          httpHelper.sendReply(res, httpHelper.error.alreadySubscribed());
        } else {
          common.tagSubscriptionModel.createNew(req.params.id, req.user._id, function (err, cSubscription) {
            if (err) {
              next(err);
            } else {
              common.tagModel.followTag(req.params.id, function (err) {
                if (err) {
                  next(err);
                } else {
                  httpHelper.sendReply(res, 201, cSubscription);
                }
              });
            }
          });
        }
      });
    }
  });
}

function unSubscribeTag (req, res, next) {
  common.tagModel.getById(req.params.id, function (err, fTag) {
    if (err) {
      next(err);
    } else if (fTag == null) {
      httpHelper.sendReply(res, httpHelper.error.tagNotFound());
    } else {
      common.tagSubscriptionModel.userIsSubscribed(req.params.id, req.user._id, function (err, result) {
        if (err) {
          next(err);
        } else if (result === false) {
          httpHelper.sendReply(res, httpHelper.error.notSubscribed());
        } else {
          common.tagSubscriptionModel.removeSubscription(req.params.id, req.user._id, function (err, result) {
            if (err) {
              next(err);
            } else {
              common.tagModel.unFollowTag(req.params.id, function (err) {
                if (err) {
                  next(err);
                } else {
                  httpHelper.sendReply(res, 200, { result: result });
                }
              });
            }
          });
        }
      });
    }
  });
}

module.exports.registerRoute = registerRoute;
