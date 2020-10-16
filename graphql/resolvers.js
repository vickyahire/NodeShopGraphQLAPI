const bcrypt = require('bcryptjs');
const validator = require('validator');
const User = require('../models/user');
const Post = require('../models/post');
const jwt = require('jsonwebtoken');

module.exports = {
    createUser: async function({userInput},req){
        const errors = [];
        if(!validator.isEmail(userInput.email)){
            errors.push({message:'E-mail is invalid'});
        }
        if(validator.isEmpty(userInput.password) || !validator.isLength(userInput.password,{min:5})){
            errors.push({message:'Password too short!'});
        }
        if(errors.length>0){
            const error = new Error('Invalid Input');
            error.data = errors;
            error.code = 422;
            throw error;
        }

        const existingUser = await User.findOne({email:userInput.email});
        if(existingUser){
            const error = new  Error("User Exists already!");
            throw error;
        }
        const hashedPw = await bcrypt.hash(userInput.password,12);
        const user = new User({
            email:userInput.email,
            password:hashedPw,
            name:userInput.name
        });
        const createdUser = await user.save();
        return {...createdUser._doc,_id:createdUser._id.toString()}
    },
    login: async function({email,password},req) {
        console.log('hello world')
        const user = await User.findOne({email:email});
        if(!user){
            const error = new Error('User not found');
            error.code = 401;
            throw error;
        }console.log(user)
        const isEqual = await bcrypt.compare(password,user.password);
        if(!isEqual){
            const error = new Error('Password is incorrect');
            error.code = 401;
            throw error;
        }
        const token = jwt.sign({
            userId:user._id.toString(),
            email:user.email
        },'somesupersecretsecret',{expiresIn:'1h'});
        return {token:token,userId:user._id.toString()}
    },
    createPost: async function({postInput},req){
        console.log('reach');
        if(!req.isAuth){
            const error = new Error('Not authenticated!');
            error.code = 401;
            throw error;
        }
        const errors = [];
        if(
            validator.isEmpty(postInput.title) || 
            !validator.isLength(postInput.title,{min:5})
        ){
            errors.push({message:'Title is invalid.'});
        }
        if(
            validator.isEmpty(postInput.content) || 
            !validator.isLength(postInput.content,{min:5})
        ){
            errors.push({message:'content is invalid.'});
        }
        if(errors.length > 0){
            const error = new Error('Invalid input.');
            error.data = errors;
            error.code = 422;
            throw error;
        }
        console.log('reach2');
        const user = await User.findById(req.userId);
        const post = new Post({
            title:postInput.title,
            content:postInput.content,
            imageUrl:postInput.imageUrl,
            creator:user
        });
        const createdPost = await post.save();
        // Add post to user posts
        user.posts.push(createdPost);
        await user.save();
        return {...createdPost.doc,
        _id:createdPost.id.toString(),
        createdAt:createdPost.createdAt.toISOString(),
        updatedAt:createdPost.updatedAt.toISOString()
        };
    }
}