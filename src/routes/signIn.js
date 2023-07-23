import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  authenticate,
  getUserGroups,
  getGroupFeed,
  publishPostInGroup
} from "../sdk/facebook.js";
import User from "../models/User.js";
const router = express.Router();

router.post("/", async (req, res, next) => {
  console.log("req.body.email", req.body);
  try {
    await User.find({ email: req.body.email })
      .exec()
      .then((user) => {
        console.log("user", user);
        if (user.length < 1) {
          // 401 means unauthorized
          return res.status(401).json({
            message: "Auth failed 1"
          });
        }
        bcrypt.compare(req.body.password, user[0].password, (err, result) => {
          if (err) {
            return res.status(401).json({
              message: "Auth failed 2"
            });
          }
          if (result) {
            const token = jwt.sign(
              {
                userId: user[0]._id,
                firstName: user[0].firstName,
                lastName: user[0].lastName,
                email: user[0].email
              },
              "my_secret_key",
              {
                expiresIn: "1h"
              }
            );
            return res.status(200).json({
              message: "Auth successful",
              token: token
            });
          }
          res.status(401).json({
            message: "Auth failed 3"
          });
        });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({
          error: err
        });
      });
  } catch (e) {
    console.log("errror occured", e);
    res.send("no chance dude");
  }
});

router.post("/facebook/accounts/authenticate", async (req, res) => {
  console.log("hello facebook", req);
  {
    console.log("here");
    const FBResponse = await authenticate(req);
    console.log("FBResponse", FBResponse);
    res.send(FBResponse);
  }
});

router.get("/facebook/groups", async (req, res) => {
  const FBResponse = await getUserGroups(req);
  console.log("FBResponse", FBResponse);
  res.send(FBResponse);
});

router.get("/facebook/feed", async (req, res) => {
  const FBResponse = await getGroupFeed(req);
  console.log("FBResponse", FBResponse);
  res.send(FBResponse);
});

router.post("/facebook/publish", async (req, res) => {
  const FBResponse = await publishPostInGroup(req);
  console.log("FBResponse", FBResponse);
  res.send(FBResponse);
});

export default router;
