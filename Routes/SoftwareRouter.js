const express=require('express')
const Router=express.Router()
const {check, validationResult}=require('express-validator')
const fs=require('fs')
const softwareDao=require('../models/softwareModel')
const supplierDao=require('../models/supplierModel')
const userDao=require('../models/userModel')
const hisDao=require('../models/hisModel')
const cmtDao=require('../models/cmtModel')
const rand=require('random-key')
const moment = require('moment')
const multer=require('multer')
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

// HOME PAGE
Router.get('/',async (req,res)=>{
    const curUser=req.session.user
    const error=req.flash('error') || ''
    const softwares = await softwareDao.find().sort({_id:-1}).lean()

    let aPrice = []
    for(var i1=0,i2=softwares.length;i1<i2;i1++){
        aPrice.push(numberFormat(softwares[i1].price))
    }
    
    return res.render('index',{softwares,error,search:'',curUser,aPrice})
    
})

Router.post('/', async (req,res)=>{
    const curUser=req.session.user
    let {search,sort}=req.body
    if(!search && sort==='0'){
        req.flash('error','Vui lòng nhập thông tin tìm kiếm')
        return res.redirect('/')
    }
    if(sort==='0'){
        const softwares = await softwareDao.find({softwareName:new RegExp(search,'i')}).sort({_id:-1})
        let aPrice = []
        for(var i1=0,i2=softwares.length;i1<i2;i1++){
            aPrice.push(numberFormat(softwares[i1].price))
        }
        return res.render('index',{softwares,error:'',search,curUser,aPrice})
    }
    else if(!search){
        let a
        if(sort==='1'){
            a={
                softwareName:1
            }
        }
        else if(sort==='2'){
            a={
                price:-1
            }
        }
        else if(sort==='3'){
            a={
                price:1
            }
        }
        const softwares = await softwareDao.find().sort(a)
        let aPrice = []
        for(var i1=0,i2=softwares.length;i1<i2;i1++){
            aPrice.push(numberFormat(softwares[i1].price))
        }
        return res.render('index',{softwares,error:'',search:'',curUser,aPrice})
    }
    else{
        let a
        if(sort==='1'){
            a={
                softwareName:1
            }
        }
        else if(sort==='2'){
            a={
                price:-1
            }
        }
        else if(sort==='3'){
            a={
                price:1
            }
        }
        const softwares = await softwareDao.find({softwareName:new RegExp(search,'i')}).sort(a)
        let aPrice = []
        for(var i1=0,i2=softwares.length;i1<i2;i1++){
            aPrice.push(numberFormat(softwares[i1].price))
        }
        return res.render('index',{softwares,error:'',search,curUser,aPrice})
    }
})

// SOFTWARE MANAGER
Router.get('/softwareManager',async (req,res)=>{
    const curUser=req.session.user
    if(!curUser){
        return res.redirect('/login')
    }
    else if(curUser.role==='customer'){
        req.flash('error','Bạn không có quyền truy cập')
        return res.redirect('/')
    }
    const error=req.flash('error') || ''
    const success=req.flash('success') || ''
    const softwares = await softwareDao.find().sort({_id:-1})

    let aPrice = []
    for(var i1=0,i2=softwares.length;i1<i2;i1++){
        aPrice.push(numberFormat(softwares[i1].price))
    }
    res.render('softwareManager',{softwares,error,search:'',curUser,success,aPrice})
})

Router.post('/softwareManager',async (req,res)=>{
    const curUser=req.session.user
    if(!curUser){
        return res.redirect('/login')
    }
    else if(curUser.role==='customer'){
        req.flash('error','Bạn không có quyền truy cập')
        return res.redirect('/')
    }
    let {search,sort}=req.body
    if(!search && sort==='0'){
        req.flash('error','Vui lòng nhập thông tin tìm kiếm')
        return res.redirect('/softwareManager')
    }
    if(sort==='0'){

        const softwares = await softwareDao.find({softwareName:new RegExp(search,'i')}).sort({_id:-1})

        let aPrice = []
        for(var i1=0,i2=softwares.length;i1<i2;i1++){
            aPrice.push(numberFormat(softwares[i1].price))
        }
        return res.render('softwareManager',{softwares,error:'',search,curUser,success:'',aPrice})
        
    }
    else if(!search){
        let a
        if(sort==='1'){
            a={
                softwareName:1
            }
        }
        else if(sort==='2'){
            a={
                price:-1
            }
        }
        else if(sort==='3'){
            a={
                price:1
            }
        }
        else if(sort==='4'){
            a={
                quantity:-1
            }
        }
        else if(sort==='5'){
            a={
                quantity:1
            }
        }
        const softwares = await softwareDao.find().sort(a)

        let aPrice = []
        for(var i1=0,i2=softwares.length;i1<i2;i1++){
            aPrice.push(numberFormat(softwares[i1].price))
        }
        return res.render('softwareManager',{softwares,error:'',search:'',curUser,success:'',aPrice})

    }
    else{
        let a
        if(sort==='1'){
            a={
                softwareName:1
            }
        }
        else if(sort==='2'){
            a={
                price:-1
            }
        }
        else if(sort==='3'){
            a={
                price:1
            }
        }
        else if(sort==='4'){
            a={
                quantity:-1
            }
        }
        else if(sort==='5'){
            a={
                quantity:1
            }
        }
        const softwares = await softwareDao.find({softwareName:new RegExp(search,'i')}).sort(a)

        let aPrice = []
        for(var i1=0,i2=softwares.length;i1<i2;i1++){
            aPrice.push(numberFormat(softwares[i1].price))
        }
        return res.render('softwareManager',{softwares,error:'',search,curUser,success:'',aPrice})
    }
})


Router.get('/software/:id', async (req,res)=>{
    const curUser=req.session.user
    const {id}=req.params
    const error=req.flash('error') || '' 
    const success=req.flash('success') || '' 

    const software = await softwareDao.findOne({uid:id})
    if(!software){
        return res.redirect('/error')
    }
    const supplier = await supplierDao.findOne({uid:software.supplierId})
    const price=numberFormat(software.price)

    const cmt = await cmtDao.find({postId:id}).sort({_id:-1}).lean()

    let aUser = []
    let date = []
    for(var i1=0,i2=cmt.length;i1<i2;i1++){
        let user = await userDao.findOne({uid:cmt[i1].by})
        date.push(moment(cmt[i1].date).format('HH:mm DD/MM/YYYY'))
        aUser.push(user)
    }

    return res.render('software',{software,supplier,price,curUser,error,success,cmt,aUser,date})
    
})

Router.post('/software/:id', async(req,res)=>{
    const curUser=req.session.user
    const {id}=req.params
    if(!curUser){
        req.flash('error','Vui lòng đăng nhập')
        return res.redirect('/software/'+id)
    }
    const {quantity} =req.body

    if(!req.session.cart){
        req.session.cart=[]
    }
    
    const software = await softwareDao.findOne({uid:id})

    for (var i1 = 0, i2 = req.session.cart.length; i1 < i2; i1++){
        if(req.session.cart[i1].id === software.uid){
            req.session.cart[i1].quantity += parseInt(quantity)
            return res.redirect('/cart')
        }
    }

    let item={
        id: software.uid,
        stt:req.session.cart.length,
        name:software.softwareName,
        price:software.price,
        quantity:parseInt(quantity)
    }
    req.session.cart.push(item)
    res.redirect('/cart')
})

Router.post('/comment/:id',async(req,res)=>{
    const curUser=req.session.user
    const {id} = req.params
    if(!curUser){
        req.flash('error','Vui lòng đăng nhập để bình luận')
        return res.redirect('/software/'+id)
    }
    const {cmt}=req.body

    if(!cmt){
        req.flash('error','Vui lòng nhập nội dung')
        return res.redirect('/software/'+id)
    }
    
    const now = Date.now()
    const a = new cmtDao({
        uid:Date.now(),
        cmt: cmt,
        by: curUser.uid,
        date:now,
        postId: id
    })
    await a.save()

    req.flash('success','Thêm bình luận thành công')
    res.redirect('/software/'+id)
})

Router.get('/deleteCmt/:id', async (req,res) => {
    const curUser=req.session.user
    if(!curUser){
        return res.redirect('/login')
    }
    const {id} = req.params
    const cmt = await cmtDao.findOne({uid:id})
    const href = cmt.postId
    console.log(href)
    if(!cmt){
        req.flash('error','Không tìm thấy bình luận')
        return res.redirect('/software/'+href)
    }
    else if(cmt.by !== curUser.uid){
        req.flash('error','Bạn không có quyền truy cập')
        return res.redirect('/software/'+href)
    }

    const result = await cmtDao.findOneAndDelete({uid:id})
    req.flash('success','Xóa bình luận thành công')
    res.redirect('/software/'+href)
})

const addSoftwareValidator=[
    check('name').exists().withMessage('Vui lòng nhập tên sản phẩm')
    .notEmpty().withMessage('Vui lòng nhập tên sản phẩm'),

    check('price').exists().withMessage('Vui lòng nhập giá')
    .notEmpty().withMessage('Vui lòng nhập giá')
    .isNumeric().withMessage('Giá không hợp lệ'),

    check('description').exists().withMessage('Vui lòng nhập mô tả')
    .notEmpty().withMessage('Vui lòng nhập mô tả')
]

Router.get('/addSoftware',(req,res)=>{
    const curUser=req.session.user
    if(!curUser){
        return res.redirect('/login')
    }
    else if(curUser.role==='customer'){
        req.flash('error','Bạn không có quyền truy cập')
        return res.redirect('/')
    }
    const error=req.flash('error') || ''
    const name=req.flash('name') || ''
    const price=req.flash('price') || ''
    const desc=req.flash('desc') || ''
    supplierDao.find()
    .then(sups=>{
        res.render('addSoftware',{error,sups,name,price,desc,curUser})
    })
})

Router.post('/addSoftware',(req,res,next)=>{
    const curUser=req.session.user
    if(!curUser){
        return res.redirect('/login')
    }
    else if(curUser.role==='customer'){
        req.flash('error','Bạn không có quyền truy cập')
        return res.redirect('/')
    }
    let uploader=upload.single('image')
    uploader(req,res,err=>{
        let msg=''
        let software=req.body
        let image=req.file
        if(!image){
            msg+='Vui lòng chọn ảnh sản phẩm'
        }
        else if(err){
            msg+='Kích thước ảnh không hợp lệ'
        }

        if(msg.length>0){
            req.flash('error',msg)
            req.flash('name',software.name)
            req.flash('price',software.price)
            req.flash('desc',software.description)
            return res.redirect('/addSoftware')
        }
        fs.renameSync(image.path,`uploads/${image.originalname}`)
        const img=`uploads/${image.originalname}`
        imgPath.push(img)
        next()
    })
})

Router.post('/addSoftware',addSoftwareValidator,(req,res)=>{
    const curUser=req.session.user
    if(!curUser){
        return res.redirect('/login')
    }
    else if(curUser.role==='customer'){
        req.flash('error','Bạn không có quyền truy cập')
        return res.redirect('/')
    }
    let result=validationResult(req)
    let software=req.body
    const img=imgPath.pop()
    if(result.errors.length===0){
        supplierDao.findOne({uid:software.supplier}).then((sup)=>{
            if(!sup){
                req.flash('error','Không tìm thấy nhà cung cấp')
                return res.redirect('/addSoftware')
            }
        })
        const s= new softwareDao({
            uid:Date.now(),
            softwareName:software.name,
            price:software.price,
            description:software.description,
            softwareImage:img,
            supplierId:software.supplier
        })
        return s.save().then(()=>{
            req.flash('success','Thêm sản phẩm thành công')
            res.redirect('/softwareManager')
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
        
        res.redirect('/addSoftware')
    } 
})

Router.get('/editSoftware/:id', function ( req, res ) {
    const curUser=req.session.user
    if(!curUser){
        return res.redirect('/login')
    }
    else if(curUser.role==='customer'){
        req.flash('error','Bạn không có quyền truy cập')
        return res.redirect('/')
    }
    const {id}=req.params
    const error=req.flash('error') || ''
    softwareDao.findOne({uid:id})
    .then((software)=>{
        if(software){  
            return res.render('editSoftware',{software,error,curUser})
        }
        else{
            return res.redirect('/error')
        }
    })
})

const editSoftwareValidator=[
    check('name').exists().withMessage('Vui lòng nhập tên sản phẩm')
    .notEmpty().withMessage('Vui lòng nhập tên sản phẩm'),

    check('price').exists().withMessage('Vui lòng nhập giá')
    .notEmpty().withMessage('Vui lòng nhập giá')
    .isNumeric().withMessage('Giá không hợp lệ'),

    check('description').exists().withMessage('Vui lòng nhập mô tả')
    .notEmpty().withMessage('Vui lòng nhập mô tả')
]

Router.post('/editSoftware/:id',editSoftwareValidator,(req,res)=>{
    const curUser=req.session.user
    if(!curUser){
        return res.redirect('/login')
    }
    else if(curUser.role==='customer'){
        req.flash('error','Bạn không có quyền truy cập')
        return res.redirect('/')
    }
    const {id}=req.params
    let result=validationResult(req)
    software = req.body
    if(result.errors.length===0){
        softwareDao.findOneAndUpdate({uid:id},{softwareName:software.name,price:software.price,description:software.description},{new:true})
        .then(software=>{
            if(!software){
                req.flash('error','Sản phẩm không tồn tại hoặc đã bị xóa')
                return res.redirect('/softwareManager')
            }
            else{
                req.flash('success','Chỉnh sửa sản phẩm thành công')
                return res.redirect('/softwareManager')
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
        req.flash('error',message)
        
        res.redirect(`/editSoftware/${id}`)
    } 
})

Router.get('/editImage/:id', function ( req, res ) {
    const curUser=req.session.user
    if(!curUser){
        return res.redirect('/login')
    }
    else if(curUser.role==='customer'){
        req.flash('error','Bạn không có quyền truy cập')
        return res.redirect('/')
    }
    const {id}=req.params
    const error=req.flash('error') || ''
    softwareDao.findOne({uid:id})
    .then(software=>{
        if(software){
            return res.render('editImage',{error,software,curUser})
        }
        else{
            return res.redirect('/error')
        }
    })
    
})

Router.post('/editImage/:id',(req,res)=>{
    const curUser=req.session.user
    if(!curUser){
        return res.redirect('/login')
    }
    else if(curUser.role==='customer'){
        req.flash('error','Bạn không có quyền truy cập')
        return res.redirect('/')
    }
    let uploader=upload.single('image')
    let {id}=req.params
    uploader(req,res,err=>{
        let msg=''
        let software=req.body
        let image=req.file
        if(!image){
            msg+='Vui lòng chọn ảnh sản phẩm'
        }
        else if(err){
            msg+='Kích thước ảnh không hợp lệ'
        }

        if(msg.length>0){
            req.flash('error',msg)
            return res.redirect('/editImage/'+id)
        }
        fs.renameSync(image.path,`uploads/${image.originalname}`)
        const img=`uploads/${image.originalname}`

        softwareDao.findOneAndUpdate({uid:id},{softwareImage:`uploads/${image.originalname}`},{new:true})
        .then(software=>{
            if(!software){
                req.flash('error','Sản phẩm không tồn tại hoặc đã bị xóa')
                return res.redirect('/softwareManager')
            }
            else{
                req.flash('success','Chỉnh sửa ảnh thành công')
                return res.redirect('/softwareManager')
            }
        })
    })
})

Router.delete('/software/:id', function ( req, res ) {
    const curUser=req.session.user
    if(!curUser){
        return res.redirect('/login')
    }
    else if(curUser.role==='customer'){
        req.flash('error','Bạn không có quyền truy cập')
        return res.redirect('/')
    }
    let {id}=req.params
    softwareDao.findOneAndDelete({uid:id})
    .then(s=>{
        if(s){
            req.flash('success','Xóa sản phẩm thành công')
            return res.redirect('/softwareManager')
        }
        req.flash('error','Sản phẩm không tồn tại')
        return res.redirect('/softwareManager')
        
    })
})

// -------------------------------------------------------------------------------



Router.get('/cart',(req,res)=>{
    const curUser=req.session.user
    if(!curUser){
        return res.redirect('/login')
    }
    let cart=req.session.cart
    const error=req.flash('error') || ''
    let sum=0
    let money = numberFormat(curUser.money)
    if(cart){
        cart.forEach(s=>{
            sum+=s.price*s.quantity
        })
        cash=numberFormat(sum) || 0
        return res.render('cart',{cart,cash,curUser,error,money})
    }
    return res.render('cart',{cart,cash:0,curUser,error,money})
})

Router.put('/cart',async(req,res)=>{
    const curUser=req.session.user
    if(!curUser){
        return res.redirect('/login')
    }
   
    let cart=req.session.cart
    if(!cart || cart.length===0){
        req.flash('error','Vui lòng thêm sản phẩm')
        return res.redirect('/cart')
    }
    let sum = 0
    cart.forEach(s=>{
        sum += s.price*s.quantity
    })

    if(curUser.money < sum){
        req.flash('error','Số dư không đủ, vui lòng nạp thêm tiền')
        return res.redirect('/cart')
    }

    
    let obj = []
    const now = new Date()
    
    for(var i1=0,i2=req.session.cart.length; i1<i2; i1++){
        for(var j1=1,j2=req.session.cart[i1].quantity;j1<=j2;j1++){
            let i = req.session.cart[i1].id
            let soft = await softwareDao.findOne({uid:i})
            let newQuan = soft.quantity + 1
            let result = await softwareDao.findOneAndUpdate({uid:i},{quantity:newQuan})
            let b= rand.generate(11)
            let item = {
                softwareName: req.session.cart[i1].name,
                buyDate: now,
                key:b
            }
            obj.push(item)
        }
    }
    for(var i1=0,i2=req.session.cart.length; i1<i2; i1++){
        for(var j1=1,j2=req.session.cart[i1].quantity;j1<=j2;j1++){
            let item =  new hisDao({
                uid:Date.now(),
                softwareName: req.session.cart[i1].name,
                buyDate: now,
                by:curUser.uid
            })
            await item.save()
        }
    }
    const newMoney = curUser.money - sum
    const update = await userDao.findOneAndUpdate({uid:curUser.uid},{$push:{mySoftware:obj},money:newMoney},{upsert:true})
    const user =  await userDao.findOne({uid:curUser.uid})
    req.session.user = user

    delete req.session.cart
    req.flash('success','Thanh toán thành công')
    return res.redirect('/history')
    
})

Router.delete('/cart/:id', async(req,res)=>{
    const curUser=req.session.user
    if(!curUser){
        return res.redirect('/login')
    }
    const{id}=req.params
    let cart=req.session.cart
    index=0
    await cart.forEach(s=>{
        a=parseInt(id)
        if(s.stt===a){
            cart.splice(index,1)
        }
        else{
            index+=1
        }
    })
    return res.redirect('/cart')
})



// SUPPLIER MANAGER
Router.get('/supplierManager',(req,res)=>{
    const curUser=req.session.user
    if(!curUser){
        return res.redirect('/login')
    }
    else if(curUser.role==='customer'){
        req.flash('error','Bạn không có quyền truy cập')
        return res.redirect('/')
    }
    const error=req.flash('error') || ''
    const success=req.flash('success') || ''
    supplierDao.find().sort({_id:-1})
    .then(suppliers=>{
        res.render('supplierManager',{suppliers,error,curUser,search:'',success})
    })
})

Router.post('/supplierManager',(req,res)=>{
    const curUser=req.session.user
    if(!curUser){
        return res.redirect('/login')
    }
    else if(curUser.role==='customer'){
        req.flash('error','Bạn không có quyền truy cập')
        return res.redirect('/')
    }
    let {search}=req.body
    if(!search){
        req.flash('error','Vui lòng nhập thông tin tìm kiếm')
        return res.redirect('/supplierManager')
    }
    supplierDao.find({$or:[{supplierName:new RegExp(search,'i')},{supplierEmail:search}]}).sort({supplierName:1})
        .then(suppliers=>{
            return res.render('supplierManager',{suppliers,error:'',search,curUser,success:''})
        })
})

Router.get('/addSupplier',(req,res)=>{
    const curUser=req.session.user
    if(!curUser){
        return res.redirect('/login')
    }
    else if(curUser.role==='customer'){
        req.flash('error','Bạn không có quyền truy cập')
        return res.redirect('/')
    }
    const error=req.flash('error')
    res.render('addSupplier',{error,curUser})
})

const addSupplierValidator=[
    check('name').exists().withMessage('Vui lòng nhập tên nhà cung cấp')
    .notEmpty().withMessage('Vui lòng nhập tên nhà cung cấp'),

    check('email').exists().withMessage('Vui lòng nhập email nhà cung cấp')
    .notEmpty().withMessage('Vui lòng nhập email nhà cung cấp')
    .isEmail().withMessage('Email sai định dạng')
]

Router.post('/addSupplier',addSupplierValidator,(req,res)=>{
    const curUser=req.session.user
    if(!curUser){
        return res.redirect('/login')
    }
    else if(curUser.role==='customer'){
        req.flash('error','Bạn không có quyền truy cập')
        return res.redirect('/')
    }
    let result=validationResult(req)
    let {name,email}=req.body
    if(result.errors.length===0){
        const sup= new supplierDao({
            uid:Date.now(),
            supplierName:name,
            supplierEmail:email
        })
        return sup.save().then(()=>{
            req.flash('success','Thêm nhà cung cấp thành công')
            res.redirect('/supplierManager')
        }) 
        .catch(err=>{
            req.flash('error','Email đã tồn tại')
            return res.redirect('/addSupplier')
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
        
        res.redirect('/addSupplier')
    } 
})

Router.get('/supplier/:id',(req,res)=>{
    const curUser=req.session.user
    if(!curUser){
        return res.redirect('/login')
    }
    else if(curUser.role==='customer'){
        req.flash('error','Bạn không có quyền truy cập')
        return res.redirect('/')
    }
    const {id}=req.params
    supplierDao.findOne({uid:id})
    .then((profile)=>{
        if(profile){
            softwareDao.find({supplierId:profile.uid})
            .then((softwares)=>{
                return res.render('supplier',{profile,softwares,curUser})
            })
        }
        else{
            return res.redirect('/error') 
        } 
    })
})

Router.delete('/supplier/:id', async (req,res) => {
    const curUser=req.session.user
    if(!curUser){
        return res.redirect('/login')
    }
    else if(curUser.role==='customer'){
        req.flash('error','Bạn không có quyền truy cập')
        return res.redirect('/')
    }
    const {id}=req.params
    const s = await supplierDao.findOne({uid:id})
    if(!s){
        req.flash('error','Nhà cung cấp không tồn tại')
        return res.redirect('/supplierManager')
    }
    const result = await softwareDao.deleteMany({supplierId:s.uid})

    const result2 = await supplierDao.findOneAndDelete({uid:id})
    
    req.flash('success','Xóa nhà cung cấp thành công')
    return res.redirect('/supplierManager')
    
})

// transaction
Router.get('/transaction', async (req,res)=>{
    const curUser=req.session.user
    if(!curUser){
        return res.redirect('/login')
    }
    else if(curUser.role==='customer'){
        req.flash('error','Bạn không có quyền truy cập')
        return res.redirect('/')
    }
    const success=req.flash('success')
    const error=req.flash('error')
    const before=req.flash('before')
    const after=req.flash('after')

    const item = await hisDao.find().sort({_id:-1})

    let aBy=[]
    item.forEach(i =>{
        aBy.push(i.by)
    })

    const aUser = await userDao.find(
        {
            uid: {
                $in: aBy
            }
        }
    ).lean();

    for (var
        i1 = 0, i2 = item.length,
        j1 = 0, j2 = aUser.length;
        i1 < i2; i1++) {
        for (j1 = 0; j1 < j2; j1++) {
            if (aUser[j1].uid === item[i1].by) {
                item[i1].by = aUser[j1].email;
                break;
            }
        }    
    }

    let temp = []
    for(var i1=0,i2=item.length; i1<i2 ; i1++){
        temp.push(moment(item[i1].buyDate).format('HH:mm DD/MM/YYYY'))
    }

    res.render('transaction',{curUser,item,success,temp,error,before,after})
})

Router.post('/transaction', async (req,res)=>{
    const curUser=req.session.user
    const now = new Date()
    let msg = undefined
    if(!curUser){
        return res.redirect('/login')
    }
    else if(curUser.role==='customer'){
        req.flash('error','Bạn không có quyền truy cập')
        return res.redirect('/')
    }

    const {before,after} = req.body
    if(!before || !after){
        req.flash('error','Vui lòng nhập ngày cần tìm')
        return res.redirect('/transaction')
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
        return res.redirect('/transaction')
    }

    const i = await hisDao.find().sort({_id:-1})
    const item = []
    for(var i1=0,i2=i.length; i1<i2 ;i1++){
        let c = Date.parse(moment(i[i1].buyDate).format('YYYY-MM-DD'))

        if(c>=a && c <=b){
            item.push(i[i1])
        }
    }
    
    let aBy=[]
    item.forEach(i =>{
        aBy.push(i.by)
    })

    const aUser = await userDao.find(
        {
            uid: {
                $in: aBy
            }
        }
    ).lean();

    for (var
        i1 = 0, i2 = item.length,
        j1 = 0, j2 = aUser.length;
        i1 < i2; i1++) {
        for (j1 = 0; j1 < j2; j1++) {
            if (aUser[j1].uid === item[i1].by) {
                item[i1].by = aUser[j1].email;
                break;
            }
        }    
    }

    let temp = []
    for(var i1=0,i2=item.length; i1<i2 ; i1++){
        temp.push(moment(item[i1].buyDate).format('HH:mm DD/MM/YYYY'))
    }
    
    res.render('transaction',{curUser,item,success:'',temp,error:'',before,after})
})

// ----------------------------------------------------
module.exports=Router