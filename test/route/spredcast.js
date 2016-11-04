const config = require('config');
const expect = require('chai').expect;
const supertest = require('supertest');
const fixture = require('../fixture/spredcast.json');
const common = require('spred-common');

const url = config.get('test.server.url') + ':' + config.get('test.server.port');
const apiSrv = supertest(url);

var user2;
var token1;
var token2;
var token3;
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
                                user2 = cUser2;
                                token1 = cToken1;
                                token2 = cToken2;
                                token3 = cToken3;
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
  });

  describe('Testing spredcast creation (POST /v1/spredcast)', function () {
    it('Should create a public spredcast', function (done) {
      apiSrv
        .post('/v1/spredcast')
        .send({ name: fixture.cast1.name, description: fixture.cast1.description, is_public: fixture.cast1.is_public, date: fixture.cast1.date, tags: fixture.cast1.tags, user_capacity: fixture.cast1.user_capacity })
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
        .post('/v1/spredcast')
        .send({ name: fixture.cast2.name, description: fixture.cast2.description, is_public: fixture.cast2.is_public, date: new Date(), user_capacity: fixture.cast1.user_capacity, members: [ user2._id ] })
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + token1.token)
        .expect(201)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            expect(res.body.name).to.equal(fixture.cast2.name);
            expect(res.body.description).to.equal(fixture.cast2.description);
            expect(res.body.tags).to.have.lengthOf(0);
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
        .post('/v1/spredcast')
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
        .post('/v1/spredcast')
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

  describe('Testing cast token creation (POST /v1/spredcast/{id}/token) ', function () {
    it('Should create a cast token for the presenter', function (done) {
      apiSrv
        .post('/v1/spredcast/' + cast1.id + '/token')
        .send({ presenter: true })
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
        .post('/v1/spredcast/' + cast1.id + '/token')
        .send({ presenter: false })
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
        .post('/v1/spredcast/' + cast2.id + '/token')
        .send({ presenter: true })
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
        .post('/v1/spredcast/' + cast2.id + '/token')
        .send({ presenter: false })
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
        .post('/v1/spredcast/' + cast2.id + '/token')
        .send({ presenter: false })
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

    it('Should reply an error if body is empty', function (done) {
      apiSrv
        .post('/v1/spredcast/' + cast1.id + '/token')
        .send()
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + token3.token)
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
});