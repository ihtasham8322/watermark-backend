const User = require('../model/User');
const moment = require('moment');

const getAllUsers = async (req, res) => {
    const users = await User.find();
    if (!users) return res.status(204).json({ 'message': 'No users found' });
    res.json(users);
}

const deleteUser = async (req, res) => {
    if (!req?.body?.id) return res.status(400).json({ "message": 'User ID required' });
    const user = await User.findOne({ _id: req.body.id }).exec();
    if (!user) {
        return res.status(204).json({ 'message': `User ID ${req.body.id} not found` });
    }
    const result = await user.deleteOne({ _id: req.body.id });
    res.json(result);
}

const getUser = async (req, res) => {
    if (!req?.params?.id) return res.status(400).json({ "message": 'User ID required' });
    const user = await User.findOne({ _id: req.params.id }).exec();
    if (!user) {
        return res.status(204).json({ 'message': `User ID ${req.params.id} not found` });
    }
    res.json(user);
}

const updateUser = async (req, res) => {

    let userId = req.params.id
    if (!userId) return res.status(400).json({ "message": 'User ID required' });

    const user = await User.findOne({ _id: userId }).exec();
    if (!user) {
        return res.status(204).json({ 'message': `User ID ${userId} not found` });
    }

    let data = req?.body?.data || req.body;
    console.log("data",data)
    data = JSON.parse(data)
   

    //add image url to data if image is uploaded
    //the data can be sent as multipart/form-data or application/json and the data can have a sub-object with any key
    //if the data is sent as multipart/form-data, the image will be uploaded to the server and the image url will be added to the data
    //if the data is sent as application/json, the image will not be uploaded to the server and the image url will not be added to the data
    if (req?.file) {
        data = {
            ...data,
            imageUrl: req?.file?.path
        }
    }

    try {
   
        await User.updateOne(
            { _id: userId },
            {
                $set: {
                    ...data
                }
            }
        )
        console.log('User Updated!', userId);
      res.status(200).send({message: "updated",  "status": true});
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            error: "There was an error while processing your request!"
        })
    }

}

const deductCredits = async (userId) => {
    const user = await User.findOne({ _id: userId }).exec();

    if (!user) {
        return res.status(204).json({ 'message': `User ID ${userId} not found` });
    }

    try {
        user.credits -= 1;
        await user.save();
        console.log('User Updated!', userId);
        return 'OK'
    } catch (err) {
        console.log(err);
        return 'ERROR'
    }
}


module.exports = {
    getAllUsers,
    deleteUser,
    getUser,
    updateUser,
    deductCredits
}