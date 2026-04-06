const Order = require('../models/Order');
const { generateJazzCashHash } = require('../utils/jazzCashSign');

// @desc    Create new order(s)
const addOrderItems = async (req, res) => {
  try {
    const { orderItems, paymentMethod, customerContact, tableNumber } = req.body;
    
    if (orderItems && orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    const groupedOrders = {};
    orderItems.forEach(item => {
        if (!groupedOrders[item.restaurant_id]) {
            groupedOrders[item.restaurant_id] = { items: [], total: 0 };
        }
        groupedOrders[item.restaurant_id].items.push({
            menuItem: item.menuItem,
            qty: item.qty,
            price: item.price
        });
        groupedOrders[item.restaurant_id].total += (item.qty * item.price);
    });

    const createdOrders = [];
    const masterTrackingId = 'TRK' + Date.now(); // Common ref for batch
    let totalPaisaAmount = 0;

    for (const [restId, data] of Object.entries(groupedOrders)) {
        const order = new Order({
            customer_id: req.user?._id || null, 
            restaurant_id: restId,
            items: data.items,
            totalAmount: data.total,
            paymentMethod,
            customerContact,
            tableNumber,
            trackingId: masterTrackingId + '-' + Math.random().toString(36).substring(2, 5).toUpperCase(),
            paymentStatus: paymentMethod === 'JazzCash' ? 'Pending' : 'Pending',
        });
        const createdOrder = await order.save();
        createdOrders.push(createdOrder);
        totalPaisaAmount += Math.round(data.total * 100); 
    }

    if (paymentMethod === 'JazzCash') {
        const currentDate = new Date();
        const pDate = currentDate.getFullYear() + ('0' + (currentDate.getMonth() + 1)).slice(-2) + ('0' + currentDate.getDate()).slice(-2) + ('0' + currentDate.getHours()).slice(-2) + ('0' + currentDate.getMinutes()).slice(-2) + ('0' + currentDate.getSeconds()).slice(-2);
        const expDateObj = new Date(currentDate.getTime() + 60 * 60 * 1000);
        const pExp = expDateObj.getFullYear() + ('0' + (expDateObj.getMonth() + 1)).slice(-2) + ('0' + expDateObj.getDate()).slice(-2) + ('0' + expDateObj.getHours()).slice(-2) + ('0' + expDateObj.getMinutes()).slice(-2) + ('0' + expDateObj.getSeconds()).slice(-2);

        const params = {
            pp_Version: "1.1",
            pp_TxnType: "MWALLET",
            pp_Language: "EN",
            pp_MerchantID: process.env.JC_MERCHANT_ID || "",
            pp_Password: process.env.JC_PASSWORD || "",
            pp_TxnRefNo: masterTrackingId,
            pp_Amount: totalPaisaAmount.toString(),
            pp_TxnCurrency: "PKR",
            pp_TxnDateTime: pDate,
            pp_BillReference: "SmartDine",
            pp_Description: "Gourmet Meal Checkout",
            pp_TxnExpiryDateTime: pExp,
            pp_ReturnURL: process.env.JC_RETURN_URL || `http://localhost:${process.env.PORT || 5000}/api/orders/jazzcash/callback`,
        };

        const integritySalt = process.env.JC_INTEGRITY_SALT || "";
        const secureHash = generateJazzCashHash(params, integritySalt);
        
        return res.status(201).json({ 
            isJazzCash: true, 
            jazzCashParams: { ...params, pp_SecureHash: secureHash },
            orders: createdOrders 
        });
    }

    res.status(201).json({ isJazzCash: false, orders: createdOrders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    JazzCash Webhook Callback
const jazzCashCallback = async (req, res) => {
    try {
        const responseData = req.body;
        console.log("JazzCash Callback Received:", responseData);

        const receivedHash = responseData.pp_SecureHash;
        delete responseData.pp_SecureHash; // Remove hash from params to recalculate

        const integritySalt = process.env.JC_INTEGRITY_SALT || "";
        const calculatedHash = generateJazzCashHash(responseData, integritySalt);

        if (calculatedHash === receivedHash && responseData.pp_ResponseCode === "000") {
            const masterTrackingId = responseData.pp_TxnRefNo;
            
            // Because our orders use TRK12345678-ABC format, we find by regex prefix
            await Order.updateMany(
                { trackingId: { $regex: `^${masterTrackingId}` } },
                { $set: { paymentStatus: 'Paid', status: 'Preparing' } }
            );

            // Redirect to frontend success page
            return res.redirect('http://localhost:5173/myorders?payment=success');
        } else {
            console.error("JazzCash Verification Failed or Payment Error", responseData.pp_ResponseMessage);
            return res.redirect('http://localhost:5173/billing?payment=failed');
        }
    } catch (error) {
        console.error("JazzCash Callback Exception:", error);
        return res.redirect('http://localhost:5173/billing?payment=error');
    }
};

// @desc    Get all orders (Admin Only)
const getOrders = async (req, res) => {
    try {
        const orders = await Order.find({})
            .populate('customer_id', 'name email')
            .populate('restaurant_id', 'name')
            .populate('items.menuItem', 'name price');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customer_id: req.user._id })
      .populate('restaurant_id', 'name')
      .populate({ path: 'items.menuItem', select: 'name imageUrl' });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const trackOrder = async (req, res) => {
    try {
        const order = await Order.findOne({ trackingId: req.params.trackingId })
            .populate('restaurant_id', 'name')
            .populate({ path: 'items.menuItem', select: 'name' });
        
        if (order) {
            res.json(order);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getRestaurantOrders = async (req, res) => {
    try {
        const RestaurantProfile = require('../models/RestaurantProfile');
        const profile = await RestaurantProfile.findOne({ user_id: req.user._id });
        if (!profile) return res.status(404).json({ message: 'Restaurant Profile not found' });

        const orders = await Order.find({ restaurant_id: profile._id })
            .populate('customer_id', 'name')
            .populate('items.menuItem', 'name');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateOrderStatus = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (order) {
            order.status = req.body.status || order.status;
            const updatedOrder = await order.save();
            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = { addOrderItems, getOrders, getMyOrders, trackOrder, getRestaurantOrders, updateOrderStatus, jazzCashCallback };
