const express = require('express');
const router = express.Router();
const {Order} = require('../models/order');
const {OrderItem} = require('../models/order-item')
const {Product} = require('../models/product')



/**
 * @swagger
 * components:
 *   schemas:
 *     Orders:
 *       type: object
 *       required:
 *         - name
 *         - description
 *         - price
 *         - category
 *         - countInStock
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated ID of the product
 *         name:
 *           type: string
 *           description: The product name
 *         description:
 *           type: string
 *           description: Product description
 *         price:
 *           type: number
 *           description: Product price
 *         category:
 *           type: string
 *           description: Category ID
 *         countInStock:
 *           type: number
 *           description: Available stock
 *       example:
 *         id: 60d21b96e7c8b5e9c8a73e27
 *         name: Sample Product
 *         description: A great product
 *         price: 29.99
 *         category: 60c72b2f9b1d4c001c8e4c3b
 *         countInStock: 100
 */




router.get(`/`, async (req, res) => {
    //to see the details of user that order an item
    const orderList = await Order.find().populate('user', 'name').sort({'dateOrdered':-1});
    if(!orderList){
        res.status(500).json({success: false})
    }
    res.send(orderList);

});

router.get(`/:id`, async (req, res) => {
    //to see the details of user that order an item
    const order = await Order.findById(req.params.id)
    .populate('user', 'name')
    .populate({
        path: 'orderItems', populate: {
        path:'product',populate: 'category'}
    })
    if(!order){
        res.status(500).json({success: false})
    }
    res.send(order);

});

router.post(`/`, async(req, res) => {
   //combine all the orderItems use promise method
    const orderItemsIds = Promise.all(req.body.orderItems.map(async (orderItem) =>{
        //order items recieved
        let newOrderItem = new OrderItem({
            quantity: orderItem.quantity,
            product: orderItem.product
        })
      //save order Items in the database
        newOrderItem = await newOrderItem.save();

        return newOrderItem._id;
    }))
    //to resolve the promise
    const orderItemsIdsResolved =  await orderItemsIds;

    const totalPrices = await Promise.all(orderItemsIdsResolved.map(async (orderItemId)=>{
        const orderItem = await OrderItem.findById(orderItemId).populate('product', 'price');
        const totalPrice = orderItem.product.price * orderItem.quantity;
       
        return totalPrice
    }))
    
    console.log(totalPrices)
    const totalPrice = totalPrices.reduce((a,b) => a +b , 0);

    let order = new Order({
        orderItems: orderItemsIdsResolved,
        shippingAddress1: req.body.shippingAddress1,
        shippingAddress2: req.body.shippingAddress2,
        city: req.body.city,
        zip: req.body.zip,
        country: req.body.country,
        phone: req.body.phone,
        status: req.body.status,
        totalPrice: totalPrice,
        user: req.body.user,
       
    })

    order = await order.save();

    if(!order)
    return res.status(400).send('the order cannot be created!')

    res.send(order);
   
});

router.put('/:id', async(req, res)=>{
    const order = await Order.findByIdAndUpdate(
    req.params.id,
    {
        status: req.body.status
    },
    {new: true}
    )
    //if there is data inside the order
    if (!order)
        return res.status(400).json({ message: 'The order cannot be created' })

    res.send(order);

})

router.delete('/:id', (req, res) => {
    Order.findByIdAndRemove(req.params.id)
        .then(async order => {
            if (order) {
                await order.orderItems.map(async orderitems =>{
                    await OrderItem.findByIdAndRemove(orderitems)
                })
                return res.status(200).json({
                    success: true, message: 'The order has been deleted'
                })
            }
            else {
                return res.status(404).json({
                    success: false, message: "order not found"
                })
            }
        }).catch(err => {
            return res.status(400).json({
                success: false,
                error: err
            })
        })
})

//get sum of all the total price (admin)
router.get('/get/totalsales', async(req, res)=>{
   const totalSales = await Order.aggregate([
     //group all the prices
     { $group:{_id: null, totalsales: {$sum: '$totalPrice'}}}
   ]) 
   if(!totalSales){
    return res.status(400).send('The order Sales can nit be generated')
   }
//get the first item in the totalsales array use pop method
   res.send({totalsales: totalSales.pop().totalsales})
})

//get total count of the orders (Admin)
router.get(`/get/count`, async (req, res) => {
    const ordercount = await Order.countDocuments([count => count])
    if (!ordercount) {
        res.status(500).json({ success: false })
    }
    //because we return a json
    res.send({ ordercount: ordercount });

});

router.get(`/get/userorders/:userid`, async (req, res) => {
    //to see the details of user that order an item
    const userOrderList = await Order.findById(req.params.userid)
     .populate({
        path: 'orderItems', populate: {
        path:'product',populate: 'category'}
    }).sort({'dateOrdered':-1});
    if(!userOrderList){
        res.status(500).json({success: false})
    }
    res.send(userOrderList);

});



module.exports = router;
