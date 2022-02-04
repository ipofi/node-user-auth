const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

exports.user_signup = (req, res, next) => {
  const { email, password } = req.body;

  User.find({ email: email })
    .exec()
    .then((user) => {
      if (user.length >= 1) {
        return res.status(409).json({ message: 'Email exists' });
      } else {
        bcrypt.hash(password, 10, (err, hash) => {
          if (err) {
            return res.status(500).json({
              err: err,
            });
          } else {
            const user = new User({
              _id: new mongoose.Types.ObjectId(),
              email: email,
              password: hash,
            });

            user
              .save()
              .then((result) => {
                console.log(result);
                res.status(201).json({
                  message: 'User created',
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
      }
    });
};

exports.user_login = (req, res, next) => {
  const { email, password } = req.body;
  User.findOne({ email: email })
    .exec()
    .then((user) => {
      if (!user) {
        return res.status(401).json({ message: 'Auth failed' });
      }
      bcrypt.compare(password, user.password, (err, result) => {
        if (err) {
          return res.status(401).json({ message: 'Auth failed' });
        }

        if (result) {
          const token = jwt.sign(
            { email: user.email, userId: user._id },
            process.env.JWT_KEY,
            {
              expiresIn: '1h',
            }
          );
          return res
            .status(200)
            .json({ message: 'Auth Successful', token: token });
        }

        return res.status(401).json({ message: 'Auth failed' });
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
};

exports.user_delete = (req, res, next) => {
  const { userId } = req.params;

  User.deleteOne({ _id: userId })
    .exec()
    .then((response) => {
      console.log(response);
      res.status(200).json({
        message: 'User deleted',
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
};
