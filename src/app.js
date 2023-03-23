const express = require("express");
const app = express();
const morgan = require("morgan");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require("path");
const cors =require("cors")
require("dotenv").config();

const PORT = process.env.PORT || 3000;


const orderRoute = require("../api/routes/order");
const userRoute = require("../api/routes/user");

mongoose.connect(process.env.DATABASE_URL)
.then(success=>{
  console.log("db connected")  
})
.catch(error=>{console.log("db not connected")})

mongoose.Promise = global.Promise;

app.use(morgan("dev"));
app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin,X-Requested-With,Content-Type",
    "Accept",
    "Authorization"
  );


  // if (req.method == "OPTIONS") {
  //   res.header("Access-Control-Allow-Methods", "Authorization","PUT, GET, POST, PATCH,DELETE","OPTIONS");
  //   return res.status(200).json({});
  // }
  next();
});


app.get('/',function(req,res){
//   res.sendFile(path.join(__dirname+'/front/index.html'));
res.send("this is backend")
});



app.use("/parcels", orderRoute);
app.use("/user", userRoute);

app.use((req, res, next) => {
  const error = new Error("wrong route input");
  error.status = 404;
  next(error);
});
app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message,
    },
  });
});

app.listen(PORT, () => console.log(`app is running on port ${PORT}`))

module.exports = app;