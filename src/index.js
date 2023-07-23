import app from "./App.js";
import axios from "axios";
import multer from "multer";
import FormData from "form-data";
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage
}).fields([
  {
    name: "media",
    maxCount: 1
  },
  {
    name: "image",
    maxCount: 1
  }
]);

app.get("/", (req, res) => {
  res.send("still working");
});

app.post("/testing", upload, (req, res) => {
  console.log("these are the files===>>", req.files);
  console.log("these are the body===>>", req.body);
  res.send("nothing to see here");
});

app.get("/test", async (req, res) => {
  try {
    // const response = await axios.post(
    //   "https://upload.twitter.com/1.1/media/upload.json?media_category=tweet_image",
    //   {},
    //   {
    //     headers: {
    //       Authorization:
    //         'OAuth oauth_consumer_key="4xHWiZzCDoo3kK6XCpAr6MSFN",oauth_signature_method="HMAC-SHA1",oauth_version="1.0",oauth_timestamp="1668882308",oauth_token="1592231991214161921-Y0UMMa0C9cwlIcZ0OkZwvsT9a09K6R",oauth_nonce="7ef949",oauth_signature=""ZsmFpO8tgXsTcmXuZT%2Bd7rKf71Q%3D"'
    //     }
    //   }
    // );
    // res.send({ msg: "success fuckers", res: response.data });
  } catch (e) {
    console.log("error occured", e, e.message);
    res.send("errored");
  }
});

app.post("/proxy", upload, async (req, res) => {
  try {
    const files = req.files;
    const url = req.query.url;
    const auth = req.query.auth;
    const body = req.body;
    console.log("checking req===>>", req);
    console.log("checking the files===>>", files, req.file);
    console.log("checking the body===>>", body);
    console.log("checking the url===>>", url);
    console.log("checking the auth===>>", auth);
    if (files && Object.keys(files)) {
      const formData = new FormData();
      Object.keys(files).forEach((fieldName) => {
        if (files[fieldName].length) {
          formData.append(
            fieldName,
            files[fieldName][0].buffer,
            files[fieldName][0].originalname
          );
        }
      });
      if (body && Object.keys(body)) {
        Object.keys(body).forEach((fieldName) => {
          formData.append(fieldName, body[fieldName]);
        });
      }
      console.log("formdata is this===>>", formData);
      const response = await axios.post(url, formData, {
        headers: {
          Authorization: auth
        }
      });
      return res.status(response.status).send(response.data);
    }

    const response = await axios.post(url, req.body, {
      headers: {
        Authorization: auth
      }
    });
    return res.status(response.status).send(response.data);
  } catch (e) {
    console.log(
      "checking the error====>>",
      e.response?.data?.error,
      e.response?.data?.errors,
      e.message
    );
    res.status(515).send({
      error: true,
      actualError: e
    });
  }
});

app.listen(8080);

// "axios": "^1.1.3",
// "bcrypt": "^4.0.1",
// "body-parser": "^1.19.0",
// "cookie-parser": "^1.4.6",
// "cors": "^2.8.5",
// "express": "^4.17.1",
// "form-data": "^4.0.0",
// "fs": "0.0.1-security",
// "jsonwebtoken": "^8.5.1",
// "mongoose": "^5.9.7",
// "morgan": "^1.10.0",
// "multer": "^1.4.2",
// "uuid": "^9.0.0"
