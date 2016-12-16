const config = require('config');
const expect = require('chai').expect;
const supertest = require('supertest');
const fixture = require('../fixture/user.json');
const common = require('spred-common');

const url = config.get('test.server.url') + ':' + config.get('test.server.port');
const apiSrv = supertest(url);

var user1;
var user2;

describe('Testing user routes /v1/users/*', function () {
  before(function (done) {
    common.clientModel.createFix(fixture.client.name, fixture.client.key, fixture.client.secret, function (err, cClient) {
      if (err) {
        done(err);
      } else {
        common.userModel.createPassword(fixture.user1.email, fixture.user1.password, fixture.user1.pseudo, fixture.user1.first_name, fixture.user1.last_name, function (err, cUser1) {
          if (err) {
            done(err);
          } else {
            common.userModel.createFacebook(fixture.user2.email, fixture.user2.facebookId, fixture.user2.pseudo, fixture.user2.first_name, fixture.user2.last_name, '', function (err, cUser2) {
              if (err) {
                done(err);
              } else {
                common.userModel.createPassword(fixture.user3.email, fixture.user3.password, fixture.user3.pseudo, fixture.user3.first_name, fixture.user3.last_name, function (err) {
                  if (err) {
                    done(err);
                  } else {
                    common.accessTokenModel.createFix(cClient, cUser1, fixture.token1, function (err) {
                      if (err) {
                        done(err);
                      } else {
                        common.accessTokenModel.createFix(cClient, cUser2, fixture.token2, function (err) {
                          if (err) {
                            done(err);
                          } else {
                            user1 = cUser1;
                            user2 = cUser2;
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
  });

  describe('Testing get user information (GET /v1/users/:id)', function () {
    it('Should reply current user information (/me)', function (done) {
      apiSrv
        .get('/v1/users/me')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + fixture.token1)
        .expect(200)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            expect(res.body.id).to.eql(user1._id.toString());
            expect(res.body.email).to.equal(user1.email);
            expect(res.body.first_name).to.equal(user1.firstName);
            expect(res.body.last_name).to.equal(user1.lastName);
            expect(res.body.picture_url).to.equal(user1.pictureUrl);
            done();
          }
        });
    });

    it('Should reply user2 information', function (done) {
      apiSrv
        .get('/v1/users/' + user2._id)
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + fixture.token1)
        .expect(200)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            expect(res.body.id).to.eql(user2._id.toString());
            expect(res.body.email).to.equal(user2.email);
            expect(res.body.first_name).to.equal(user2.firstName);
            expect(res.body.last_name).to.equal(user2.lastName);
            expect(res.body.picture_url).to.equal(user2.pictureUrl);
            done();
          }
        });
    });

    it('Should reply user2 information if param is @user2pseudo', function (done) {
      apiSrv
        .get('/v1/users/@' + user2.pseudo)
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + fixture.token1)
        .expect(200)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            expect(res.body.id).to.eql(user2._id.toString());
            expect(res.body.email).to.equal(user2.email);
            expect(res.body.first_name).to.equal(user2.firstName);
            expect(res.body.last_name).to.equal(user2.lastName);
            expect(res.body.picture_url).to.equal(user2.pictureUrl);
            done();
          }
        });
    });

    it('Should reply userNotFound when bad id', function (done) {
      apiSrv
        .get('/v1/users/toto')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + fixture.token1)
        .expect(404)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            expect(res.body.code).to.equal(2);
            expect(res.body.sub_code).to.equal(1);
            expect(res.body.message).to.equal('Unable to find user');
            done();
          }
        });
    });

    it('Should reply authentication error when missing access token', function (done) {
      apiSrv
        .get('/v1/users/me')
        .set('Content-Type', 'application/json')
        .expect(401)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            expect(res.text).to.equal('Unauthorized');
            done();
          }
        });
    });

    it('Should reply authentication error when bad access token', function (done) {
      apiSrv
        .get('/v1/users/toto')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer Hello')
        .expect(401)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            expect(res.text).to.equal('Unauthorized');
            done();
          }
        });
    });
  });

  describe('Testing update user information (PATCH /v1/users/me)', function () {
    it('Should update user information', function (done) {
      apiSrv
        .patch('/v1/users/me')
        .send({ email: fixture.user1n.email, pseudo: fixture.user1n.pseudo, first_name: fixture.user1n.first_name, last_name: fixture.user1n.last_name, picture_url: fixture.user1n.picture_url })
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + fixture.token1)
        .expect(200)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            common.userModel.getById(user1._id, function (err, fUser) {
              if (err) {
                done(err);
              } else {
                expect(fUser.email).to.equal(fixture.user1n.email);
                expect(fUser.firstName).to.equal(fixture.user1n.first_name);
                expect(fUser.lastName).to.equal(fixture.user1n.last_name);
                expect(fUser.pictureUrl).to.equal(fixture.user1n.picture_url);
                expect(res.body.email).to.equal(fixture.user1n.email);
                expect(res.body.first_name).to.equal(fixture.user1n.first_name);
                expect(res.body.last_name).to.equal(fixture.user1n.last_name);
                expect(res.body.picture_url).to.equal(fixture.user1n.picture_url);
                done();
              }
            });
          }
        });
    });

    it('Should reply an error when updating email address used', function (done) {
      apiSrv
        .patch('/v1/users/me')
        .send({ email: fixture.user1n.email, first_name: fixture.user1n.first_name, last_name: fixture.user1n.last_name, picture_url: fixture.user1n.picture_url })
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + fixture.token2)
        .expect(400)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            expect(res.body.code).to.eql(2);
            expect(res.body.sub_code).to.eql(3);
            done();
          }
        });
    });

    it('Should reply error when trying to update email for a facebook account', function (done) {
      apiSrv
        .patch('/v1/users/me')
        .send({ email: fixture.user1n.email, first_name: fixture.user1n.first_name, last_name: fixture.user1n.last_name })
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + fixture.token2)
        .expect(400)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            expect(res.body.code).to.equal(2);
            expect(res.body.sub_code).to.equal(3);
            expect(res.body.message).to.equal('Impossible to update email address with an external api login');
            done();
          }
        });
    });
  });

  describe('Testing user search (GET /v1/users/search/:partial_email', function () {
    it('Should reply research result', function (done) {
      apiSrv
        .get('/v1/users/search/email/z')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + fixture.token1)
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

    it('Should reply research result', function (done) {
      apiSrv
        .get('/v1/users/search/email/' + fixture.user1n.email)
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + fixture.token1)
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

    it('Should reply research result', function (done) {
      apiSrv
        .get('/v1/users/search/email/toto')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + fixture.token1)
        .expect(200)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            expect(res.body).to.have.lengthOf(0);
            done();
          }
        });
    });
  });

  describe('Testing user search by pseudo (GET /v1/users/search/:partial_pseudo', function () {
    it('Should reply research result', function (done) {
      apiSrv
        .get('/v1/users/search/pseudo/z')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + fixture.token1)
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

    it('Should reply research result', function (done) {
      apiSrv
        .get('/v1/users/search/pseudo/' + fixture.user1n.pseudo)
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + fixture.token1)
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

    it('Should reply research result', function (done) {
      apiSrv
        .get('/v1/users/search/pseudo/toto')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + fixture.token1)
        .expect(200)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            expect(res.body).to.have.lengthOf(0);
            done();
          }
        });
    });
  });

  describe('Testing user follow (POST /v1/users/:id/follow)', function () {
    it('Should follow the user', function (done) {
      apiSrv
        .post('/v1/users/' + user2._id + '/follow')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + fixture.token1)
        .expect(201)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            expect(res.body.user).to.not.be.undefined;
            expect(res.body.following).to.not.be.undefined;
            expect(res.body.created_at).to.not.be.undefined;
            done();
          }
        });
    });

    it('Should reply an error if user already follow the user', function (done) {
      apiSrv
        .post('/v1/users/' + user2._id + '/follow')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + fixture.token1)
        .expect(400)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            expect(res.body.code).to.equal(2);
            expect(res.body.sub_code).to.equal(4);
            expect(res.body.message).to.equal('Already following this user');
            done();
          }
        });
    });

    it('Should reply an error if invalid user id', function (done) {
      apiSrv
        .post('/v1/users/fefz/follow')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + fixture.token1)
        .expect(404)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            expect(res.body.code).to.equal(2);
            expect(res.body.sub_code).to.equal(1);
            expect(res.body.message).to.equal('Unable to find user');
            done();
          }
        });
    });
  });

  describe('Testing get user follow (GET /v1/users/follow)', function () {
    it('Should reply the list of follow', function (done) {
      apiSrv
        .get('/v1/users/follow')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + fixture.token1)
        .expect(200)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            expect(res.body).to.have.lengthOf(1);
            expect(res.body[0].user).to.equal(user1._id.toString());
            expect(res.body[0].following.id).to.equal(user2._id.toString());
            done();
          }
        });
    });
  });

  describe('Testing get user follower (GET /v1/users/follower)', function () {
    it('Should reply user following me', function (done) {
      apiSrv
        .get('/v1/users/follower')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + fixture.token2)
        .expect(200)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            expect(res.body).to.have.lengthOf(1);
            expect(res.body[0].user.id).to.equal(user1._id.toString());
            expect(res.body[0].following).to.equal(user2._id.toString());
            done();
          }
        });
    });
  });

  describe('Testing get user is follow (GET /v1/users/:id/follow)', function () {
    it('Should reply true if user is already following', function (done) {
      apiSrv
        .get('/v1/users/' + user2._id + '/follow')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + fixture.token1)
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

    it('Should reply true if user is already following', function (done) {
      apiSrv
        .get('/v1/users/' + user1._id + '/follow')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + fixture.token2)
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

  describe('Testing user unfollow (POST /v1/users/:id/unfollow)', function () {
    it('Should unfollow the user', function (done) {
      apiSrv
        .post('/v1/users/' + user2._id + '/unfollow')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + fixture.token1)
        .expect(200)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            done();
          }
        });
    });

    it('Should reply an error if user not following the user', function (done) {
      apiSrv
        .post('/v1/users/' + user2._id + '/unfollow')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + fixture.token1)
        .expect(400)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            expect(res.body.code).to.equal(2);
            expect(res.body.sub_code).to.equal(5);
            expect(res.body.message).to.equal('Not following this user');
            done();
          }
        });
    });

    it('Should reply an error if invalid user id', function (done) {
      apiSrv
        .post('/v1/users/fefz/unfollow')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + fixture.token1)
        .expect(404)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            expect(res.body.code).to.equal(2);
            expect(res.body.sub_code).to.equal(1);
            expect(res.body.message).to.equal('Unable to find user');
            done();
          }
        });
    });
  });

  describe('Testing user report (POST /v1/users/:id/report)', function () {
    it('Should reply ok', function (done) {
      apiSrv
        .post('/v1/users/' + user2._id + '/report')
        .send({ 'motif': 'nul' })
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + fixture.token1)
        .expect(201)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            expect(res.body.result).to.equal('ok');
            done();
          }
        });
    });

    it('Should reply an error if wrong user id', function (done) {
      apiSrv
        .post('/v1/users/fefz/report')
        .send({ 'motif': 'nul à chier' })
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + fixture.token1)
        .expect(404)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            expect(res.body.code).to.equal(2);
            expect(res.body.sub_code).to.equal(1);
            expect(res.body.message).to.equal('Unable to find user');
            done();
          }
        });
    });

    it('Should an error if trying to report himself', function (done) {
      apiSrv
        .post('/v1/users/' + user1._id + '/report')
        .send({ 'motif': 'nul' })
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + fixture.token1)
        .expect(400)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            expect(res.body.code).to.equal(1);
            expect(res.body.message).to.equal('Invalid request');
            done();
          }
        });
    });

    it('Should an error if no motif sent', function (done) {
      apiSrv
        .post('/v1/users/' + user2._id + '/report')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + fixture.token1)
        .expect(400)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            expect(res.body.code).to.equal(1);
            expect(res.body.message).to.equal('Invalid request');
            done();
          }
        });
    });
  });

  describe('Testing user deletion (DELETE /v1/users/me)', function () {
    it('Should delete the authenticated user', function (done) {
      apiSrv
        .delete('/v1/users/me')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + fixture.token1)
        .expect(200)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            common.userModel.getById(user1._id, function (err, fUser) {
              if (err) {
                done(err);
              } else {
                expect(fUser).to.be.null;
                done();
              }
            });
          }
        });
    });
  });
});
