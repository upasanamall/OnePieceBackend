import express from "express";
import bcrypt from "bcrypt";
import User from "../models/User.js";

import { updateSelectedFacebookGroup } from "../controller/users.js";

const router = express.Router();

router.get("/", (req, res, next) => {
  console.log("response", req);
  User.find(
    { _id: req.userData.userId },
    { password: 0, _id: 0, __v: 0, createdAt: 0, updatedAt: 0 }
  )
    .exec()
    .then((user) => {
      //   if (user.length < 1) {
      //     // 401 means unauthorized
      //     return res.status(401).json({
      //       message: 'Auth failed'
      //     });
      //   }
      //   bcrypt.compare(req.body.password, user[0].password, (err, result) => {
      //     if (err) {
      //       return res.status(401).json({
      //         message: 'Auth failed'
      //       });
      //     }
      //     if (result) {
      //       const token = jwt.sign({
      //         userId: user[0]._id,
      //         firstName: user[0].firstName,
      //         lastName: user[0].lastName,
      //         email: user[0].email,
      //       },
      //       'my_secret_key',
      //       {
      //         expiresIn: "1h"
      //       });
      //       return res.status(200).json({
      //         message: 'Auth successful',
      //         token: token,
      //         userId:user[0]._id
      //       });
      //     }
      //     res.status(401).json({
      //       message: 'Auth failed'
      //     });
      //   });
      return res.status(200).json(user[0]);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

router.put("/:id", (req, res, next) => {
  console.log("response", req.params, req.body);
  User.findByIdAndUpdate({ _id: req.params.id }, req.body, {
    useFindAndModify: false
  })
    .exec()
    .then((user) => {
      if (user) return res.status(200).json(req.body);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

router.put("/password/:id", (req, res, next) => {
  User.find({ email: req.body.email })
    .exec()
    .then((user) => {
      bcrypt.compare(req.body.password, user[0].password, (err, result) => {
        if (err) {
          return res.status(401).json({
            message: "Auth failed"
          });
        }
        console.log("result", result);
        if (result) {
          bcrypt.hash(req.body.newPassword, 10, (err, hash) => {
            if (err) {
              console.log(err);
              return res.status(500).json({
                error: err
              });
            } else {
              console.log("im here");
              // const user = new User({
              //     _id: new mongoose.Types.ObjectId(),
              //     firstName: req.body.firstName,
              //     lastName: req.body.lastName,
              //     email: req.body.email,
              //     password: hash
              // });
              console.log("req.body.newPassword", req.body.newPassword, hash);
              User.findByIdAndUpdate(
                { _id: req.params.id },
                { password: hash },
                { useFindAndModify: false }
              )
                .exec()
                .then(() => {
                  return res.status(200).json({
                    message: "Password updated Successfully"
                  });
                })
                .catch(() => {
                  return res.status(409).json({
                    message: "Something went wrong!"
                  });
                });
            }
          });
        }
        if (!result) {
          res.status(403).json({
            message: "Old Password is Mismatch"
          });
        }
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

router.put("/updateSelectedFbGroup", async (req, res) => {
  try {
    const response = await updateSelectedFacebookGroup(
      req.userData.userId,
      req.body.selectedGroup
    );
    if (response.error) {
      return res.status(500).send(response);
    }
    res.status(200).send("yohoho");
  } catch (e) {
    return res.status(500).send("unable to update the selected fbGroup");
  }
});

export default router;
