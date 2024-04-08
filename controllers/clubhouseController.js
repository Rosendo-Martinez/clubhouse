const asyncHandler = require("express-async-handler");

exports.rules = asyncHandler(async (req, res, next) => {
    res.send('Rules not implemented.')
})

exports.sign_in_get = asyncHandler(async (req, res, next) => {
    res.send('Sign in GET not implemented.')
})

exports.sign_in_post = asyncHandler(async (req, res, next) => {
    res.send('Sign in POST not implemented.')
})

exports.sign_up_get = asyncHandler(async (req, res, next) => {
    res.send('Sign up GET not implemented.')
})

exports.sign_up_post = asyncHandler(async (req, res, next) => {
    res.send('Sign up POST not implemented.')
})

exports.posts = asyncHandler(async (req, res, next) => {
    res.send('Posts not implemented.')
})

exports.posts_create_get = asyncHandler(async (req, res, next) => {
    res.send('Posts create GET not implemented.')
})

exports.posts_create_post = asyncHandler(async (req, res, next) => {
    res.send('Posts create POSTS not implemented.')
})

exports.posts_detail = asyncHandler(async (req, res, next) => {
    res.send(`Posts detail not implemented. Post ID: ${req.params.id}`)
})

exports.users_detail = asyncHandler(async (req, res, next) => {
    res.send(`Users detail not implemented. User ID: ${req.params.id}`)
})

exports.account_get = asyncHandler(async (req, res, next) => {
    res.send('Account GET not implemented.')
})

exports.account_post = asyncHandler(async (req, res, next) => {
    res.send('Account POST not implemented.')
})

exports.privalage_get = asyncHandler(async (req, res, next) => {
    res.send('Privalage GET not implemented.')
})

exports.privalage_post = asyncHandler(async (req, res, next) => {
    res.send('Privalage POST not implemented.')
})
