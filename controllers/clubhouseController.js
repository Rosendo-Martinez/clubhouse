const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const passport = require('../passport-config');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const Post = require("../models/post");
const { Admin, TrustedUser } = require('../classes/Passwords');
const user = require("../models/user");

async function checkThatUserIsAuthinticated(req, res, next) {
    if (req.user === undefined) {
        res.redirect('/clubhouse/sign-in');
    } else {
        next();
    }
}

async function addLocalsForAuthinticatedViews(req, res, next) {
    try {
        const users = await User.find({ _id: { $ne: req.user._id} }).exec();
        res.locals.user_list = users;
        res.locals.user = req.user;
        next()
    } catch (error) {
        next(error);
    }
}

exports.rules = asyncHandler(async (req, res, next) => {
    res.render('rules', {
        title: 'ClubHouse Rules'
    });
})

exports.sign_in_get = asyncHandler(async (req, res, next) => {
    if (req.user !== undefined) {
        return res.redirect('/clubhouse/posts');
    }
    
    res.render('sign-in', {
        title: 'Sign In'
    })
})

exports.sign_in_post = (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err); // handle error
    }
    if (!user) {
      // Authentication failed
      return res.status(401).render('sign-in', {
        error: info.message
      });
    }
    req.logIn(user, (loginErr) => {
        if (loginErr) {
          return next(loginErr); // handle login error
        }
        // Successfully authenticated
        return res.redirect('/clubhouse/posts');
    });
  })(req, res, next); // Note: This is immediately invoked.
}

exports.sign_up_get = asyncHandler(async (req, res, next) => {
    if (req.user !== undefined) {
        return res.redirect('/clubhouse/posts');
    }

    res.render('sign-up', {
        title: 'Sign Up'
    })
})

exports.sign_up_post = [
    body('username')
        .trim()
        .not().matches(/[<>&'"/]/, 'g')
        .withMessage('Username must not contain <, >, &, \', ", or / characters')
        .isLength({ min: 3 })
        .withMessage("Username must be minimum of 3 characters.")
        .isLength({ max: 12 })
        .withMessage("Username must be maximum of 12 characters.")
        .custom(async username => {
            const userWithUsername = await User.findOne({ username: username }).exec();

            if (userWithUsername) {
                throw new Error();
            }
        })
        .withMessage("Username is already registered with another account."),
    body('email')
        .trim()
        .not().matches(/[<>&'"/]/, 'g')
        .withMessage('Email must not contain <, >, &, \', ", or / characters')
        .isEmail()
        .withMessage('Email must be valid email.')
        .custom(async email => {
            const userWithEmail = await User.findOne({ email: email }).exec();

            if (userWithEmail) {
                throw new Error();
            }
        })
        .withMessage("Email is already registered with another account."),
    body('password')
        .trim()
        .isLength({ min: 4 })
        .withMessage("Password must be minimum of 4 characters.")
        .isLength({ max: 10 })
        .withMessage("Password must be maximum of 10 characters.")
        .customSanitizer(async password => {
            const SALT_LENGTH = 10;
            const salt = await bcrypt.genSalt(SALT_LENGTH);
            const hashedPassword = await bcrypt.hash(password, salt);

            return hashedPassword;
        }),
    body('description')
        .trim()
        .escape(),
    body('iconCharacters')
        .trim()
        .not().matches(/[<>&'"/]/, 'g')
        .withMessage('Icon character(s) must not contain <, >, &, \', ", or / characters')
        .isLength({ min: 1 })
        .withMessage("Icon character(s) must be minimum of 1 character.")
        .isLength({ max: 2 })
        .withMessage("Icon character(s) must be maximum of 2 characters."),
    body('iconColor')
        .trim()
        .notEmpty()
        .withMessage('Color is required.'),
    
    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);

        const user = new User({
            username: req.body.username,
            email: req.body.email,
            hashedPassword: req.body.password,
            description: req.body.description,
            iconCharacters: req.body.iconCharacters,
            iconColor: req.body.iconColor
        })

        if (!errors.isEmpty()) {
            res.render('sign-up', {
                title: 'Sign Up',
                user: user,
                error_list: errors.array()
            })
            return;
        } else {
            await user.save();

            req.login(user, function(err) {
                if (err) { return next(err); }
                return res.redirect('/clubhouse/posts');
            });
        }
    })
]

exports.posts = [
    checkThatUserIsAuthinticated,
    addLocalsForAuthinticatedViews,
    asyncHandler(async (req, res, next) => {
        res.render('posts', {
            title: 'Posts',
        });
    })
]

exports.posts_create_get = [
    checkThatUserIsAuthinticated,
    addLocalsForAuthinticatedViews,
    asyncHandler(async (req, res, next) => {
        if (!req.user.canMakePost()) {
            return res.redirect('/clubhouse/privilege');
        }

        res.render('post_form', {
            title: 'Create Post'
        })
    })
]

exports.posts_create_post = [
    checkThatUserIsAuthinticated,
    addLocalsForAuthinticatedViews, // Locals are ONLY USED when the view needs to be rerendered
    body('title')
        .trim()
        .isLength({ min: 2 })
        .withMessage("Post title must be minimum of 2 characters.")
        .isLength({ max: 30 })
        .withMessage("Post title must be maximum of 30 characters."),
    body('body')
        .trim()
        .isLength({ min: 10 })
        .withMessage("Post body must be minimum of 10 characters.")
        .isLength({ max: 300 })
        .withMessage("Post body must be maximum of 300 characters."),
    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);

        if (!req.user.canMakePost()) {
            return res.redirect('/clubhouse/privilege');
        }

        const post = req.user.createPost(req.body.title, req.body.body);

        if (!errors.isEmpty()) {
            res.render('post_form', {
                post: post,
                error_list: errors.array()
            });
        } else {
            await post.save();
            res.redirect(post.url);
        }
    })
]

exports.posts_detail = [
    checkThatUserIsAuthinticated,
    addLocalsForAuthinticatedViews,
    asyncHandler(async (req, res, next) => {
        const post = await Post.findById(req.params.id).populate('author').exec();

        if (!post) {
            return res.redirect('/clubhouse/posts'); // TODO: find better way to tell user that post was not found
        }

        res.render('post_details', {
            post: post
        })
    })
]

exports.users_detail = [
    checkThatUserIsAuthinticated,
    addLocalsForAuthinticatedViews,
    asyncHandler(async (req, res, next) => {
        const otherUser = await User.findById(req.params.id).exec();

        if (!otherUser) {
            res.redirect('/clubhouse/posts') // Not good way of handling user not found, TODO: fix this
        } else {
            res.render('user_details', {
                otherUser: otherUser
            });
        }
    })
]

exports.account_get = [
    checkThatUserIsAuthinticated,
    addLocalsForAuthinticatedViews,
    asyncHandler(async (req, res, next) => {

        res.render('account', {
            title: 'Account',
        });
    })
]

exports.account_post = [
    body('username')
        .trim()
        .not().matches(/[<>&'"/]/, 'g')
        .withMessage('Username must not contain <, >, &, \', ", or / characters')
        .isLength({ min: 3 })
        .withMessage("Username must be minimum of 3 characters.")
        .isLength({ max: 12 })
        .withMessage("Username must be maximum of 12 characters.")
        .custom(async (username, { req }) => {
            // Finds user, exluding the current authinticated user, with the given username
            const userWithUsername = await User.findOne({ username: username, _id: { $ne: req.user._id} }).exec();

            if (userWithUsername) {
                throw new Error();
            }
        })
        .withMessage("Username is already registered with another account."),
    body('password')
        .optional({ checkFalsy: true }) // skips validation if password is blank
        .isLength({ min: 4 })
        .withMessage("Password must be minimum of 4 characters.")
        .isLength({ max: 10 })
        .withMessage("Password must be maximum of 10 characters.")
        .customSanitizer(async password => {
            const SALT_LENGTH = 10;
            const salt = await bcrypt.genSalt(SALT_LENGTH);
            const hashedPassword = await bcrypt.hash(password, salt);

            return hashedPassword;
        }),
    body('description')
        .trim()
        .escape(),
    body('iconCharacters')
        .trim()
        .not().matches(/[<>&'"/]/, 'g')
        .withMessage('Icon character(s) must not contain <, >, &, \', ", or / characters')
        .isLength({ min: 1 })
        .withMessage("Icon character(s) must be minimum of 1 character.")
        .isLength({ max: 2 })
        .withMessage("Icon character(s) must be maximum of 2 characters."),
    body('iconColor')
        .trim()
        .notEmpty()
        .withMessage('Color is required.'),

    asyncHandler(async (req, res, next) => { 
        const errors = validationResult(req);

        const userUpdates = {
            username: req.body.username,
            hashedPassword: req.body.password ? req.body.password : req.user.hashedPassword,
            description: req.body.description,
            iconCharacters: req.body.iconCharacters,
            iconColor: req.body.iconColor,
        };

        if (!errors.isEmpty()) {
            return res.render('account', {
                title: 'Account',
                user: req.user,
                user_updates: userUpdates,
                user_list: [],
                error_list: errors.array()
            });
        } else {
            await User.findByIdAndUpdate(req.user._id, userUpdates);

            return res.redirect('/clubhouse/account');
        }
    })
]

exports.privilege_get = [
    checkThatUserIsAuthinticated,
    addLocalsForAuthinticatedViews,
    asyncHandler(async (req, res, next) => {
        if (req.user.isAdmin) {
            res.redirect('/clubhouse/account');
        } else {
            res.render('privilege', {
                privilege: req.user.isTrusted ? 'admin' : 'trust',
            });
        }
    })
]

exports.privilege_post = [
    checkThatUserIsAuthinticated,
    addLocalsForAuthinticatedViews, // Locals are ONLY USED when the view needs to be rerendered
    asyncHandler(async (req, res, next) => {

        let isGuessCorrect;
        if (req.body.privilege === "trust") {
            isGuessCorrect = TrustedUser.guessPassword(req.body.password);
        } else {
            isGuessCorrect = Admin.guessPassword(req.body.password);
        }

        if (isGuessCorrect) {
            if (req.body.privilege === "trust") {
                req.user.isTrusted = true;
            } else {
                req.user.isAdmin = true;
            }
            await req.user.save();
            res.redirect('/clubhouse/account');
        } else {
            res.render('privilege', {
                privilege: req.body.privilege,
                error: `The password you entered is incorrect! You are denied ${req.body.privilege} privilege.`
            })
        }
    })
]
