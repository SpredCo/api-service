const common = require('spred-common');
const httpHelper = require('spred-http-helper');

function registerRoute (router) {
  router.get('/inbox', getInbox);
  router.get('/inbox/conversation/:id', getConversation);
  router.get('/inbox/conversation/:conv_id/message/:id', getMessage);

  router.post('/inbox/conversation', createNewConversation);
  router.post('/inbox/conversation/:id/message', sendNewMessage);
  router.post('/inbox/conversation/:conv_id/message/:id/read', readMessage);
}

function getInbox (req, res, next) {
  common.conversationModel.getByUser(req.user, function (err, fConversations) {
    if (err) {
      next(err);
    } else {
      httpHelper.sendReply(res, 200, fConversations);
    }
  });
}

function getConversation (req, res, next) {
  common.conversationModel.getByIdAndUser(req.params.id, req.user, function (err, fConversation) {
    if (err) {
      next(err);
    } else if (fConversation == null) {
      httpHelper.sendReply(res, httpHelper.error.conversationNotFound());
    } else {
      httpHelper.sendReply(res, 200, fConversation);
    }
  });
}

function getMessage (req, res, next) {
  common.conversationModel.getByIdAndUser(req.params.conv_id, req.user, function (err, fConversation) {
    if (err) {
      next(err);
    } else if (fConversation == null) {
      httpHelper.sendReply(res, httpHelper.error.conversationNotFound());
    } else {
      common.messageModel.getByIdWithRead(req.params.id, req.user, function (err, fMessage) {
        if (err) {
          next(err);
        } else if (fMessage == null) {
          httpHelper.sendReply(res, httpHelper.error.messageNotFound());
        } else {
          httpHelper.sendReply(res, 200, fMessage);
        }
      });
    }
  });
}

function createNewConversation (req, res, next) {
  if (req.body.object === undefined || req.body.members === undefined || Array.isArray(req.body.members) === false ||
      req.body.members.length === 0 || req.body.content === undefined || common.utils.arrayHasDuplicate(req.body.members) ||
      req.body.members.indexOf(req.user._id.toString()) === -1) {
    httpHelper.sendReply(res, httpHelper.error.invalidRequestError());
  } else {
    common.userModel.usersExist(req.body.members, function (err, result) {
      if (err) {
        next(err);
      } else if (result === false) {
        httpHelper.sendReply(res, httpHelper.error.userNotFound());
      } else {
        common.conversationModel.sendNewMessage(req.body.object, req.body.members, true, req.user._id, req.body.content, function (err, cConversation, cMessage) {
          if (err) {
            next(err);
          } else {
            var result = cConversation.toObject({ print: true });
            result.msg = cMessage.toObject({ print: true });
            result.msg.read = true;
            httpHelper.sendReply(res, 201, result);
          }
        });
      }
    });
  }
}

function sendNewMessage (req, res, next) {
  if (req.body.content === undefined) {
    httpHelper.sendReply(res, httpHelper.error.invalidRequestError());
  } else {
    common.conversationModel.getByIdAndUser(req.params.id, req.user._id, function (err, fConversation) {
      if (err) {
        next(err);
      } else if (fConversation == null) {
        httpHelper.sendReply(res, httpHelper.error.conversationNotFound());
      } else if (fConversation.canAnswer === false) {
        httpHelper.sendReply(res, httpHelper.error.cannotReply());
      } else {
        common.conversationModel.getById(req.params.id, function (err, fConversation) {
          if (err) {
            next(err);
          } else {
            fConversation.sendNewMessage(req.user._id, req.body.content, function (err, cMessage) {
              if (err) {
                next(err);
              } else {
                var result = cMessage.toObject({ print: true });
                result.read = true;
                httpHelper.sendReply(res, 201, result);
              }
            });
          }
        });
      }
    });
  }
}

function readMessage (req, res, next) {
  if (req.body.read === undefined && typeof (req.body.read) !== 'boolean') {
    httpHelper.sendReply(res, httpHelper.error.invalidRequestError());
  } else {
    common.conversationModel.getByIdAndUser(req.params.conv_id, req.user, function (err, fConversation) {
      if (err) {
        next(err);
      } else if (fConversation == null) {
        httpHelper.sendReply(res, httpHelper.error.conversationNotFound());
      } else {
        common.messageReadModel.getByUserMessage(req.user._id, req.params.id, function (err, fMsg) {
          if (err) {
            next(err);
          } else if (fMsg == null) {
            httpHelper.sendReply(res, httpHelper.error.messageNotFound());
          } else {
            common.messageReadModel.updateRead(req.user, req.params.id, req.body.read, function (err) {
              if (err) {
                next(err);
              } else {
                httpHelper.sendReply(res, 201, { result: 'ok' });
              }
            });
          }
        });
      }
    });
  }
}

module.exports.registerRoute = registerRoute;
