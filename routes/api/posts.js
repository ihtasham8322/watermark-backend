const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');

const postsController = require('../../controllers/postsController');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        
        const dir = './uploads';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        cb(null, dir);
    },
    filename: function (req, file, cb) {
       
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });

router.route('/:userId')
    .get(postsController.getAllPosts)
    .post(upload.single('file'), postsController.createPost);

router.route('/:id')
    .get(postsController.getPost)
    .patch(postsController.updatePost)
    .delete(postsController.deletePost);

module.exports = router;