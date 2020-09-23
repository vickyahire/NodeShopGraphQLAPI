const Post = require('../models/post')
const {validationResult} = require('express-validator')

exports.getFeed = (req,res,next) =>{
    Post.find().then(posts =>{
        // if(!posts){
        //     const error = new Error('posts not found');
        //     error.statusCode = 404;
        //     throw error;
        // }
        console.log('reach')
        res.status(200).json({
            meassage:'post fetcheed successfully',
            posts:posts
        })
    }).catch(err=>{
        if (!err.statusCode){
            err.statusCode =500;
        }
        next(err);
    })
}

exports.postFeed = (req,res,next) =>{   
    const error = validationResult(req);
    if(!error.isEmpty()){
                const error = new Error('validation failed ,entered data is incorrect');
                error.statusCode = 422;
                throw error;
    }


    console.log('reach'); 
    const title = req.body.title;
    const content = req.body.content;
    const post = new Post({
        title:title,
        content:content,
        imageUrl:'images/duck.jpg',
        creator:{name:"siddhant"}
    });
    post.save().then(result =>{
        console.log(result)
        res.status(201).json({ 
            meassage:'post created successfully',
            post:result  
        })
    }).catch(err => {
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
        console.log(err)
    }
        )
}

exports.getPost = (req,res,next) =>{
 const postId = req.params.postId;
 Post.findById(postId)
    .then(post =>{
        if(!post) {
            const error = new Error('Could not find post');
            error.statusCode = 404;
            throw error;
        }
        res.status(200).json({meassage:'post fetched',post:post});
    }).catch(err =>{
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    })
}