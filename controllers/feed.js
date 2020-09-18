exports.getFeed = (req,res,next) =>{
    console.log('reach')
    res.status(200).json({
        posts:[{_id:"1",title:"naruto",
        content:'hokage of the leaf village',
        imageUrl:'images/duck.jpg',
        creator:{name:"siddhant"},
        createdAt:new Date()}]
    })
}

exports.postFeed = (req,res,next) =>{
    console.log('reach'); 
    const title = req.body.title;
    const content = req.body.content;

    res.status(201).json({ 
        meassage:'post created successfully',
        post:{_id:"2",title:title,content:content,imageUrl:'images/duck.jpg',
        creator:{name:"siddhant"},
        createdAt:new Date()} 
    })
}
