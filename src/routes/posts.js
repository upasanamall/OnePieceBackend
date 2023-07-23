import multer from "multer";
import express from "express";
import {
  addNewImagePost,
  addNewTextPost,
  addNewVideoPost
} from "../controller/addNewPost.js";
const router = express.Router();

const storage = multer.memoryStorage();

const upload = multer({
  storage: storage
}).fields([
  {
    name: "videoFile",
    maxCount: 1
  },
  {
    name: "imageFile",
    maxCount: 1
  }
]);

router.post("/", upload, async (req, res) => {
  let response = null;
  if (req.files?.imageFile) {
    req.body.files = req.files;
    console.log("checking the imagefile");
    response = await addNewImagePost(req.userData.userId, req.body);
    console.log("image post response ", response);
  } else if (req.files?.videoFile) {
    req.body.files = req.files;
    response = await addNewVideoPost(req.userData.userId, req.body);
    console.log("video post response ", response);
  } else {
    console.log("text text response ");
    response = await addNewTextPost(req.userData.userId, req.body);
    console.log("text post response ", response);
  }
  if (response?.error) res.status(500).send(response);
  else
    res.status(200).send({
      mes: "yeehhhhh!!! success",
      response
    });
});

export default router;
