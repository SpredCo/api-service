const common = require('spred-common');
const httpHelper = require('spred-http-helper');

function registerRoute (router) {
  router.get('/feed/subscription', getSubscription);
}

function getSubscription (req, res, next) {
  common.followModel.getUserFollow(req.user._id, function (err, fFollows) {
    if (err) {
      next(err);
    } else {
      var cCreator = [];
      fFollows.forEach(function (fFollow) {
        cCreator.push(fFollow.following._id);
      });
      common.spredCastModel.find({ $or: [{ date: { $gt: new Date() }, state: 0 }, { state: 1 }], creator: { $in: cCreator } }).populate('creator tags').exec(function (err, fCasts) {
        if (err) {
          next(err);
        } else {
          httpHelper.sendReply(res, 200, fCasts);
        }
      });
    }
  });
}

module.exports.registerRoute = registerRoute;
