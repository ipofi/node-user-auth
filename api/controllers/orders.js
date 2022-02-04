const mongoose = require('mongoose');
const Order = require('../models/order');
const Product = require('../models/product');

exports.orders_get_all = (req, res, next) => {
  Order.find()
    .select('product quantity _id')
    .populate('product', 'name')
    .exec()
    .then((docs) => {
      const response = {
        count: docs.length,
        orders: docs.map((doc) => {
          return {
            _id: doc._id,
            product: doc.product,
            quantity: doc.quantity,
            request: {
              type: 'GET',
              url: `http://localhost:3000/orders/${doc._id}`,
            },
          };
        }),
      };
      res.status(200).json(response);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
};

exports.orders_create_order = (req, res, next) => {
  Product.findById(req.body.productId)
    .then((product) => {
      if (!product) {
        res.status(404).json({ message: 'Product not found' });
      }
      const order = new Order({
        _id: new mongoose.Types.ObjectId(),
        product: req.body.product,
        quantity: req.body.quantity,
      });
      return order.save();
    })
    .then((result) => {
      res.status(201).json({
        message: 'Order stored',
        createdOrder: {
          product: result.product,
          quantity: result.quantity,
          _id: result._id,
          reuest: {
            type: 'GET',
            url: `http://localhost:3000/orders/${result._id}`,
          },
        },
      });
    })
    .catch((error) => {
      console.log(error);
    });
};

exports.orders_get_order = (req, res, next) => {
  const { orderId } = req.params;
  Order.findById(orderId)
    .populate('product')
    .exec()
    .then((order) => {
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
      res.status(200).json({
        order: order,
        request: {
          type: 'GET',
          url: 'http://localhost:3000/orders',
        },
      });
    })
    .catch((err) => {
      res.status(500).json({ error: err });
    });
};

exports.orders_delete_order = (req, res, next) => {
  const { orderId } = req.params;
  Order.deleteOne({ _id: orderId })
    .exec()
    .then((result) => {
      console.log(result);
      res.status(200).json({
        message: 'Order deleted',
        request: {
          type: 'POST',
          url: 'http://localhost:3000/orders/',
          body: { product: 'String', quantity: 'Number' },
        },
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
};
