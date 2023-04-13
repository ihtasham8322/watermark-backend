const express = require('express');
const router = express.Router();
const usersController = require('../../controllers/usersController');
const ROLES_LIST = require('../../config/roles_list');
const verifyRoles = require('../../middleware/verifyRoles');
const multer = require('multer')
const fs = require('fs');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
       console.log("fewfds",req.body)
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
var upload = multer({ storage: storage })

router.route('/')
    .get(verifyRoles(ROLES_LIST.Admin), usersController.getAllUsers)
    //.get(verifyRoles(ROLES_LIST.Admin), usersController.getAllUsers)
    .delete(verifyRoles(ROLES_LIST.Admin), usersController.deleteUser);

router.route('/me')
    .get(verifyRoles(ROLES_LIST.User), usersController.getUser);

router.route('/:id')
    .get(verifyRoles(ROLES_LIST.User), usersController.getUser)
    .patch(verifyRoles(ROLES_LIST.User), upload.single('file'), usersController.updateUser);

module.exports = router;