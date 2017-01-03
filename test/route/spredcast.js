const config = require('config');
const expect = require('chai').expect;
const supertest = require('supertest');
const fixture = require('../fixture/spredcast.json');
const common = require('spred-common');

const url = config.get('test.server.url') + ':' + config.get('test.server.port');
const apiSrv = supertest(url);

var user1;
var user2;
var token1;
var token2;
var token3;
var tag1;
var tag2;
var cast1;
var cast2;

describe('Testing spredcast routes (/v1/spredcast)', function () {
  before(function (done) {
    this.timeout(4000);
    common.clientModel.createFix(fixture.client.name, fixture.client.key, fixture.client.secret, function (err, cClient) {
      if (err) {
        done(err);
      } else {
        common.userModel.createPassword(fixture.user1.email, fixture.user1.password, fixture.user1.pseudo, fixture.user1.first_name, fixture.user1.last_name, function (err, cUser1) {
          if (err) {
            done(err);
          } else {
            common.userModel.createPassword(fixture.user2.email, fixture.user2.password, fixture.user2.pseudo, fixture.user2.first_name, fixture.user2.last_name, function (err, cUser2) {
              if (err) {
                done(err);
              } else {
                common.userModel.createPassword(fixture.user3.email, fixture.user3.password, fixture.user3.pseudo, fixture.user3.first_name, fixture.user3.last_name, function (err, cUser3) {
                  if (err) {
                    done(err);
                  } else {
                    common.accessTokenModel.createFix(cClient, cUser1, fixture.token1, function (err, cToken1) {
                      if (err) {
                        done(err);
                      } else {
                        common.accessTokenModel.createFix(cClient, cUser2, fixture.token2, function (err, cToken2) {
                          if (err) {
                            done(err);
                          } else {
                            common.accessTokenModel.createFix(cClient, cUser3, fixture.token3, function (err, cToken3) {
                              if (err) {
                                done(err);
                              } else {
                                common.tagModel.createNew(fixture.tag1.name, fixture.tag1.description, function (err, cTag) {
                                  if (err) {
                                    done(err);
                                  } else {
                                    common.tagModel.createNew(fixture.tag2.name, fixture.tag2.description, function (err, cTag2) {
                                      if (err) {
                                        done(err);
                                      } else {
                                        user1 = cUser1;
                                        user2 = cUser2;
                                        token1 = cToken1;
                                        token2 = cToken2;
                                        token3 = cToken3;
                                        tag1 = cTag;
                                        tag2 = cTag2;
                                        done();
                                      }
                                    });
                                  }
                                });
                              }
                            });
                          }
                        });
                      }
                    });
                  }
                });
              }
            });
          }
        });
      }
    });
  });

  describe('Testing spredcast creation (POST /v1/spredcasts)', function () {
    it('Should create a public spredcast', function (done) {
      apiSrv
        .post('/v1/spredcasts')
        .send({ name: fixture.cast1.name, description: fixture.cast1.description, is_public: fixture.cast1.is_public, date: fixture.cast1.date, tags: [tag1._id, tag2._id], user_capacity: fixture.cast1.user_capacity, cover_url: fixture.cast1.cover_url })
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + token1.token)
        .expect(201)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            expect(res.body.name).to.equal(fixture.cast1.name);
            expect(res.body.description).to.equal(fixture.cast1.description);
            expect(res.body.tags).to.have.lengthOf(2);
            expect(res.body.is_public).to.equal(fixture.cast1.is_public);
            expect(res.body.user_capacity).to.equal(fixture.cast1.user_capacity);
            expect(res.body.members).to.have.lengthOf(0);
            cast1 = res.body;
            done();
          }
        });
    });

    it('Should create a private spredcast', function (done) {
      apiSrv
        .post('/v1/spredcasts')
        .send({ name: fixture.cast2.name, description: fixture.cast2.description, is_public: fixture.cast2.is_public, date: new Date(), tags: [tag1._id, tag2._id], user_capacity: fixture.cast1.user_capacity, members: [ user2._id ], cover_url: fixture.cast2.cover_url })
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + token1.token)
        .expect(201)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            expect(res.body.name).to.equal(fixture.cast2.name);
            expect(res.body.description).to.equal(fixture.cast2.description);
            expect(res.body.tags).to.have.lengthOf(2);
            expect(res.body.is_public).to.equal(fixture.cast2.is_public);
            expect(res.body.user_capacity).to.equal(fixture.cast2.user_capacity);
            expect(res.body.members).to.have.lengthOf(1);
            cast2 = res.body;
            done();
          }
        });
    });

    it('Should return an error if parameter are missing', function (done) {
      apiSrv
        .post('/v1/spredcasts')
        .send({ name: fixture.cast2.name, is_public: fixture.cast2.is_public, date: new Date(), user_capacity: fixture.cast1.user_capacity, members: [ user2._id ] })
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + token1.token)
        .expect(400)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            done();
          }
        });
    });

    it('Should return an error if private cast without members', function (done) {
      apiSrv
        .post('/v1/spredcasts')
        .send({ name: fixture.cast2.name, is_public: fixture.cast2.is_public, date: new Date(), user_capacity: fixture.cast1.user_capacity, members: [] })
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + token1.token)
        .expect(400)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            done();
          }
        });
    });
  });

  describe('Testing get cast by User (GET /v1/spredcast)', function () {
    it('Should return the users spredcasrs', function (done) {
      apiSrv
        .get('/v1/spredcasts')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + token1.token)
        .expect(200)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            expect(res.body).to.have.lengthOf(2);
            done();
          }
        });
    });
  });

  describe('Testing cast token creation (POST /v1/spredcast/{id}/token) ', function () {
    it('Should create a cast token for the presenter', function (done) {
      apiSrv
        .post('/v1/spredcasts/' + cast1.id + '/token')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + token1.token)
        .expect(201)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            expect(res.body.cast_token).to.not.be.undefined;
            expect(res.body.spredcast).to.equal(cast1.id.toString());
            expect(res.body.presenter).to.be.true;
            expect(res.body.pseudo).to.equal(fixture.user1.pseudo);
            common.spredCastModel.updateState(cast1.id, 1, function (err) {
              if (err) {
                done(err);
              } else {
                done();
              }
            });
          }
        });
    });

    it('Should create a cast token for the spectator', function (done) {
      apiSrv
        .post('/v1/spredcasts/' + cast1.id + '/token')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + token3.token)
        .expect(201)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            expect(res.body.cast_token).to.not.be.undefined;
            expect(res.body.spredcast).to.equal(cast1.id.toString());
            expect(res.body.presenter).to.be.false;
            expect(res.body.pseudo).to.equal(fixture.user3.pseudo);
            done();
          }
        });
    });

    it('Should create a cast token for the presenter', function (done) {
      apiSrv
        .post('/v1/spredcasts/' + cast2.id + '/token')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + token1.token)
        .expect(201)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            expect(res.body.cast_token).to.not.be.undefined;
            expect(res.body.spredcast).to.equal(cast2.id.toString());
            expect(res.body.presenter).to.be.true;
            expect(res.body.pseudo).to.equal(fixture.user1.pseudo);
            common.spredCastModel.updateState(cast2.id, 1, function (err) {
              if (err) {
                done(err);
              } else {
                done();
              }
            });
          }
        });
    });

    it('Should create a cast token for a member invited to a private cast', function (done) {
      apiSrv
        .post('/v1/spredcasts/' + cast2.id + '/token')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + token2.token)
        .expect(201)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            expect(res.body.cast_token).to.not.be.undefined;
            expect(res.body.spredcast).to.equal(cast2.id.toString());
            expect(res.body.presenter).to.be.false;
            expect(res.body.pseudo).to.equal(fixture.user2.pseudo);
            done();
          }
        });
    });

    it('Should refuse access to a private cast', function (done) {
      apiSrv
        .post('/v1/spredcasts/' + cast2.id + '/token')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + token3.token)
        .expect(403)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            done();
          }
        });
    });
  });

  describe('Testing cast reminder creation (POST /v1/spredcast/{id}/remind', function () {
    it('Should create a new spredcastReminder', function (done) {
      apiSrv
        .post('/v1/spredcasts/' + cast1.id + '/remind')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + token1.token)
        .expect(201)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            expect(res.body.cast).to.not.be.undefined;
            expect(res.body.user).to.not.be.undefined;
            done();
          }
        });
    });
  });

  describe('Testing get user reminder (GET /v1/spredcasts/reminder)', function () {
    it('Should reply the user s reminders', function (done) {
      apiSrv
        .get('/v1/spredcasts/reminders')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + token1.token)
        .expect(200)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            expect(res.body).to.have.lengthOf(1);
            expect(res.body[0].cast.name).to.equal(cast1.name);
            done();
          }
        });
    });
  });

  describe('Testing get cast reminder (GET /v1/spredcast/:id/reminders)', function () {
    it('Should reply the user reminded for the cast', function (done) {
      apiSrv
        .get('/v1/spredcasts/' + cast1.id + '/reminders')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + token1.token)
        .expect(200)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            expect(res.body).to.have.lengthOf(1);
            expect(res.body[0].user.name).to.equal(user1.name);
            done();
          }
        });
    });

    it('Should reply an error if user is not the creator of the cast', function (done) {
      apiSrv
        .get('/v1/spredcasts/' + cast1.id + '/reminders')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + token2.token)
        .expect(400)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            expect(res.body.code).to.equal(5);
            expect(res.body.sub_code).to.equal(3);
            done();
          }
        });
    });
  });

  describe('Testing get user is reminded (GET /v1/spredcast/:id/remind)', function () {
    it('Should reply true if user is already reminded', function (done) {
      apiSrv
        .get('/v1/spredcasts/' + cast1.id + '/remind')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + token1.token)
        .expect(200)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            expect(res.body.result).to.be.true;
            done();
          }
        });
    });

    it('Should reply true if user is already reminded', function (done) {
      apiSrv
        .get('/v1/spredcasts/' + cast1.id + '/remind')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + token2.token)
        .expect(200)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            expect(res.body.result).to.be.false;
            done();
          }
        });
    });
  });

  describe('Testing get user is reminded for castId (GET /v1/spredcast/remind?cast_id=...)', function () {
    it('Should reply an array with boolean value', function (done) {
      apiSrv
        .get('/v1/spredcasts/remind?cast_id=' + cast1.id + '&cast_id=' + cast2.id)
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + token1.token)
        .expect(200)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            expect(res.body).to.have.lengthOf(2);
            expect(res.body[0].id).to.equals(cast1.id);
            expect(res.body[0].result).to.be.true;
            expect(res.body[1].id).to.equals(cast2.id);
            expect(res.body[1].result).to.be.false;
            done();
          }
        });
    });

    it('Should reply an error if no cast id are given', function (done) {
      apiSrv
        .get('/v1/spredcasts/remind')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + token1.token)
        .expect(400)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            done();
          }
        });
    });

    it('Should reply an error if castId are not valid', function (done) {
      apiSrv
        .get('/v1/spredcasts/remind?cast_id=toto')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + token1.token)
        .expect(404)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            done();
          }
        });
    });
  });

  describe('Testing delete cast reminder (DELETE /v1/spredcast/:id/remind)', function () {
    it('Should delete a reminder', function (done) {
      apiSrv
        .delete('/v1/spredcasts/' + cast1.id + '/remind')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + token1.token)
        .expect(200)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            expect(res.body.result).to.be.true;
            done();
          }
        });
    });

    it('Should delete a reminder', function (done) {
      apiSrv
        .delete('/v1/spredcasts/' + cast1.id + '/remind')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + token1.token)
        .expect(400)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            expect(res.body.code).to.equal(7);
            expect(res.body.sub_code).to.equal(2);
            done();
          }
        });
    });
  });

  describe('Testing subscription creation (POST /v1/tags/:id/subscribe)', function () {
    it('Should create a subscription for user', function (done) {
      apiSrv
        .post('/v1/tags/' + tag1.id + '/subscription')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + token1.token)
        .expect(201)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            done();
          }
        });
    });

    it('Should reply an error if tag id is bad', function (done) {
      apiSrv
        .post('/v1/tags/toto/subscription')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + token1.token)
        .expect(404)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            done();
          }
        });
    });

    it('Should reply an error if user is already subscribed to the tag', function (done) {
      apiSrv
        .post('/v1/tags/' + tag1.id + '/subscription')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + token1.token)
        .expect(400)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            done();
          }
        });
    });
  });

  describe('Testing get user subscription (GET /v1/tags/subscription)', function () {
    it('Should return user subscription', function (done) {
      apiSrv
        .get('/v1/tags/subscription')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + token1.token)
        .expect(200)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            expect(res.body).to.have.lengthOf(1);
            done();
          }
        });
    });
  });

  describe('Testing check user is subscribed (GET /v1/tags/:id/subscription)', function () {
    it('Should return true if user is already subscribed', function (done) {
      apiSrv
        .get('/v1/tags/' + tag1.id + '/subscription')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + token1.token)
        .expect(200)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            expect(res.body.result).to.be.true;
            done();
          }
        });
    });

    it('Should return false if user is not subscribed', function (done) {
      apiSrv
        .get('/v1/tags/' + tag2.id + '/subscription')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + token1.token)
        .expect(200)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            expect(res.body.result).to.be.false;
            done();
          }
        });
    });
  });

  describe('Testing unSubscription (DELETE /v1/tags/:id/subscription)', function () {
    it('Should unSubscribe user to the tag', function (done) {
      apiSrv
        .delete('/v1/tags/' + tag1.id + '/subscription')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + token1.token)
        .expect(200)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            expect(res.body.result).to.be.true;
            done();
          }
        });
    });

    it('Should retur an error id user is not subscribed to the tag', function (done) {
      apiSrv
        .delete('/v1/tags/' + tag1.id + '/subscription')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + token1.token)
        .expect(400)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            done();
          }
        });
    });
  });

  describe('Testing cast deletion (DELETE /v1/spredcasts/:id)', function () {
    it('Should return an error if user is not the creator', function (done) {
      apiSrv
        .delete('/v1/spredcasts/' + cast1.id)
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + token2.token)
        .expect(404)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            done();
          }
        });
    });

    it('Should delete the cast', function (done) {
      apiSrv
        .delete('/v1/spredcasts/' + cast1.id)
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + token1.token)
        .expect(200)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            expect(res.body.result).to.be.true;
            done();
          }
        });
    });
  });
});
