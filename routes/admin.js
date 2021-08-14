var express = require('express');
var router = express.Router();
var productHelper=require('../helpers/product-helpers');
const userHelpers=require('../helpers/user-helpers');

const verifyLogin=(req,res,next)=>{
  if(req.session.adminLoggedIn){
    next()
  }else
   res.redirect('/admin/login');
  
}



/* GET users listing. */
router.get('/', function(req, res, next) {
  productHelper.getAllProduct().then((products)=>{
    console.log(products);
    res.render('admin/view-products',{products,admin:true});
  })
  
});

router.get('/add-product',verifyLogin,(req,res)=>{
     res.render('admin/add-product')
})
router.post('/add-product',(req,res)=>{
   
    productHelper.addProduct(req.body,(id)=>{
      let image=req.files.Image
      image.mv('./public/product-images/'+id+'.jpg',(err,done)=>{
        if(!err){
          res.render('admin/add-product')
        }else{
          console.log(err)
        }
        

      })
    
    });
})
router.get('/delete-product/:id',(req,res)=>{
     let proId=req.params.id
     productHelper.deleteProduct(proId).then((response)=>{
          res.redirect('/admin/');
     })

     
})
router.get('/edit-product/:id',async (req,res)=>{
  let product=await productHelper.getProductDetails(req.params.id)



  res.render('admin/edit-product',{product});
})
router.post('/edit-product/:id',(req,res)=>{
  let id=(req.params.id);
  productHelper.updateProduct(req.params.id,req.body).then(()=>{
    
    res.redirect('/admin/');
    if(req.files.Image){
      let image=req.files.Image
      image.mv('./public/product-images/'+id+'.jpg');
    }
  })
})
router.get('/login',(req,res)=>{
  if(req.session.admin){
    res.redirect('/admin')
  }else{
 res.render('admin/login',{'logginErr':req.session.adminLoginErr});}
 req.session.adminLoginErr=false;
  
})
router.post('/login',(req,res)=>{
  userHelpers.adminLogin(req.body).then((response)=>{
    console.log(req.body);
    if(response.status){
      req.session.admin=response.admin
      req.session.adminLoggedIn=true;

      res.redirect('/admin');
    }else{
      req.session.userLoginErr="invalid username or password";
      res.redirect('/admin');
    }
  })  
  })
  router.get('/all-users',verifyLogin,(req,res)=>{
    userHelpers.getAllusers().then((users)=>{
      
      res.render('admin/all-users',{users,admin:true})
    })
    
  })
  router.get('/all-orders',verifyLogin,(req,res)=>{
    userHelpers.getAllorders().then((orders)=>{
      console.log(orders)
      res.render('admin/all-orders',{orders,admin:true})
    })
  })


  module.exports = router;
