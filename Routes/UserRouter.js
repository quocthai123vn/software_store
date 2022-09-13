const express=require('express')
const Router=express.Router()
const {check, validationResult}=require('express-validator')
const multer=require('multer')
const fs=require('fs')
const bcrypt=require('bcrypt')
const moment = require('moment')
const userDao=require('../models/userModel')
const upload=multer({dest:'uploads', 
fileFilter:(req,file,callback)=>{ 
    if(file.mimetype.startsWith('image/')){ 
        callback(null,true)
    }
    else{
        callback(null,false)
    }
},limits:{fileSize:5000000}})

let imgPath=[]

function numberFormat(n){
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
}

Router.get('/login',(req,res)=>{
    if(req.session.user){
        res.redirect('/')
    }
    const success=req.flash('success') || ''
    const error=req.flash('error') || ''
    const email=req.flash('email') || ''
    res.render('login',{error,email,success})
})

const loginValidator=[
    check('email').exists().withMessage('Vui lòng nhập email')
    .notEmpty().withMessage('Vui lòng nhập email')
    .isEmail().withMessage('Email sai định dạng'),

    check('password').exists().withMessage('Vui lòng nhập mật khẩu')
    .notEmpty().withMessage('Vui lòng nhập mật khẩu')
]

Router.post('/login',loginValidator,(req,res) =>{
    if(req.session.user){
        res.redirect('/')
    }    
    let result  = validationResult(req)
    if(result.errors.length===0){
        const {email,password}=req.body
        userDao.findOne({email:email}).then(user=>{
            if(!user){
                req.flash('error','Sai email hoặc mật khẩu')
                req.flash('email',email)
                return res.redirect('/login')
            }
            else{
                const match=bcrypt.compareSync(password,user.password)
                if(!match){
                    req.flash('error','Sai email hoặc mật khẩu')
                    req.flash('email',email)
                    return res.redirect('/login')
                }
                else{
                    req.session.user=user
                    return res.redirect('/')
                }
            }
        })
    }
    else{
        result=result.mapped()

        let message
        for(fields in result){
            message=result[fields].msg
            break
        }
        const {email,password}=req.body
        req.flash('error',message)
        req.flash('email',email)
    
        res.redirect('/login')
    }  
})

Router.get('/register',(req,res)=>{
    if(req.session.user){
        res.redirect('/')
    }
    const error=req.flash('error')
    const email=req.flash('email') || ''
    const lastName=req.flash('lastName') || ''
    const firstName=req.flash('firstName') || ''

    res.render('register',{error,email,lastName,firstName})
})

const registerValidator=[
    check('email').exists().withMessage('Vui lòng nhập email')
    .notEmpty().withMessage('Vui lòng nhập email')
    .isEmail().withMessage('Email sai định dạng'),

    check('lastName').exists().withMessage('Vui lòng nhập họ')
    .notEmpty().withMessage('Vui lòng nhập họ'),

    check('firstName').exists().withMessage('Vui lòng nhập tên')
    .notEmpty().withMessage('Vui lòng nhập tên'),

    check('ngaysinh').exists().withMessage('Vui lòng nhập ngày sinh')
    .notEmpty().withMessage('Vui lòng nhập ngày sinh'),

    check('bankId').exists().withMessage('Vui lòng nhập tài khoản ngân hàng')
    .notEmpty().withMessage('Vui lòng nhập tài khoản ngân hàng')
    .isLength({min:9}).withMessage('Tài khoản ngân hàng phải tối thiểu 9 ký tự')
    .isNumeric().withMessage('Tài khoản ngân hàng không hợp lệ'),

    check('bankName').exists().withMessage('Vui lòng nhập tên ngân hàng')
    .notEmpty().withMessage('Vui lòng nhập tên ngân hàng'),
    
    check('password').exists().withMessage('Vui lòng nhập mật khẩu')
    .notEmpty().withMessage('Vui lòng nhập mật khẩu')
    .isLength({min:6}).withMessage('Mật khẩu phải tối thiểu 6 ký tự'),

    check('rePassword').exists().withMessage('Vui lòng nhập xác nhận mật khẩu')
    .notEmpty().withMessage('Vui lòng nhập xác nhận mật khẩu')
    .custom((value,{req})=>{
        if(value!==req.body.password){
            throw new Error('Mật khẩu không khớp')
        }
        return true 
    })

]

Router.post('/register',(req,res,next)=>{
    if(req.session.user){
        res.redirect('/')
    }
    let uploader=upload.single('avatar')
    uploader(req,res,err=>{
        let msg=''
        let user=req.body
        let image=req.file
        if(!image){
            msg+='Vui lòng chọn ảnh đại diện'
        }
        else if(err){
            msg+='Kích thước ảnh không hợp lệ'
        }

        if(msg.length>0){
            req.flash('error',msg)
            req.flash('email',user.email)
            req.flash('lastName',user.lastName)
            req.flash('firstName',user.firstName)
            return res.redirect('/register')
        }
        fs.renameSync(image.path,`uploads/${image.originalname}`)
        const img=`uploads/${image.originalname}`
        imgPath.push(img)
        next()
    })
})

Router.post('/register',registerValidator,(req,res)=>{
    if(req.session.user){
        res.redirect('/')
    }
    let result=validationResult(req)
    let user=req.body
    let day=user.ngaysinh.split('-')
    let dateOfBirth=day[2]+'/'+day[1]+'/'+day[0]
    const img=imgPath.pop()
    if(result.errors.length===0){
        const hashed=bcrypt.hashSync(user.password,10)
        const u= new userDao({
            uid:Date.now(),
            email:user.email,
            ho:user.lastName,
            ten:user.firstName,
            avatar:img,
            ngaysinh:dateOfBirth,
            bankId:user.bankId,
            bankName:user.bankName,
            password:hashed,
            role:"customer"
        })
        return u.save().then(()=>{
            req.flash('success','Đăng ký thành công')
            res.redirect('/login')
        }) 
        .catch(err=>{
            req.flash('error','Email đã tồn tại')
            return res.redirect('/register')
        }) 
    }
    else{
        result=result.mapped()

        let message
        for(fields in result){
            message=result[fields].msg
            break
        }
        req.flash('error',message)
        req.flash('email',user.email)
        req.flash('lastName',user.lastName)
        req.flash('firstName',user.firstName)
        
        res.redirect('/register')
    } 
})

Router.get('/staffManager',(req,res)=>{
    const curUser=req.session.user
    if(!curUser){
        return res.redirect('/login')
    }
    else if(curUser.role!=='admin'){
        req.flash('error','Bạn không có quyền truy cập')
        return res.redirect('/')
    }
    const error=req.flash('error') || ''
    const success=req.flash('success') || ''
    userDao.find({role:'staff'}).sort({_id:-1})
    .then(staffs=>{
        res.render('staffManager',{staffs,error,search:'',curUser,success})
    })
})

Router.post('/staffManager',(req,res)=>{
    const curUser=req.session.user
    if(!curUser){
        return res.redirect('/login')
    }
    else if(curUser.role!=='admin'){
        req.flash('error','Bạn không có quyền truy cập')
        return res.redirect('/')
    }
    const {search}=req.body
    if(!search){
        req.flash('error','Vui lòng nhập thông tin tìm kiếm')
        return res.redirect('/staffManager')
    }
    userDao.find({$or:[
        {ho:new RegExp(search,'i'),role:'staff'},
        {ten:new RegExp(search,'i'),role:'staff'},
        {email:search,role:'staff'}]}).sort({_id:-1})
        .then(staffs=>{
            return res.render('staffManager',{staffs,error:'',search,curUser,success:''})
        })
})

Router.get('/addStaff',(req,res)=>{
    const curUser=req.session.user
    if(!curUser){
        return res.redirect('/login')
    }
    else if(curUser.role!=='admin'){
        req.flash('error','Bạn không có quyền truy cập')
        return res.redirect('/')
    }
    const error=req.flash('error') || ''
    userDao.find({role:'customer'})
    .then(users=>{
        res.render('addStaff',{users,error,search:'',curUser})
    })
})

Router.post('/addStaff',(req,res)=>{
    const curUser=req.session.user
    if(!curUser){
        return res.redirect('/login')
    }
    else if(curUser.role!=='admin'){
        req.flash('error','Bạn không có quyền truy cập')
        return res.redirect('/')
    }
    const {search}=req.body
    if(!search){
        req.flash('error','Vui lòng nhập thông tin tìm kiếm')
        return res.redirect('/addStaff')
    }
    userDao.find({$or:[{ten:new RegExp(search,'i'),role:'customer'},{email:search,role:'customer'}]}).sort({_id:-1})
        .then(users=>{
            return res.render('addStaff',{users,error:'',search,curUser})
        })
})

Router.put('/addStaff/:id',(req,res)=>{
    const curUser=req.session.user
    if(!curUser){
        return res.redirect('/login')
    }
    else if(curUser.role!=='admin'){
        req.flash('error','Bạn không có quyền truy cập')
        return res.redirect('/')
    }
    const {id}=req.params
    userDao.findOneAndUpdate({uid:id},{role:'staff'})
    .then(user=>{
        if(!user){
            return res.send('error')
        }
        req.flash('success','Thêm nhân viên thành công')
        return res.redirect('/staffManager')
    })
})

Router.delete('/staffManager/:id',(req,res)=>{
    const curUser=req.session.user
    if(!curUser){
        return res.redirect('/login')
    }
    else if(curUser.role!=='admin'){
        req.flash('error','Bạn không có quyền truy cập')
        return res.redirect('/')
    }
    const {id}=req.params
    userDao.findOneAndUpdate({uid:id},{role:'customer'})
    .then(staff=>{
        if(!staff){
            return res.send('error')
        }
        req.flash('success','Xóa nhân viên thành công')
        return res.redirect('/staffManager')
    })
})

Router.get('/profile/:id', async (req,res)=>{
    const curUser=req.session.user
    if(!curUser){
        return res.redirect('/login')
    }
    const {id}=req.params
    const success=req.flash('success')
    let money = numberFormat(curUser.money)

    const profile = await userDao.findOne({uid:id})

    if(!profile){
        return res.redirect('/error')
    }

    res.render('profile',{profile,curUser,success,money})
})

Router.get('/history', async (req,res)=>{
    const curUser=req.session.user
    if(!curUser){
        return res.redirect('/login')
    }
    const success=req.flash('success') 
    const error=req.flash('error')
    const before=req.flash('before')
    const after=req.flash('after')
    
    const result = await userDao.findOne({uid:curUser.uid})
    const item = result.mySoftware
    
    let temp = []
    for(var i1=0,i2=item.length; i1<i2 ; i1++){
        temp.push(moment(item[i1].buyDate).format('HH:mm DD/MM/YYYY'))
    }
    res.render('history',{curUser,item,success,temp,error,before,after})
})

Router.post('/history', async (req,res)=>{
    const curUser=req.session.user
    const now = new Date()
    let msg = undefined
    if(!curUser){
        return res.redirect('/login')
    }

    const {before,after} = req.body
    if(!before || !after){
        req.flash('error','Vui lòng nhập ngày cần tìm')
        return res.redirect('/history')
    }

    
    const a = Date.parse(before), b = Date.parse(after)

    if (a>now || b >now){
        msg = 'Ngày tìm kiếm vượt quá ngày hiện tại'
    }
    else if(a>b){
        msg = 'Khoảng ngày không được xác định'
    }
    
    if(msg){
        req.flash('error',msg)
        req.flash('before',before)
        req.flash('after',after)
        return res.redirect('/history')
    }

    const i = curUser.mySoftware
    const item = []
    for(var i1=0,i2=i.length; i1<i2 ;i1++){
        let c = Date.parse(moment(i[i1].buyDate).format('YYYY-MM-DD'))

        if(c>=a && c <=b){
            item.push(i[i1])
        }
    }
    let temp = []
    for(var i1=0,i2=item.length; i1<i2 ; i1++){
        temp.push(moment(item[i1].buyDate).format('HH:mm DD/MM/YYYY'))
    }

    res.render('history',{curUser,item,success:'',temp,error:'',before,after})
})

Router.get('/editAvatar', function ( req, res ) {
    const curUser=req.session.user
    if(!curUser){
        return res.redirect('/login')
    }
    const error=req.flash('error') || ''
    userDao.findOne({uid:curUser.uid})
    .then(curUser=>{
        if(curUser){
            return res.render('editAvatar',{error,curUser})
        }
        else{
            return res.redirect('/error')
        }
    })
    
})
// Can suawr
Router.post('/editAvatar',(req,res)=>{
    const curUser=req.session.user
    if(!curUser){
        return res.redirect('/login')
    }
    let uploader=upload.single('avatar')
    uploader(req,res,err=>{ 
        let msg=''
        let image=req.file
        if(!image){
            msg+='Vui lòng chọn ảnh'
        }
        else if(err){
            msg+='Kích thước ảnh không hợp lệ'
        }

        if(msg.length>0){
            req.flash('error',msg)
            return res.redirect('/editAvatar')
        }
       fs.renameSync(image.path,`uploads/${image.originalname}`)

        userDao.findOneAndUpdate({uid:curUser.uid},{avatar:`uploads/${image.originalname}`},{new:true})
        .then((result)=>{
            console.log('ok')
        })
        req.flash('success','Thay đổi ảnh đại diện thành công')
        return res.redirect('/profile/'+curUser.uid)
    })
})

Router.get('/editProfile',(req,res)=>{
    const curUser=req.session.user
    if(!curUser){
        return res.redirect('/login')
    }
    const error=req.flash('error') || ''

    res.render('editProfile',{error,curUser})
})

const editProfileValidator=[
    check('lastName').exists().withMessage('Vui lòng nhập họ')
    .notEmpty().withMessage('Vui lòng nhập họ'),

    check('firstName').exists().withMessage('Vui lòng nhập tên')
    .notEmpty().withMessage('Vui lòng nhập tên'),

    check('bankId').exists().withMessage('Vui lòng nhập tài khoản ngân hàng')
    .notEmpty().withMessage('Vui lòng nhập tài khoản ngân hàng')
    .isLength({min:9}).withMessage('Tài khoản ngân hàng phải tối thiểu 9 ký tự')
    .isNumeric().withMessage('Tài khoản ngân hàng không hợp lệ'),

    check('bankName').exists().withMessage('Vui lòng nhập tên ngân hàng')
    .notEmpty().withMessage('Vui lòng nhập tên ngân hàng')
]

Router.post('/editProfile',editProfileValidator,(req,res)=>{
    const curUser=req.session.user
    if(!curUser){
        return res.redirect('/login')
    }
    let result=validationResult(req)
    let update=req.body
    if(result.errors.length===0){
        userDao.findOneAndUpdate({uid:curUser.uid},{ho:update.lastName,ten:update.firstName,bankId:update.bankId,bankName:update.bankName})
        .then((result)=>{
            req.flash('success','Cập nhật thông tin thành công')
            return res.redirect('/profile/'+curUser.uid)
        })
    }
    else{
        result=result.mapped()

        let message
        for(fields in result){
            message=result[fields].msg
            break
        }
        req.flash('error',message)
        
        res.redirect('/editProfile')
    } 
})

Router.get('/recharge',(req,res)=>{
    const curUser=req.session.user
    if(!curUser){
        return res.redirect('/login')
    }
    const error=req.flash('error') || ''
    const success=req.flash('success') || ''
    let money = numberFormat(curUser.money)

    res.render('recharge',{error,curUser,success,money})
})

Router.post('/recharge', async (req,res)=>{
    let curUser=req.session.user
    if(!curUser){
        return res.redirect('/login')
    }
    const {money} = req.body
    let msg = undefined

    if(!money){
        msg = 'Vui lòng nhập số tiền'
    }
    else if(money < 10000){
        msg = 'Vui lòng nạp tối thiểu 10.000 vnđ'
    }

    if(msg){
        req.flash('error',msg)
        return res.redirect('/recharge')
    }

    const newMoney = curUser.money + parseInt(money)

    const result = await userDao.findOneAndUpdate({uid:curUser.uid},{money:newMoney})
    const user = await userDao.findOne({uid:curUser.uid})
    req.session.user = user

    req.flash('success','Nạp tiền thành công')
    res.redirect('/recharge')
})

const editPasswordValidator=[
    check('password').exists().withMessage('Vui lòng nhập mật khẩu')
    .notEmpty().withMessage('Vui lòng nhập mật khẩu')
    .isLength({min:6}).withMessage('Mật khẩu phải tối thiểu 6 ký tự'),

    check('rePassword').exists().withMessage('Vui lòng nhập xác nhận mật khẩu')
    .notEmpty().withMessage('Vui lòng nhập xác nhận mật khẩu')
    .custom((value,{req})=>{
        if(value!==req.body.password){
            throw new Error('Mật khẩu không khớp')
        }
        return true 
    })

]

Router.get('/editPassword',(req,res)=>{
    const curUser=req.session.user
    if(!curUser){
        return res.redirect('/login')
    }
    const error=req.flash('error') || ''
    res.render('editPassword',{error,curUser})
})

Router.post('/editPassword',editPasswordValidator, async (req,res)=>{
    const curUser=req.session.user
    if(!curUser){
        return res.redirect('/login')
    }
    let result=validationResult(req)
    let update=req.body
    if(result.errors.length===0){
        const hashed=bcrypt.hashSync(update.password,10)
        const result = await userDao.findOneAndUpdate({uid:curUser.uid},{password:hashed})
        
        req.flash('success','Thay đổi mật khẩu thành công')
        delete req.session.user
        delete req.session.cart
        return res.redirect('/login')  
    }
    else{
        result=result.mapped()

        let message
        for(fields in result){
            message=result[fields].msg
            break
        }
        req.flash('error',message)
        
        res.redirect('/editPassword')
    } 
})

Router.get('/logout',(req,res)=>{
    req.session.destroy()
    res.redirect('/login')  
})

module.exports=Router