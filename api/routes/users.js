const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const upload = multer({dest: '/uploads/'})

const User = require('../models/users');

router.get('/', (req, res, next) => {
    User.find()
    .select('user pass _id')
    .exec()
    .then(docs => {
        const response = {
            count: docs.length,
            users: docs.map(docs => {
                return {
                    user: docs.user,
                    pass: docs.pass,
                    _id: docs._id,
                    request: {
                        url: 'http://localhost:3000/users/' + docs._id
                    }
                }
            })
        }
        res.status(200).json(response);
    })
    .catch(err => {
        console.log(err)
        res.status(404).json(err)
    })
});

router.post('/signup', async (req, res, next) => {
    const username = req.body.user;
    const existingUser = await User.findOne({ user: username });

    if (existingUser) {
        return res.status(409).json({
            message: 'Username already in use!'
        });
    }

    const user = new User({
        _id: new mongoose.Types.ObjectId(),
        user: req.body.user,
        pass: req.body.pass
    });

    // potentially have to add some sort of encryption to the password created by the user 

    user.save()
        .then(result => {
            console.log(result);
            res.status(200).json({
                message: 'Created User!',
                createdUser: {
                    user: result.user,
                    pass: result.pass,
                    _id: result._id
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

router.post('/login', async (req, res, next) => {
    User.find({user: req.body.user})
    .exec()
    .then(user => {
        if (user.length < 1) {
            return res.status(401).json({
                message: 'Invalid username or password'
            })
        }
        const password = req.body.pass

        if (password == user[0].pass) {
            return res.status(200).json({
                message: 'Sucessfully Logged In'
            })
        } else {
            return res.status(401).json({
                message: 'Invalid username or password'
            })
        }
    })
    .catch()
});


router.get('/:userID', (req, res, next) => {
    const id = req.params.userID;
    User.findById(id)
    .exec()
    .then(doc => {
        console.log(doc);
        if (doc) {
            res.status(200).json(doc);
        } else {
            res.status(404).json({
                message: "Nothing Found"
            })
        }
        
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({error: err})
    })
})


router.delete('/:userID', (req, res, next) => {
    const id = req.params.userID;
    User.deleteOne({_id: id})
    .exec()
    .then( result => {
        res.status(200).json({
            message: 'User Deleted!'
        })
    })
    .catch(err => {
        console.log(err)
        res.status(500).json({
            error: err
        })
    })
})

module.exports = router;