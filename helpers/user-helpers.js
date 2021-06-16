var db=require('../config/connection');
var collection=require('../config/collection');
var bcrypt=require('bcrypt');
let objectId=require('mongodb').ObjectID;
const { Db } = require('mongodb');
const { response } = require('express');

module.exports={
       doSignup:(userData)=>{
          return new Promise(async (resolve,reject)=>{
              userData.Password=await bcrypt.hash(userData.Password,10);
              db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data)=>{
                  resolve(data.ops[0]);
          })
          
          })
          
    },
    doLogin:(userData)=>{
        return new Promise(async (resolve,reject)=>{
          let loginStatus=false
          let response={}  
           let user=await db.get().collection(collection.USER_COLLECTION).findOne({Email:userData.Email})
           if(user){
                bcrypt.compare(userData.Password,user.Password).then((status)=>{
                   if(status){
                       console.log('login success');
                       response.user=user
                       response.status=true
                       resolve(response)
                   }else{
                       console.log('login failed');
                       resolve({status:false})
                   }
               })
           }else{
               console.log('login failed')
               resolve({status:false})
           }
        })
    },
    addToCart:(proId,userId)=>{
        return new Promise(async (resolve,reject)=>{
        let userCart=await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)})
        if(userCart){

        }else{
            let cartObj={
                user:objectId(userId),
                proId:[objectID(proId)]
            }
            db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response)=>{
                resolve()
            })
        
        }

    })
        }
}