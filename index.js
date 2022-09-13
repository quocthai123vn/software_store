const express=require('express')
const app=express()
const dotenv = require('dotenv').config() 
const cookieParser=require('cookie-parser')
const session=require('express-session')
const flash= require('express-flash')
const UserRouter=require('./Routes/UserRouter')
const SoftwareRouter=require('./Routes/SoftwareRouter')
const mongoose=require('mongoose')

app.set('view engine','ejs')
app.use(express.urlencoded({extended:false}))
app.use(express.static(__dirname))
app.use(cookieParser('mk'))
app.use(session({
    secret: process.env.SESSION_SECRET
}))
app.use(express.json())
app.use(flash())
app.use(function( req, res, next ) {
    if ( req.query._method == 'DELETE' ) {
        req.method = 'DELETE';
        req.url = req.path;
    }
    else if( req.query._method == 'PUT' ) {
        req.method = 'PUT';
        req.url = req.path;
    }     
    next(); 
})

app.use('/',UserRouter)
app.use('/',SoftwareRouter)

app.get('/dashboard',(req,res)=>{
    const curUser=req.session.user
    if(!curUser){
        return res.redirect('/login')
    }
    else if(curUser.role==='customer'){
        req.flash('error','Bạn không có quyền truy cập')
        return res.redirect('/')
    }
    res.render('dashboard',{curUser})
})

app.get('/error',(req,res)=>{
    const curUser=req.session.user
    if(!curUser){
        return res.redirect('/login')
    }
    res.render('error',{curUser})
})


app.use((req,res)=>{
    res.redirect('/error')
})

mongoose.connect(process.env.DB_HOST,{
    useNewUrlParser:true,
    useUnifiedTopology:true
})
.then(()=>{
    const port=process.env.PORT || 8080
    app.listen(port,()=>console.log(`http://localhost:${port}`))
})
.catch(e=>console.log("Khong the ket noi"))