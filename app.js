const express = require('express');
const mongoose = require('mongoose')
const bodyParser = require('body-parser');
const path = require('path');
const { response } = require('express');
const multer = require('multer');
const graphqlSchema = require('./graphql/schema');
const graphqlResolver = require('./graphql/resolvers');
const { graphqlHTTP } = require('express-graphql');

const app = express();

const fileStorage = multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,'images')
    },
    filename:(req,file,cb)=>{
        cb(null,`${file.originalname}`)
    }
})
const fileFilter =(req,file,cb) =>{
    if(file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg'){
        cb(null,true)
    }else{
        cb(null,false)
    }
}
// app.use(bodyParser.urlencoded()) // its use x-www-urlencoded <form>

app.use(bodyParser.json());
app.use(multer({storage:fileStorage,fileFilter:fileFilter}).single('image'))
app.use('/images',express.static(path.join(__dirname,'images'))) 

app.use((req,res,next)=>{
    res.setHeader('Access-Control-Allow-Origin','*');
    res.setHeader('Access-Control-Allow-Methods','GET,POST,PUT,DELETE,PATCH');
    res.setHeader('Access-Control-Allow-Headers','Content-Type,Authorization');
    next();
});

app.use('/graphql',graphqlHTTP({
    schema:graphqlSchema,
    rootValue:graphqlResolver,
    graphiql:true
})
);



app.use((error,req,res,next)=>{
    console.log(error);
    const status = error.statusCode || 500;
    const message = error.message;
    res.status(status).json({message:message});
})

mongoose.connect('mongodb+srv://sid:Ahire@000@cluster0.njkhp.mongodb.net/APIPractice',{useNewUrlParser:true,useUnifiedTopology:true})
    .then(result =>{
        console.log('server started on 192.168.0.109')
        app.listen(8080)
})
.catch(err => console.log(err));

//this is i done 
//hello world