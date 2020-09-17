const express = require('express');

const bodyParser = require('body-parser');

const feedRoute = require('./routes/feed');
const { response } = require('express');

const app = express();

// app.use(bodyParser.urlencoded()) // its use x-www-urlencoded <form>

app.use(bodyParser.json());

app.use((req,res,next)=>{
    res.setHeader('Access-Control-Allow-Origin','*');
    res.setHeader('Access-Control-Allow-Methods','GET,POST,PUT,DELETE,PATCH');
    res.setHeader('Access-Control-Allow-Headers','Content-Type,Authorization');
    next();
})

app.use(feedRoute);

app.listen(8080);
console.log(`server started on "192.168.0.104:8080/posts"`)

//this is i done 
//hello world