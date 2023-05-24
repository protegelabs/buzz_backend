const express = require('express');
const router = express.Router();
const passport = require('passport');
const LocalStrategy = require('passport-local');
const catchAsync = require('../utils/catchAsync')
const { request } = require('express');
const posts = require('../controllers/posts')

router.route('/posts')
    .get(posts.getAllPosts)

router.route('/host/post')
    .get(posts.getPost)
    .post(posts.createPost)
    .put(posts.editPost)

router.route('/host/allposts')
    .get(posts.getHostPosts)

router.route('/delete/post')
    .put(posts.deletePost)


module.exports = router;