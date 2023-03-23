const mongoose = require("mongoose");

const orderSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  product: { type: String, required: true },
  price: { type: Number, required: true },
  pickupLocation: { type: String, required: true },
  destination: { type: String, required: true },
  status: { type: String, required: true },
  currentLocation: { type: String, required: true },
  recipientName: { type: String, required: true },
  recipientNumber: { type: String , required: true },
  userId: {type: String}
});

module.exports = mongoose.model("Order", orderSchema);
