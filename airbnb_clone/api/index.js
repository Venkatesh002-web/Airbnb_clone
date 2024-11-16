var express=require("express");
var app=express();
var cors =require('cors');
var mongoose=require("mongoose");
var bcrypt=require('bcryptjs')
var jwt=require("jsonwebtoken");
var User=require('./models/User.js');
var Place=require('./models/Places.js');
var Booking=require('./models/Bookings.js');
require('dotenv').config();
var jwtSecret="aasdfvebjsshsabdnsahsa";
var cookieParser=require('cookie-parser');
var imageDownloader=require('image-downloader');
var bcryptSalt=bcrypt.genSaltSync(10);
var multer=require("multer");
var fs=require("fs");

app.use(cookieParser());
app.use('/uploads', express.static(__dirname+'/uploads'));

app.use(express.json());
app.use(cors({
  credentials: true,
  origin: 'http://localhost:5173',
}));


app.listen(4000);



mongoose.connect(process.env.MONGO_URL);
console.log(process.env.MONGO_URL)


function getUserDataFromReq(req) {
  return new Promise((resolve, reject) => {
    jwt.verify(req.cookies.token, jwtSecret, {}, async (err, userData) => {
      if (err) throw err;
      resolve(userData);
    });
  });
}


app.post('/api/register',async(req,res) =>{
var {name,email,password}=req.body;
try{
var userDoc= await User.create({
name,
email,
password:bcrypt.hashSync(password,bcryptSalt),
});
res.json(userDoc);
}catch(e){
res.status(422).json(e);
}
});


app.post('/api/login',async (req,res)=>{
var {email,password}=req.body;
var userDoc= await User.findOne({email});
if(userDoc){
const passOk=bcrypt.compareSync(password,userDoc.password)
if(passOk){
jwt.sign({email:userDoc.email,id:userDoc._id},jwtSecret,{},(err,token) => {
if (err) throw err;
res.cookie('token',token).json(userDoc);
});

}
else{
res.status(422).json("pass not ok");
}
}
else{
res.json("not found")
}
});


app.get('/api/profile',(req,res) => {
const {token}=req.cookies;
if(token){
jwt.verify(token,jwtSecret,{},async(err,user) =>{
if(err) throw err;
const {name,email,_id}=await User.findById(user.id);
res.json({name,email,_id});
});
}else{
res.json(null);
}

})

app.post('/api/logout',(req,res) =>{
res.cookie('token','').json(true);});


app.post('/api/upload-by-link',async (req,res) =>{
const {link}=req.body;
const newName='photo'+Date.now()+'.jpg';
await imageDownloader.image({
url:link,
dest:__dirname+'/uploads/'+newName,
});
res.json(newName);
})
console.log({__dirname});


const photosMiddleware=multer({dest:'/api/uploads/'});
app.post('/api/upload',photosMiddleware.array('photos',100),(req,res) => {
const uploadedFiles=[];
for(let i=0;i<req.files.length;i++){
const {path,originalname}=req.files[i];
const parts=originalname.split('.');
const ext=parts[parts.length-1];
const newPath=path+'.'+ext;
fs.renameSync(path,newPath);
uploadedFiles.push(newPath.replace('api\\uploads\\',''));
}
res.json(uploadedFiles);


});


app.post('/api/places', (req,res) => {
const {token}=req.cookies;
const{
title,address,addedPhotos,
description,perks,extraInfo,
checkIn,checkOut,maxGuests,price}=req.body;

jwt.verify(token,jwtSecret,{},async (err,userData) => {
if(err) throw err;
const placeDoc=await Place.create({
owner:userData.id,
title,address,photos:addedPhotos,description,
perks,extraInfo,
checkIn,checkOut,maxGuests,price});

res.json(placeDoc);
});

});

app.get('/api/user-places',(req,res) => {
const {token}=req.cookies;
jwt.verify(token,jwtSecret,{},async (err,userData) =>{
const {id} = userData;
res.json( await Place.find({owner:id}));
})
});

app.get('/api/places/:id', async (req,res)=>{
const {id}=req.params;
res.json(await Place.findById(id));
});

app.put('/api/places', async (req,res) => {
const {token}=req.cookies;
const{
id,title,address,addedPhotos,
description,perks,extraInfo,
checkIn,checkOut,maxGuests,price}=req.body;
jwt.verify(token,jwtSecret,{},async (err,userData) => {
if(err) throw err;
const placeDoc=await Place.findById(id);

if(userData.id===placeDoc.owner.toString()){
placeDoc.set({
title,address,photos:addedPhotos,
description,perks,extraInfo,
checkIn,checkOut,maxGuests,price
});
placeDoc.save();
res.json("ok");
}
});

});

app.get('/api/places', async (req,res) => {
res.json(await Place.find());
})

app.post('/api/bookings', async (req,res) => {
const userData = await getUserDataFromReq(req);
const {
     place,checkIn,checkOut,
     numberofGuests,name,phone,price
     }=req.body;
     Booking.create({
     place,checkIn,checkOut, user:userData.id,
     numberofGuests,name,phone,price}).then((doc) => {

     res.json(doc);
     }).catch((err) => {
            throw err;
            });
     });


app.get('/api/bookings', async (req,res) => {

  const userData = await getUserDataFromReq(req);
  res.json( await Booking.find({user:userData.id}).populate('place') );
});
