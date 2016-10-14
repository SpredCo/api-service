const config = require('config');
const expect = require('chai').expect;
const supertest = require('supertest');
const fixture = require('../fixture/inbox.json');
const common = require('spred-common');

const url = config.get('test.server.url') + ':' + config.get('test.server.port');
const apiSrv = supertest(url);

var user1;
var user2;
var user3;
var token1;
var token2;
var token3;
var conv;
var msg;

describe('Testing inbox routes (/v1/inbox/*)', function () {
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
                                user1 = cUser1;
                                user2 = cUser2;
                                user3 = cUser3;
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

  it('Get current empty inbox (GET /v1/inbox)', function (done) {
    apiSrv
      .get('/v1/inbox/conversation')
      .set('Content-Type', 'application/json')
      .set('Authorization', 'Bearer ' + token1.token)
      .expect(200)
      .end(function (err, res) {
        if (err) {
          done(err);
        } else {
          expect(res.body).to.be.an.array;
          expect(res.body).to.have.lengthOf(0);
          done();
        }
      });
  });

  describe('Testing conversation creation (POST /v1/inbox/conversation)', function () {
    it('Should reply an error with missing parameters', function (done) {
      apiSrv
        .post('/v1/inbox/conversation')
        .send({ 'object': fixture.object, 'content': fixture.content1 })
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + token1.token)
        .expect(400)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            expect(res.body.code).to.equal(1);
            done();
          }
        });
    });

    it('Should reply an error with members parameter is a string', function (done) {
      apiSrv
        .post('/v1/inbox/conversation')
        .send({ 'object': fixture.object, 'content': fixture.content1, 'members': 'test' })
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + token1.token)
        .expect(400)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            expect(res.body.code).to.equal(1);
            done();
          }
        });
    });

    it('Should replay an error with members array filled with duplicate value', function (done) {
      apiSrv
        .post('/v1/inbox/conversation')
        .send({ 'object': fixture.object, 'content': fixture.content1, 'members': ['aaaaaaaaaaaa', 'aaaaaaaaaaaa'] })
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + token1.token)
        .expect(400)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            expect(res.body.code).to.equal(1);
            done();
          }
        });
    });

    it('Should replay an error with members array filled with invalid value', function (done) {
      apiSrv
        .post('/v1/inbox/conversation')
        .send({ 'object': fixture.object, 'content': fixture.content1, 'members': [user1._id, 'aaaaaaaaaaaa'] })
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + token1.token)
        .expect(404)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            expect(res.body.code).to.equal(2);
            expect(res.body.code).to.equal(2);
            done();
          }
        });
    });

    it('Should replay an error with members array filled without current user', function (done) {
      apiSrv
        .post('/v1/inbox/conversation')
        .send({ 'object': fixture.object, 'content': fixture.content1, 'members': [user2._id, user3._id] })
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + token1.token)
        .expect(400)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            expect(res.body.code).to.equal(1);
            done();
          }
        });
    });

    it('Should create and reply the new conversation', function (done) {
      apiSrv
        .post('/v1/inbox/conversation')
        .send({ 'object': fixture.object, 'content': fixture.content1, 'members': [user1._id, user2._id] })
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + token1.token)
        .expect(201)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            expect(res.body.object).to.equal(fixture.object);
            expect(res.body.can_answer).to.be.true;
            expect(res.body.members).to.have.lengthOf(2);
            expect(res.body.id).to.not.be.undefined;
            expect(res.body.msg).to.not.be.undefined;
            expect(res.body.msg.id).to.not.be.undefined;
            expect(res.body.msg.from).to.be.eql(user1._id.toString());
            expect(res.body.msg.content).to.be.equal(fixture.content1);
            expect(res.body.msg.read).to.be.true;
            done();
          }
        });
    });
  });

  describe('Testing get inbox (GET /v1/inbox)', function () {
    it('Get current user1 inbox', function (done) {
      apiSrv
        .get('/v1/inbox/conversation')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + token1.token)
        .expect(200)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            expect(res.body).to.be.an.array;
            expect(res.body).to.have.lengthOf(1);
            expect(res.body[0].object).to.equal(fixture.object);
            expect(res.body[0].members).to.have.lengthOf(2);
            expect(res.body[0].read).to.be.true;
            conv = res.body[0];
            done();
          }
        });
    });

    it('Get current user2 inbox', function (done) {
      apiSrv
        .get('/v1/inbox/conversation')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + token2.token)
        .expect(200)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            expect(res.body).to.be.an.array;
            expect(res.body).to.have.lengthOf(1);
            expect(res.body[0].object).to.equal(fixture.object);
            expect(res.body[0].members).to.have.lengthOf(2);
            expect(res.body[0].read).to.be.false;
            done();
          }
        });
    });

    it('Get current user3 inbox', function (done) {
      apiSrv
        .get('/v1/inbox/conversation')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + token3.token)
        .expect(200)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            expect(res.body).to.be.an.array;
            expect(res.body).to.have.lengthOf(0);
            done();
          }
        });
    });
  });

  describe('Testing get unread message count (GET /v1/inbox/unread)', function () {
    it('Should reply the number of unread message', function (done) {
      apiSrv
        .get('/v1/inbox/unread')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + token1.token)
        .expect(200)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            expect(res.body.result).to.equal(0);
            done();
          }
        });
    });

    it('Should reply the number of unread message', function (done) {
      apiSrv
        .get('/v1/inbox/unread')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + token2.token)
        .expect(200)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            expect(res.body.result).to.equal(1);
            done();
          }
        });
    });
  });

  describe('Testing get conversation (GET /v1/inbox/conversation/:id)', function () {
    it('Should reply an error if id is invalid', function (done) {
      apiSrv
        .get('/v1/inbox/conversation/ghj')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + token1.token)
        .expect(404)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            expect(res.body.code).to.equal(3);
            expect(res.body.sub_code).to.equal(1);
            done();
          }
        });
    });

    it('Should reply an error if conversation does not exist', function (done) {
      apiSrv
        .get('/v1/inbox/conversation/aaaaaaaaaaaa')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + token1.token)
        .expect(404)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            expect(res.body.code).to.equal(3);
            expect(res.body.sub_code).to.equal(1);
            done();
          }
        });
    });

    it('Should reply an error if member is not part of the conversation', function (done) {
      apiSrv
        .get('/v1/inbox/conversation/' + conv.id)
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + token3.token)
        .expect(404)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            expect(res.body.code).to.equal(3);
            expect(res.body.sub_code).to.equal(1);
            done();
          }
        });
    });

    it('Should reply the conversation object with messages', function (done) {
      apiSrv
        .get('/v1/inbox/conversation/' + conv.id)
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + token1.token)
        .expect(200)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            expect(res.body.object).to.equal(fixture.object);
            expect(res.body.members).to.have.lengthOf(2);
            expect(res.body.msg).to.be.an.array;
            expect(res.body.msg).to.have.lengthOf(1);
            expect(res.body.msg[0].from).to.equal(user1._id.toString());
            expect(res.body.msg[0].content).to.equal(fixture.content1);
            expect(res.body.msg[0].read).to.be.true;
            msg = res.body.msg[0];
            done();
          }
        });
    });
  });

  describe('Testing get message (GET /v1/inbox/conversation/:id/message/:id', function () {
    it('Should reply an error if conversation id is invalid', function (done) {
      apiSrv
        .get('/v1/inbox/conversation/ghj/message/' + msg.id)
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + token1.token)
        .expect(404)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            expect(res.body.code).to.equal(3);
            expect(res.body.sub_code).to.equal(1);
            done();
          }
        });
    });

    it('Should reply an error if conversation does not exist', function (done) {
      apiSrv
        .get('/v1/inbox/conversation/aaaaaaaaaaaa/message/' + msg.id)
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + token1.token)
        .expect(404)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            expect(res.body.code).to.equal(3);
            expect(res.body.sub_code).to.equal(1);
            done();
          }
        });
    });

    it('Should reply an error if member is not part of the conversation', function (done) {
      apiSrv
        .get('/v1/inbox/conversation/' + conv.id + '/message/' + msg.id)
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + token3.token)
        .expect(404)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            expect(res.body.code).to.equal(3);
            expect(res.body.sub_code).to.equal(1);
            done();
          }
        });
    });

    it('Should reply an error if message id is not valid', function (done) {
      apiSrv
        .get('/v1/inbox/conversation/' + conv.id + '/message/dzdz')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + token1.token)
        .expect(404)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            expect(res.body.code).to.equal(4);
            expect(res.body.sub_code).to.equal(1);
            done();
          }
        });
    });

    it('Should reply an error if message does not exist', function (done) {
      apiSrv
        .get('/v1/inbox/conversation/' + conv.id + '/message/aaaaaaaaaaaa')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + token1.token)
        .expect(404)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            expect(res.body.code).to.equal(4);
            expect(res.body.sub_code).to.equal(1);
            done();
          }
        });
    });
    it('Should reply the message object', function (done) {
      apiSrv
        .get('/v1/inbox/conversation/' + conv.id + '/message/' + msg.id)
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + token1.token)
        .expect(200)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            expect(res.body.id).to.equal(msg.id);
            expect(res.body.content).to.equal(msg.content);
            expect(res.body.from).to.eql(user1._id.toString());
            done();
          }
        });
    });
  });

  describe('Testing reply message (POST /v1/inbox/conversation/:id/message)', function () {
    it('Should reply an error if conversation id is invalid', function (done) {
      apiSrv
        .post('/v1/inbox/conversation/ghj/message')
        .send({ content: fixture.content2 })
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + token1.token)
        .expect(404)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            expect(res.body.code).to.equal(3);
            expect(res.body.sub_code).to.equal(1);
            done();
          }
        });
    });

    it('Should reply an error if conversation does not exist', function (done) {
      apiSrv
        .post('/v1/inbox/conversation/aaaaaaaaaaaa/message')
        .send({ content: fixture.content2 })
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + token1.token)
        .expect(404)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            expect(res.body.code).to.equal(3);
            expect(res.body.sub_code).to.equal(1);
            done();
          }
        });
    });

    it('Should reply an error if member is not part of the conversation', function (done) {
      apiSrv
        .post('/v1/inbox/conversation/' + conv.id + '/message')
        .send({ content: fixture.content2 })
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + token3.token)
        .expect(404)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            expect(res.body.code).to.equal(3);
            expect(res.body.sub_code).to.equal(1);
            done();
          }
        });
    });

    it('Should reply an error if body is incomplete', function (done) {
      apiSrv
        .post('/v1/inbox/conversation/' + conv.id + '/message')
        .send({ content: fixture.content2 })
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + token1.token)
        .expect(201)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            expect(res.body.content).to.equal(fixture.content2);
            expect(res.body.from).to.eql(user1._id.toString());
            expect(res.body.read).to.be.true;
            done();
          }
        });
    });
  });

  describe('Testing read message (POST /v1/inbox/conversation/:id/message/:id/read)', function () {
    it('Should reply an error if conversation id is invalid', function (done) {
      apiSrv
        .post('/v1/inbox/conversation/ghj/message/' + msg.id + '/read')
        .send({ read: true })
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + token1.token)
        .expect(404)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            expect(res.body.code).to.equal(3);
            expect(res.body.sub_code).to.equal(1);
            done();
          }
        });
    });

    it('Should reply an error if conversation does not exist', function (done) {
      apiSrv
        .post('/v1/inbox/conversation/aaaaaaaaaaaa/message/' + msg.id + '/read')
        .send({ read: true })
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + token1.token)
        .expect(404)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            expect(res.body.code).to.equal(3);
            expect(res.body.sub_code).to.equal(1);
            done();
          }
        });
    });

    it('Should reply an error if member is not part of the conversation', function (done) {
      apiSrv
        .post('/v1/inbox/conversation/' + conv.id + '/message/' + msg.id + '/read')
        .send({ read: true })
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + token3.token)
        .expect(404)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            expect(res.body.code).to.equal(3);
            expect(res.body.sub_code).to.equal(1);
            done();
          }
        });
    });

    it('Should reply an error if message id is not valid', function (done) {
      apiSrv
        .post('/v1/inbox/conversation/' + conv.id + '/message/azfez/read')
        .send({ read: true })
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + token1.token)
        .expect(404)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            expect(res.body.code).to.equal(4);
            expect(res.body.sub_code).to.equal(1);
            done();
          }
        });
    });

    it('Should reply an error if message does not exist', function (done) {
      apiSrv
        .post('/v1/inbox/conversation/' + conv.id + '/message/aaaaaaaaaaaa/read')
        .send({ read: true })
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + token1.token)
        .expect(404)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            expect(res.body.code).to.equal(4);
            expect(res.body.sub_code).to.equal(1);
            done();
          }
        });
    });

    it('Should reply an error if body is incorrect', function (done) {
      apiSrv
        .post('/v1/inbox/conversation/' + conv.id + '/message/' + msg.id + '/read')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + token1.token)
        .expect(400)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            expect(res.body.code).to.equal(1);
            done();
          }
        });
    });

    it('Should update the read state of the message', function (done) {
      apiSrv
        .post('/v1/inbox/conversation/' + conv.id + '/message/' + msg.id + '/read')
        .send({ read: true })
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + token2.token)
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
  });

  describe('Testing read message (POST /v1/inbox/conversation/:id/read)', function () {
    it('Should reply an error if conversation id is invalid', function (done) {
      apiSrv
        .post('/v1/inbox/conversation/ghj/read')
        .send({ read: true })
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + token1.token)
        .expect(404)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            expect(res.body.code).to.equal(3);
            expect(res.body.sub_code).to.equal(1);
            done();
          }
        });
    });

    it('Should reply an error if conversation does not exist', function (done) {
      apiSrv
        .post('/v1/inbox/conversation/aaaaaaaaaaaa/read')
        .send({ read: true })
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + token1.token)
        .expect(404)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            expect(res.body.code).to.equal(3);
            expect(res.body.sub_code).to.equal(1);
            done();
          }
        });
    });

    it('Should reply an error if member is not part of the conversation', function (done) {
      apiSrv
        .post('/v1/inbox/conversation/' + conv.id + '/read')
        .send({ read: true })
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + token3.token)
        .expect(404)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            expect(res.body.code).to.equal(3);
            expect(res.body.sub_code).to.equal(1);
            done();
          }
        });
    });

    it('Should reply an error if body is incorrect', function (done) {
      apiSrv
        .post('/v1/inbox/conversation/' + conv.id + '/read')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + token1.token)
        .expect(400)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            expect(res.body.code).to.equal(1);
            done();
          }
        });
    });

    it('Should update the read state of the message', function (done) {
      apiSrv
        .post('/v1/inbox/conversation/' + conv.id + '/read')
        .send({ read: true })
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + token2.token)
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
  });
});
