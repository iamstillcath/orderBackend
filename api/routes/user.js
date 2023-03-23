const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");
const User = require("../models/user");
const { token } = require("morgan");


router.post("/signup", (req, res, next) => {
 
  User.find({ email: req.body.email })
    .exec()
    .then((user) => {
    
      if (user.length >= 1) {
        return res.status(409).json({
          message: "Account already exist for this Email",
        });
      } else {  
        const { password} = req.body;
        if(password.length > 6 ) {
            res.status(400).json({message:'Password must no be more than 6 characters long'});
            }else{
        bcrypt.hash(password, 10, (err, hash) => {
          bcrypt.compare(password, user.password, () => {
            if (err) {
              return res.status(500).json({
                message: "Incorrect credentials",
              });
            
            }
             else {
              const user = new User({
                _id: new mongoose.Types.ObjectId(),
                name: req.body.name,
                email: req.body.email,
                password: hash,
                confirmPassword: hash,
                phoneNumber: req.body.phoneNumber,
                address: req.body.address,
              });
              user

                .save()

                .then((result) => {
                  const adminEmail = "catherine@gmail.com";
                  const role = user.email === adminEmail ? "admin" : "user";
                  const token = jwt.sign(
                    {
                      email: user.email,
                      userId: user._id,
                      role,
                    },
                    process.env.JWT_KEY,
                    {
                      expiresIn: "1h",
                    }
                  );
                  const decoded = jwt.verify(token, process.env.JWT_KEY);
                  return res.status(201).json({
                    message: "User Created",
                    token: token,
                    role:decoded.role
                  });
                })
                .catch((err) => {
                  console.log(err);
                  res.status(500).json({
                    error: err,
                  });
                });
            }
          });
        });
      }}
    });
});


router.post("/login", (req, res, next) => {
  User.find({ email: req.body.email })
    .exec()
    .then((user) => {
      if (user.length < 1) {
        return res.status(401).json({
          message: "Wrong email",
          user
        });
      }
      bcrypt.compare(req.body.password, user[0].password, (err, result) => {
        if (err) {
          return res.status(401).json({
            message: "Incorrect password",
          });
        }
        if (result) {
          const adminEmail = "catherine@gmail.com";
          const role = user[0].email === adminEmail ? "admin" : "user";
          const token = jwt.sign(
            {
              email: user[0].email,
              userId: user[0]._id,
              role,
            },
            process.env.JWT_KEY,
            {
              expiresIn: "1h",
            }
          );
          const decoded = jwt.verify(token, process.env.JWT_KEY);
          return res.status("200").json({
            message: "login successful",
            token: token,
            role:decoded.role
          });
        }
        res.status(401).json({
          message: "Incorrect credentials",
        });
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

router.delete("/:userId", (req, res, next) => {
  User.remove({ _id: req.params.userId })
    .exec()
    .then((result) => {
      res.status(200).json({
        message: "User Deleted",
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

module.exports = router;
