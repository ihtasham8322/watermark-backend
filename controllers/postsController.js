const Post = require('../model/Post');
const moment = require('moment');
const { deductCredits } = require('./usersController');
const addLogos = require('../functions/addLogo');
const User = require('../model/User');

const getAllPosts = async (req, res) => {
    const posts = await Post.find({
        userId: req?.params?.userId
    });
  
    if (!posts) return res.status(204).json({ 'message': 'No posts found' });
    res.json(posts);
}

const createPost = async (req, res) => {

    try {

        const userId = req?.params?.userId;
        if (!userId) return res.status(400).json({ "message": 'User ID required' });
   
        let { title, uploadType, uploadDate, platforms } = req.body;
        console.log(title, uploadType, uploadDate, platforms)
        const file = req?.file; //destination filename
        
        if (!uploadDate && uploadType === 'NOW') {
            uploadDate = moment().format('DD/MM/YYYY');
        } else {
            //format date for mongodb
            uploadDate = moment(uploadDate, 'DD/MM/YYYY').format('YYYY-MM-DD[T]HH:mm:ss');
        }
       
        platforms = platforms.split(',')
        console.log( title, uploadType, uploadDate, platforms)
        await Post.create({
            userId,
            title,
            uploadType,
            uploadDate,
            platforms,
            imageUrl: file?.path
        });

        //get brand details from user only website, address and phone number

        let { brandDetails } = await User.findOne({
            _id: userId
        }).select('brandDetails').exec();

        await addLogos({
            imageName: file?.filename,
            userId,
            brandDetails
        })

        deductCredits(userId)

        res.json({ 'message': 'Post created' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ 'message': 'Internal server error' });
    }
}

const getPost = async (req, res) => {
    if (!req?.params?.id) return res.status(400).json({ "message": 'Post ID required' });
    const post = await Post.findOne({ _id: req.params.id }).exec();
    if (!post) {
        return res.status(204).json({ 'message': `Post ID ${req.params.id} not found` });
    }
    res.json(post);
}

const updatePost = async (req, res) => {
}

const deletePost = async (req, res) => {
}

module.exports = {
    getAllPosts,
    createPost,
    getPost,
    updatePost,
    deletePost
}