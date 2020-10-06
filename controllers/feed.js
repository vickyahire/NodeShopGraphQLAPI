const fs = require('fs');
const path = require('path');

const Post = require('../models/post');
const {validationResult} = require('express-validator');
const { count } = require('console');
const user = require('../models/user');

exports.getPosts = async(req,res,next) =>{
    const currentPage = req.query.page || 1;
    const perPage = 2;
    let totalItems;
    try{
    const totalItems = await Post.find().countDocuments().exec();
    const posts = await Post.find()
            .skip((currentPage - 1) * perPage)
            .limit(perPage).exec();

        res.status(200).json({
                meassage:'fetched posts successfully',
                posts:posts,
                totalItems:totalItems
            });
        }
    catch(err){
        if (!err.statusCode){
            err.statusCode =500;
        }
        next(err);
    }
}

exports.postFeed = (req,res,next) =>{   
    const error = validationResult(req);
    if(!error.isEmpty()){
                const error = new Error('validation failed ,entered data is incorrect');
                error.statusCode = 422;
                throw error;
    }
    if(!req.file){
        const error = new Error('No image provided');
        error.statusCode = 422;
        throw error;
    }
    const imageUrl = req.file.path;

    console.log('reach'); 
    const title = req.body.title;
    const content = req.body.content;
    let creator = user;
    const post = new Post({
        title:title,
        content:content,
        imageUrl:imageUrl,
        creator:req.userId
    });
    post.save()
        .then(result =>{
            return user.findById(req.userId);
        })
        .then(user =>{  
            creator = user;
            user.posts.push(post)
            return user.save();
        }).then(result =>{
            console.log(result)
            res.status(201).json({ 
                meassage:'post created successfully',
                post:post,
                creator:{_id:creator._id,name:creator.name}  
            });
    }).catch(err => {
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
        console.log(err)
    }
        )
}

exports.getPost = async(req,res,next) =>{
 const postId = req.params.postId;
 try{
 const post=await Post.findById(postId);
        if(!post) {
            const error = new Error('Could not find post');
            error.statusCode = 404;
            throw error;
        }
        res.status(200).json({meassage:'post fetched',post:post});
 }
  catch(err){
      if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    }
}
exports.updatePost = (req,res,next) =>{
    const postId = req.params.postId;
    const error = validationResult(req);
    if(!error.isEmpty()){
                const error = new Error('validation failed ,entered data is incorrect');
                error.statusCode = 422;
                throw error;
    }
    const title = req.body.title;
    const content = req.body.content;
    let imageUrl = req.body.image; 
    if(req.file){
        imageUrl = req.file.path;
    }
    if(!imageUrl){
        const error = new Error('No file picked');
        error.statusCode = 422;
        throw error;
    }
    Post.findById(postId)
    .then(post =>{
        if(!post) {
            const error = new Error('Could not find post');
            error.statusCode = 404;
            throw error;
        }
        if(post.creator.toString() !== req.userId){
            const error = new Error('Not Authorized');
            error.statusCode = 403;
            throw error;
        }
        post.title=title;
        if(imageUrl !== post.imageUrl){
            clearImage(post.imageUrl); 
        }
        post.imageUrl=imageUrl;
        post.content =content;

        return post.save();
    })
    .then(result => {
        res.status(200).json({meassage:'post updated',post:result})
    })
    .catch(err =>{
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    });
};

exports.deletePost = (req,res,next) =>{
    const postId = req.params.postId;
    console.log(postId)
    // const userId = req.userId;
    // console.log(userId)
    
    Post.findById(postId)
     .then(post=>{
        if(!post) {
            const error = new Error('Could not find post');
            error.statusCode = 404;
            throw error;
        }
        if(post.creator.toString() !== req.userId){
            const error = new Error('Not Authorized');
            error.statusCode = 403;
            throw error;
        }
        clearImage(post.imageUrl);
        return Post.findByIdAndRemove(postId);
     })
     .then(result=>{
         return user.findById(req.userId);
     }).then(user =>{
        //  console.user(user)
         user.posts.pull(postId);
         return user.save();
     }).then(result=>{
         console.log(result);
         res.status(200).json({meassage:'post deleted successfully',post:result})
     })
     .catch(err=>{
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
     })

}


const clearImage = filePath =>{
    filePath = path.join(__dirname,'..',filePath);
    fs.unlink(filePath,err => console.log(err));
}