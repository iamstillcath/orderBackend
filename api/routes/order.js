const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const checkAuth = require("../middleware/check.auth");
const Admin = require("../middleware/admin");
const Order = require("../models/order");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
 

router.get("/", Admin, (req, res, next) => {
  Order.find()
    .select(" product price quantity destination status pickupLocation recipientName recipientNumber currentLocation userId")
    .exec()
    .then((doc) => {
      const response = {
        count: doc.length,
        parcels: doc,
      };
      res.status(200).json(doc);
    })
    .catch((err) => {
      res.status(500).json({ message: err });
    });
});


router.post("/",checkAuth, (req, res, next) => {
  const user = req.userData;
  const order = new Order({
    _id: new mongoose.Types.ObjectId(),
    userId: user.userId,
    product: req.body.product,
    price: req.body.price,
    pickupLocation: req.body.pickupLocation,
    destination: req.body.destination,
    status: "created",
    currentLocation: req.body.currentLocation,
    recipientName: req.body.recipientName,
    recipientNumber: req.body.recipientNumber,
  });
  order.save().then((result) => {
    res.status(200).json({
      message: "order successfully created",
      id: result._id,
      product: result.product,
      price:result.price,
      pickupLocation:result.pickupLocation,
      destination:result.destination,
      status:result.status,
      currentLocation:result.currentLocation,
      recipientName:result.recipientName,
      recipientNumber:result.recipientNumber
    })
    
    })
    .catch((err) => {
      res.status(500).json({
        error: err
      });
  });
});



router.get("/user", checkAuth, (req, res, next) => {
  const user = req.userData;
  Order.find({ userId: user.userId })
    .select(" product price quantity destination status pickupLocation recipientName recipientNumber currentLocation userId")
    .exec()
    .then((doc) => {
      const response = {
        count: doc.length,
        parcels: doc,
      };
      return res.status(200).send(doc);
    })
    .catch((err) => {
      res.status(500).json({ message: "you have no parcel order" });
    });
});


router.put("/:ordersId/destination", checkAuth, (req, res, next) => {
  const id = req.params.ordersId;
  const destination = req.body.destination;
  Order.updateOne(
    { _id: id },
    {
      destination: destination,
    },
    { upsert: true }
  )
    .then((result) => res.status(200).json({ message: "Destination updated" }))
    .catch((err) => {
      res.status(500).json({ error: "no request found with this Id" });
    });
});


router.put("/:statusId/status", Admin, (req, res, next) => {
  const id = req.params.statusId;
  const statuss = ["created", "in-transit", "delivered"];
  const status = req.body.status;
  if (!statuss.includes(status))
    return res.status(401).json({ message: "Status invalid" ,status:0});

  Order.updateOne(
    { _id: id },
    {
      status: status,
    },
    { upsert: true }
  )
    .then((result) => res.status(200).json({ message: "Status  updated ",status:1 }))
    .catch((err) => {
      res.status(500).json({ error: "no request found with this Id",status:0 });
    });
});



router.put("/:statusId/currentLocation", Admin, (req, res, next) => {
  const id = req.params.statusId;
  const CurrentLocation = req.body.currentLocation;
  Order.updateOne(
    { _id: id },
    {
      currentLocation: CurrentLocation,
    },
    { upsert: true }
  )
    .then(() => res.status(200).json({ message: "Current Location  updated " }))
    .catch((err) => {
      res.status(500).json({ error: "no request found with this Id" });
    });
});


router.delete("/:orderId/delete", checkAuth, (req, res, next) => {
  const id = req.params.orderId;
  Order.remove({ _id: id })
    .exec()
    .then((result) => {
      res.status(200).json({ message: "Order Deleted" });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: "no request found with this Id" });
    });
});

module.exports = router;
