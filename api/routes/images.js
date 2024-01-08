const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, "./uploads")
    },
    filename: function(req, file, cb) {
        cb(null, new Date().toISOString().replace(/:/g, '-') + file.originalname)
    }
})

const upload = multer({storage: storage})

const Images = require('../models/images');


router.get('/', (req, res, next) => {
    Images.find()
    .select('image _id user title')
    .exec()
    .then(docs => {
        const response = {
            count: docs.length, 
            images: docs.map(doc => {
                return {
                    _id: doc._id,
                    image: doc.image,
                    title: doc.title,
                    user: doc.user,
                    request: {
                        url: 'http://localhost:3000/images/' + doc._id,
                        uploadUrl: 'http://localhost:3000/' + doc.image
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
 
router.post('/', upload.single('image'), async (req, res) => {     
    try {
         const user = new Images({
            _id: new mongoose.Types.ObjectId(),
            image: req.file.path,
            user: req.body.user,
            title: req.body.title
         });
         const createdImage = await user.save();
         res.status(201).send(createdImage);
    } catch (e) {
         res.status(400).send(e);
    }
   });

router.get('/:imageID', (req, res, next) => {
    const id = req.params.imageID;
    Images.findById(id)
    .select('image _id')
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

router.delete('/:imageID', (req, res, next) => {
    const id = req.params.imageID;
    Images.deleteOne({_id: id})
    .exec()
    .then( result => {
        res.status(200).json({
            result: result,
            request: {
                message: 'Successfully Deleted'
            }
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