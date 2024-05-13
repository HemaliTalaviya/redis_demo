require('dotenv').config();
const express = require('express');
const path = require('path');
const http = require('http');
const redis = require('redis');
// const { PassThrough } = require('stream');
const app = express();
const server = http.createServer(app);
app.use(express.static('public'));
app.use(express.json())
const { ObjectId } = require('mongodb');
const redisClient = redis.createClient();

redisClient.connect();
redisClient.on('connect',function(){
    console.log('conncted redis..')
})



app.get('/',(req,res) =>{
    res.sendFile(path.join(__dirname,'./public/index.html'));
})


app.post('/add_user',async(req,res) =>{
    req.body.id = new ObjectId();

   let data= await redisClient.set('users:'+req.body.id,JSON.stringify(req.body));

   //expires key automatically
   await redisClient.expire('users:'+req.body.id,1000)
   console.log('data====',data)
   res.send(data)
    
})

app.post('/get_user', async(req,res)=>{

    let data = await redisClient.get('users:'+req.body.id);
    // console.log('data view==',data)
    let result = JSON.parse(data);
    // console.log('result of parse data===',result)
    result.name="admin";
    await redisClient.set('users:'+req.body.id,JSON.stringify(result))
    res.send(result);
})

//delete user
app.delete('/delete_user', async(req,res)=>{

    let data = await redisClient.DEL('users:'+req.body.id);
    return res.status(200).json({
        success:true,
        message:'delete successfully'
    })

})


//####################### hash method 

app.post('/add_user',async(req,res) =>{
    try {
        req.body.id = new ObjectId();
        let obj ={
            name:"user",
            password:"user@123"
        }
        // let result = JSON.stringify(obj);
        // console.log('result data=',result)
        let data= await redisClient.hSet('users', req.body.id.toString(), JSON.stringify(obj))
        console.log('data====',data)
        res.json(data)
    } catch (error) {
        res.status(500).send(error.message)
    }
})

app.post('/get_user',async(req,res)=>{

    try {
        let data =  await redisClient.HGET('users',req.body.id);
        console.log('get user data==',data)
        return res.status(200).json({
            success:true,
            data
        })
    } catch (error) {
        res.status(500).send(error.message)
    }
})

//get all user
app.post('/get_user',async(req,res)=>{

    try {
        let data =  await redisClient.HGETALL('users',req.body.id);

        console.log('get user data==',data.key)

        //find only key data
        let keys = await redisClient.HKEYS('users');
        console.log('keys===',keys)
        
        return res.status(200).json({
            success:true,
            data
        })
    } catch (error) {
        res.status(500).send(error.message)
    }
})

// delete key
app.delete('/delete_user',async(req,res)=>{

    try {
        let data =  await redisClient.HDEL('users',req.body.id);

        // console.log('get user data==',data.key)
        return res.status(200).json({
            success:true,
            data
        })
    } catch (error) {
        res.status(500).send(error.message)
    }
})



const port = process.env.PORT || '5000'
server.listen(3000,function(){
    console.log('Server Starting on port..!!',port)
})


