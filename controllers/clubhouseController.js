const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const passport = require('../passport-config');
const bcrypt = require('bcryptjs');
const User = require('../models/user');

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

            res.redirect('/clubhouse/posts');
        }
    })
]

exports.posts = asyncHandler(async (req, res, next) => {
    res.render('posts', {
        title: 'Posts'
    })
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
