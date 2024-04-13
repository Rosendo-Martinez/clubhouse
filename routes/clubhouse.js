const express = require('express');
const router = express.Router();
const controller = require("../controllers/clubhouseController");

router.get('/rules', controller.rules);

router.get('/sign-in', controller.sign_in_get);

router.post('/sign-in', controller.sign_in_post);

router.get('/sign-up', controller.sign_up_get);

router.post('/sign-up', controller.sign_up_post);

router.get('/posts', controller.posts);

router.get('/posts/create', controller.posts_create_get);

router.post('/posts/create', controller.posts_create_post);

router.get('/posts/:id', controller.posts_detail);

router.get('/users/:id', controller.users_detail);

router.get('/account', controller.account_get);

router.post('/account', controller.account_post);

router.get('/privilege', controller.privilege_get);

router.post('/privilege', controller.privilege_post);

module.exports = router;
