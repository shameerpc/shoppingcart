var db=require('../config/connection')
var collection=require('../config/collection')
let objectId=require('mongodb').ObjectID
module.exports={
    addProduct:(product,callback)=>{
        product.Price=parseInt(product.Price);
        db.get().collection('product').insertOne(product).then((data)=>{
            
            callback(data.ops[0]._id);

        })
    },
    getAllProduct:()=>{
        return new Promise(async (resolve,reject)=>{
            let  products=await db.get().collection(collection.PRODUCT_COLLECTON).find().toArray()
            resolve(products)
        });
    },
    deleteProduct:(prodId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTON).removeOne({_id:objectId(prodId)}).then((response)=>{
                
                resolve(response);
            })
        })
    },
    getProductDetails:(proId)=>{
        return new Promise( (resolve,reject)=>{
             db.get().collection(collection.PRODUCT_COLLECTON).findOne({_id:objectId(proId)}).then((product)=>{
                resolve(product);
            })
        })
    },
    updateProduct:(proId,prodtDetail)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTON)
            .updateOne({_id:objectId(proId)},{
                $set:{
                    Name:prodtDetail.Name,
                    Category:prodtDetail.Category,
                    Price:parseInt(prodtDetail.Price),
                    Description:prodtDetail.Description
                }
            }).then((response)=>{
                resolve();
            })
        })
    }
}