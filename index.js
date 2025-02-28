const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');


const app = express();

app.use(express.json());


mongoose.connect('mongodb://localhost:27017/users')
.then(()=>{
    console.log('Connected to database');
})


const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
       
    },
    password: {
        type: String,
        require : true,
    },
    name : {
        type: String,
        require : true,
    }
})


const userModel = mongoose.model('User', userSchema);




app.post('/register',(req,res)=>{
    const userData = req.body;

    bcrypt.genSalt(10, (err, salt) => {
        if(!err){
            bcrypt.hash(userData.password,salt,(err,hpass)=>{
                if(!err){
                    userData.password = hpass;
                    userModel.create(userData)
                    .then((user)=>{
                        res.send(user);
                        console.log(user)
                    })
                    .catch((err)=>{
                        res.send(err);
                    }) 
                }
                else{
                    res.send("error at hashing password");
                }
            })
        }
        else{
            res.send("error at creating salt");
        }
    })
})

app.post('/login', (req, res) => {
    const { email, password } = req.body;

    userModel.findOne({ email })
        .then((user) => {
            if (!user) {
                return res.status(404).send('User not found');
            }

            console.log(user);

            bcrypt.compare(password, user.password, (err, result) => {
                if (err) {
                    return res.status(500).send('Error comparing passwords');
                }

                console.log(result);

                if (result) {
                    jwt.sign({email},"venkatmowa",(err,token)=>{
                        if(!err){
                            console.log(token);
                            res.status(200).send('User Login Successfully' );                        }
                        else{
                            return res.status(500).send('Error in generating token');
                        }
                    })
                  
                } else {
                    return res.status(401).send('User Login Failed');
                }
            });
        })
        .catch((err) => {
            res.status(500).send(err);
        });
});

function verifyToken(req,res,next){
    const authHeader = (req.headers.authorization);
    if(authHeader){
        const token = authHeader.split(' ')[1];        
        jwt.verify(token,"venkatmowa",(err,user)=>{
            if(err){
                res.status(403).send('Token is not valid');
            }
            else{
                next();
            }
        })
    }

   
}

app.get('/data',verifyToken,(req,res)=>{
   res.send({message : 'Data fetched'});
    
} )


// const { Client } = require('pg');

// const client = new Client({
//     user: 'postgres', 
//     host: 'localhost',
//     database: 'users',
//     password: 'root', 
//     port: 5433, 
// });

// // Connect to the database
// client.connect()
//     .then(() => console.log('Connected to PostgreSQL'))
//     .catch(err => console.error('❌ Connection error', err.stack));
 
// module.exports = client;







app.listen(8000,()=>{
    console.log('Server started');
})