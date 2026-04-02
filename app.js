const express=require ('express');
const path=require('path');
const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp');
const Campground = require('./models/campground');
const app = express();
const methodOverride = require('method-override');
const Review = require ('./models/review')
const campgrounds=require('./routes/campground')
const reviews =require('./routes/review')

app.use(express.static(path.join(__dirname, 'public')));
const ejsMate=require('ejs-mate');
const session= require('express-session');
const flash=require('connect-flash');
const Joi =require('joi')
const {campgroundSchema , reviewSchema}=require('./schemas.js')
const catchAsync=require('./utils/catchAsync');
const ExpressError=require('./utils/ExpressError');


const db=mongoose.connection;
db.on("error",console.error.bind(console,"connection error"));
db.once("open",()=>{
    console.log("Database connected");
});

app.engine('ejs',ejsMate);
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'))

app.use(express.urlencoded({extended:true}))
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname,'public')))
const sessionConfig={
    secret:'thisisshouldbebettersecret!!',
    resave: false,
    saveUninitialized:true,
    cookie:{
        httpOnly:true,
        expires: Date.now()+1000*60*60*24*7,
        maxAge: Date.now()+1000*60*60*24*7
    }
}
app.use(session(sessionConfig))
app.use(flash());

app.use((req,res,next)=>{
    res.locals.success=req.flash('success');
    next();
})
app.use('/campgrounds', campgrounds)
app.use('/campgrounds/:id/reviews', reviews)
app.use(express.static('public'))

app.get('/',(req,res)=>{
    res.render('home')
})


app.use((req,res,next)=>{
    next(new ExpressError('Page Not Found',404))
});
app.use((err,req,res,next)=>{ 
    const{statusCode=500,message='Wronggggggg'}=err;
    if(!err.message)err.message='oh no ,Something Went Wrong!!'
    res.status(statusCode).render('error',{err})
});

app.listen(3000,()=>{
        console.log('Running on 3000')
})