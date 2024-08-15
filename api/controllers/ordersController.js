const P2PLoansOrder = require("../../model/p2pLoans/modelP2POrder");

const createOrder = async (req, res) => {
  try {
    const {
      buyerId,
      sellerId,
      type,
      name,
      currency,
      price,
      photo,
      description,
      requisites,
      collateral,
      downPayment
    } = req.body;

    const result = await P2PLoansOrder.create({
      buyerId: buyerId,
      sellerId: sellerId,
      statusOrder: 'Processed',
      type: type,
      name: name,
      currency: currency,
      price: price,
      photo: photo,
      description: description,
      requisites: requisites,
      collateral: collateral,
      downPayment: downPayment
    });

    console.log(result);

    res.status(200).json({
      status: 'ok',
      error: '',
      message: 'order created',
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: 'error create order',
      message: error.message,
    });
  }
};

const getUserOrders = async (req, res) => {
  try {
    const { userId } = req.query;

    let messageResponse = 'orders find';

    const result = await P2PLoansOrder.find({
      $or: [
        { buyerId: userId },
        { sellerId: userId }
      ]
    });

    if (!result.length) messageResponse = 'no orders found';

    res.status(200).json({
      status: 'ok',
      error: '',
      data: {
        orders: result
      },
      message: messageResponse,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: 'error search order',
      data: {},
      message: error.message,
    });
  }
};

const getAllOrders = async ( req, res ) => {
  try {
    const result = await P2PLoansOrder.find();

    console.log(result);

    res.status(200).json({
      status: 'ok',
      error: '',
      data: {
        orders: result
      },
      message: 'orders find',
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: 'error search order',
      data: {},
      message: error.message,
    });
  }
};


module.exports = {
  createOrder,
  getUserOrders,
  getAllOrders
};
