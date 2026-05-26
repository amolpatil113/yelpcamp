const express=require ('express');
const path=require('path');
const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp');
const Campground = require('./models/campground');
const app = express();
const methodOverride = require('method-override');
const passport=require('passport');
const LocalStratergy=require('passport-local');
const User=require('./models/user');

const Review = require ('./models/review')
const userRoutes=require('./routes/userRoutes');
const campgroundRoutes=require('./routes/campgroundRoutes.js')
const reviewRoutes =require('./routes/reviewRoutes.js')

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

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStratergy(User.authenticate()));

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.use((req,res,next)=>{
    res.locals.success=req.flash('success');
    res.locals.error=req.flash('error');
    next();
})
app.get('/fakeUser',async(req,res)=>{
    const user=new User({email:'colttt@gmail.com',username:'colttt'})
    const newUser=await User.register(user,'chicken')
    res.send(newUser);
})

app.use('/',userRoutes)
app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id/reviews', reviewRoutes)
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