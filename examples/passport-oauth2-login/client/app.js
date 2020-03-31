// Copyright IBM Corp. 2014,2015. All Rights Reserved.
// Node module: loopback-example-passport
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const express = require('express');
const session = require('client-sessions');
const path = require('path');
const app = (module.exports = express());

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(
  session({
    cookieName: 'session',
    secret: 'random_string_goes_here',
    duration: 30 * 60 * 1000,
    activeDuration: 5 * 60 * 1000,
  }),
);

app.use(function (req, res, next) {
  if (req.session && req.session.user) {
    req.user = req.session.user;
    next();
  } else {
    next();
  }
});

function requireLogin(req, res, next) {
  if (!req.user) {
    res.redirect('/login');
  } else {
    next();
  }
}

app.get('/', function (req, res, next) {
  res.render('pages/index', {user: req.user, url: req.url});
});

app.get('/auth/account', requireLogin, function (req, res, next) {
  res.render('pages/loginProfiles', {
    user: req.user,
    url: req.url,
  });
});

app.get('/login', function (req, res, next) {
  res.render('pages/login', {
    user: req.user,
    url: req.url,
  });
});
