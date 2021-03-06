# Changelog

## 0.15.0

* Add subscription feed route

*guedjm, Wed Jan 04 2017 19:29:56 GMT+0100 (CET)*

---
## 0.14.0

* Add route for cast deletion

*guedjm, Tue Jan 03 2017 23:11:55 GMT+0100 (CET)*

---
## 0.13.1

* Fix inbox conversation creation

*guedjm, Mon Jan 02 2017 23:39:52 GMT+0100 (CET)*

---
## 0.13.0

* Add tagSubcription
* Add route GET /v1/tags/subsciption to get user subscription
* Add route GET /v1/tags/:id/subscription to check if user is already subscribed to the tag
* Add route POST /v1/tags/:id/subscription to subscribe user to the tag
* Add route DELETE /v1/tags/:id/subscription to unsuscribe user to the tag

*guedjm, Sat Dec 17 2016 13:21:02 GMT+0100 (CET)*

---
## 0.12.1

* Add route /v1/spredcast/remind to check if user has reminder on multiple cast

*guedjm, Sat Dec 17 2016 11:17:31 GMT+0100 (CET)*

---
## 0.12.0

* Integrate cast reminders

*guedjm, Fri Dec 16 2016 21:05:23 GMT+0100 (CET)*

---
## 0.11.0

* Move all route to get user information to login service (except GET /v1/users/me)

*guedjm, Fri Dec 16 2016 18:16:46 GMT+0100 (CET)*

---
## 0.10.2

* Add route GET /v1/users/follower to get who is following user

*guedjm, Fri Dec 16 2016 16:08:46 GMT+0100 (CET)*

---
## 0.10.1

* Fix docuementation

*guedjm, Fri Dec 16 2016 13:59:52 GMT+0100 (CET)*

---
## 0.10.0

* Add route /v1/users/follow to get user's follow
* Add route GET /v1/users/{id]/follow to know if user is following {id}
* Update route POST /v1/users/follow (now return a follow object)

*guedjm, Fri Dec 16 2016 13:42:06 GMT+0100 (CET)*

---
## 0.9.0

* Update all route from /v1/spredcast to /v1/spredcastS

*guedjm, Sun Dec 11 2016 23:25:57 GMT+0100 (CET)*

---
## 0.8.1

* Update doc

*guedjm, Sun Dec 11 2016 16:41:13 GMT+0100 (CET)*

---
## 0.8.0

* Integrate tags to spredcasts

*guedjm, Sun Dec 11 2016 15:51:50 GMT+0100 (CET)*

---
## 0.7.3

* Update create state reply 

*guedjm, Sat Nov 26 2016 14:58:38 GMT+0100 (CET)*

---
## 0.7.2

* presenter parameter is no longer required to get a cast token

*guedjm, Sun Nov 20 2016 14:08:19 GMT+0100 (CET)*

---
## 0.7.1

* Update documentation

*guedj_m, Fri Nov 18 2016 12:08:54 GMT+0100 (CET)*

---
## 0.7.0

* Integrate route to get user spredcast
* Code clean

*guedj_m, Fri Nov 18 2016 11:38:51 GMT+0100 (CET)*

---
## 0.6.2

* Add the url genration

*guedjm, Fri Nov 11 2016 14:34:39 GMT+0100 (CET)*

---
## 0.6.1

* Fix issue when user can get presenter right without being the creator of the cast

*guedj_m, Fri Nov 04 2016 18:10:18 GMT+0100 (CET)*

---
## 0.6.0

* Integrate spred cast managment

*guedj_m, Fri Nov 04 2016 17:15:56 GMT+0100 (CET)*

---
## 0.5.4

* Update read is now PATCH http method

*guedj_m, Sun Oct 16 2016 21:06:31 GMT+0200 (CEST)*

---
## 0.5.3

* Delete GET /v1/inbox route
* Add Get /v1/inbox/conversation route to get a list of user conversation
* Fix conversation order
* Fix message order
* Fix update conversation read
* Fix reply message

*guedj_m, Fri Oct 14 2016 12:48:18 GMT+0200 (CEST)*

---
## 0.5.2

* Fix documentation

*guedj_m, Thu Oct 13 2016 20:06:21 GMT+0200 (CEST)*

---
## 0.5.1

* Add route to get number of unread message
* Add route to change read status
* Fix get user information issue

*guedj_m, Sat Oct 08 2016 15:53:12 GMT+0200 (CEST)*

---
## 0.5.0

* Fix issues
* Add inbox update read route in doc
* Add get by partial pseudo route

*guedj_m, Thu Oct 06 2016 15:21:53 GMT+0200 (CEST)*

---
## 0.4.1

* Fix user update (pseudo field)

*guedj_m, Sun Oct 02 2016 17:03:37 GMT+0200 (CEST)*

---
## 0.4.0

* Integrate inbox !

*guedj_m, Sun Sep 25 2016 19:10:22 GMT+0200 (CEST)*

---
## 0.3.1

* Fix issue with object id

*guedj_m, Sun Sep 25 2016 12:16:22 GMT+0200 (CEST)*

---
## 0.3.0

* Add route to report user

*guedj_m, Wed Sep 14 2016 16:34:26 GMT+0200 (CEST)*

---
## 0.2.1

* Fix documentation

*guedj_m, Wed Sep 14 2016 15:23:57 GMT+0200 (CEST)*

---
## 0.2.0

* Add pseudo to user model
* Add follow route
* Add unfollow route

*guedj_m, Mon Sep 05 2016 18:23:33 GMT+0200 (CEST)*

---
## 0.1.0

* Create api skeleton
* Add user CRUD

*guedj_m, Tue Aug 23 2016 15:46:59 GMT+0200 (CEST)*

---
## 0.0.0

* Initial version

*guedj_m, Tue Aug 23 2016 15:39:07 GMT+0200 (CEST)*

---