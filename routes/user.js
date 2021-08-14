const { response, json } = require('express');
var express = require('express');
var router = express.Router();
const productHelpers=require('../helpers/product-helpers');
const userHelpers=require('../helpers/user-helpers');

const verifyLogin=(req,res,next)=>{
  if(req.session.user.loggedIn){
    next()
  }else
   res.redirect('login');
  
}


/* GET home page. */
router.get('/',async function(req, res, next) {
  let user=req.session.user
  let cartCount=0
  if(req.session.user){
  cartCount=await userHelpers.getCartCount(req.session.user._id)
  }
  productHelpers.getAllProduct().then((products)=>{
    
    
    res.render('user/view-products',{products,user,cartCount});
  })
})
router.get('/login',(req,res)=>{
     if (req.session.user){
       res.redirect('/')
     }else{
    res.render('user/login',{'logginErr':req.session.userLoginErr});}
    req.session.userLoginErr=false;
})
router.get('/signup',(req,res)=>{
   res.render('user/sighnup');
})
router.post('/signup',(req,res)=>{
    userHelpers.doSignup(req.body).then((data)=>{
    console.log(data);
    
    req.session.user=response;
    req.session.user.loggedIn=true
    res.redirect('/');
     })
})
router.post('/login',(req,res)=>{
    userHelpers.doLogin(req.body).then((response)=>{
      if(response.status){
       
        req.session.user=response.user
        req.session.user.loggedIn=true;

        res.redirect('/');
      }else{
        req.session.userLoginErr="invalid username or password";
        res.redirect('/login');
      }
    })  
    })
 router.get('/logout',(req,res)=>{
    req.session.user=null;
    req.session.userLoggedIn=false;
    res.redirect('/');
 })
 router.get('/cart',verifyLogin,async(req,res)=>{
   let products=await userHelpers.getCartProducts(req.session.user._id)
   let totalValue=0
   if(products.length>0){
    totalValue=await userHelpers.getTotalAmount(req.session.user._id)
   }
  
   
   res.render('user/cart',{products,user:req.session.user._id,totalValue})
 })  
 router.get('/add-to-cart/:id',(req,res)=>{
   console.log("api call");
   
    userHelpers.addToCart(req.params.id,req.session.user._id).then(()=>{
     
      res.json({status:true})
    })
 })
router.post('/change-product-quantity',(req,res,next)=>{
   
   userHelpers.changeProductQuantity(req.body).then(async(response)=>{
    response.total=await userHelpers.getTotalAmount(req.body.user)
      res.json(response);
   })
})
router.post('/remove-button',(req,res,next)=>{
  
  userHelpers.removeCartProduct(req.body).then((response)=>{
    res.json(response);
  })
})
router.get('/place-order',verifyLogin,async (req,res)=>{
  let total=await userHelpers.getTotalAmount(req.session.user._id)
    res.render('user/place-order',{total,user:req.session.user});
})
router.post('/place-order',async(req,res)=>{
  let products=await userHelpers.getCartProductList(req.session.user._id)
  
  let totalPrize=await userHelpers.getTotalAmount(req.body.userId)
  userHelpers.placeOrder(req.body,products,totalPrize).then((orderId)=>{
    if(req.body['payment-method']=='COD'){
      res.json({codSuccess:true})
    }else{
      userHelpers.generateRazorpay(orderId,totalPrize).then((response)=>{
          res.json(response)
      })
    }
   
  })
  
})
router.get('/order-success',(req,res)=>{
  res.render('user/order-success',{user:req.session.user})
})
router.get('/orders',async(req,res)=>{
  let orders=await userHelpers.getUserOrders(req.session.user._id)
  
  res.render('user/orders',{user:req.session.user,orders})
})
router.get('/view-order-products/:id',async(req,res)=>{
  let products=await userHelpers.getOrderProducts(req.params.id)
  
   res.render('user/view-order-products',{user:req.session.user,products})
})
    
 router.post('/verify-payment',(req,res)=>{
    console.log(req.body,"response");
    userHelpers.verifyPayment(req.body).then(()=>{
      console.log("verification completed")
       userHelpers.changePaymentStatus(req.body['order[receipt]']).then(()=>{
         console.log('payment success');
         res.json({status:true})
       })

    }).catch((err)=>{
      console.log(err)
       res.status({status:false,errMsg:''})
    })

 })

module.exports = router;
