const path = require('path');
const express = require('express');
const logger = require('winston');
const passport = require('passport');
const bodyParser = require('body-parser');
const bearerAuth = require('./auth/bearer');
const httpHelper = require('spred-http-helper');

var apiApp = null;
var apiRouter = null;

const userRouter = require('./route/user');
const inboxRouter = require('./route/inbox');
const spredCastRouter = require('./route/spredcast');
const tagRouter = require('./route/tag');

function getApp (log, indexFunc) {
  logger.info('Initializing api app ...');
  apiApp = express();
  apiApp.use(bodyParser.json());
  apiApp.use(passport.initialize());

  apiRouter = express.Router();

  bearerAuth.init();
  apiRouter.use(passport.authenticate('bearer', { session: false }));

  if (log) {
    apiRouter.use(httpHelper.requestLogger('api'));
  }

  // Register all routes
  userRouter.registerRoute(apiRouter);
  inboxRouter.registerRoute(apiRouter);
  spredCastRouter.registerRoute(apiRouter, indexFunc);
  tagRouter.registerRoute(apiRouter);

  apiApp.use('/v1', apiRouter);
  apiApp.use('/doc', express.static(path.join(__dirname, '/doc'), {dotfiles: 'allow'}));
  apiApp.use('/upload', express.static(path.join(__dirname, '/upload'), {dotfiles: 'allow'}));

  // Error handler
  apiApp.use(function (err, req, res, next) {
    logger.error(err);
    logger.info(err);
    httpHelper.sendReply(res, httpHelper.error.internalServerError(err));
  });

  logger.info('Api app initialized');

  return apiApp;
}
module.exports.getApp = getApp;
