import axios from "axios";
import express from "express";
import qs from "qs";
import { Agent } from "https";
import { updateUserTokensDetails } from "../controller/users.js";
import { linkedInMeCall } from "../sdk/linkedIn.js";
import {
  facebookMeCall,
  getUserGroups,
  longLivedToken
} from "../sdk/facebook.js";
const router = express.Router();

const facebookCOnfig = {
  clientId: "720456953021786",
  redirectUrl: "http://localhost:3333/link/facebook/",
  clientSecret: "5e2b399219a07dec3fa4305832466c7c"
};

const config = {
  linkedInClientId: "77g37avda0b3gb",
  linkedInClientSecret: "DS9PnHGifcLnhYzj",
  redirectUrl: "http://localhost:3333/api/v2/link/linkedIn"
};

const twitterConfig = {
  requestConfig: {
    oauth_consumer_key: "4xHWiZzCDoo3kK6XCpAr6MSFN",
    oauth_token: "1592231991214161921-Y0UMMa0C9cwlIcZ0OkZwvsT9a09K6R",
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: "1668686616",
    oauth_nonce: "mpuZfCT6zfh",
    oauth_version: "1.0",
    oauth_signature: "PDNIffS7HqTynkMjfLHyFPhA16U="
  },
  requestUrl: "https://api.twitter.com/oauth/request_token"
};

router.get("/linkedIn", async (req, res) => {
  // console.log('checking requests', req)
  if (req.query.code) {
    try {
      const accessTokenUrl = "https://www.linkedin.com/oauth/v2/accessToken";
      const data = qs.stringify({
        grant_type: "authorization_code",
        code: req.query.code,
        client_id: config.linkedInClientId,
        client_secret: config.linkedInClientSecret,
        redirect_uri: config.redirectUrl
      });
      const response = await axios.post(accessTokenUrl, data, {
        headers: {
          rejectUnauthorized: false
        },
        httpsAgent: new Agent({
          rejectUnauthorized: false
        })
      });
      if (response.status === 200) {
        const userData = await linkedInMeCall(response.data.access_token);
        const userId = req.cookies.userId;
        if (!userId) {
          return res
            .status(500)
            .send("no userId was sent to update the tokens");
        }
        const updateResponse = await updateUserTokensDetails(userId, {
          linkedIn: {
            ...userData
          }
        });
        console.log("updateResponse==>>", updateResponse);
        if (!updateResponse) {
          return res.status(500).send("unable to push the token to the db");
        }
        if (req.query?.state?.split("---")[0]) {
          return res.redirect(req.query?.state?.split("---")[0]);
        }
        return res.send("updated successfully");
      }
      return res.status(500).send("unable to get the access token");
    } catch (err) {
      console.log("checking the error===>>", err);
      return res.status(500).send({
        error: "unable to fetch token"
      });
    }
  } else {
    res.cookie("userId", req.userData?.userId || "6374c1143e64be02acf24f04", {
      maxAge: 360000
    });
    const redirectUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${
      config.linkedInClientId
    }&redirect_uri=${config.redirectUrl}&state=${
      req.query.redirectUrl || ""
    }---&scope=r_liteprofile%20r_emailaddress%20w_member_social`;
    return res.redirect(redirectUrl);
  }
});

router.get("/twitter", async (req, res) => {
  if (!req.query.oauth_token && !req.query.oauth_verifier) {
    const data = qs.stringify(twitterConfig.requestConfig);
    const response = await axios.post(twitterConfig.requestUrl, data, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        rejectUnauthorized: false
      },
      httpsAgent: new Agent({
        rejectUnauthorized: false
      })
    });
    if (response.status !== 200) {
      return res.status(500).send("unable to request the token");
    }
    const queries = response.data?.split("&");
    const tokenDatas = {};
    queries.forEach((query) => {
      const [key, value] = query.split("=");
      if (key) {
        tokenDatas[key] = value;
      }
    });
    if (!tokenDatas.oauth_callback_confirmed) {
      return res.status(500).send("outh callback is not confirmed");
    }
    if (!tokenDatas.oauth_token || !tokenDatas.oauth_token_secret) {
      return res
        .status(500)
        .send(
          "either token or token secret value is not sent in the request resp"
        );
    }
    const twitterAuthorizeUrl = `https://api.twitter.com/oauth/authorize?oauth_token=${tokenDatas.oauth_token}&oauth_token_secret=${tokenDatas.oauth_token_secret}`;
    res.cookie("oauth_token", tokenDatas.oauth_token, { maxAge: 360000 });
    res.cookie("userId", "6374c1143e64be02acf24f04", { maxAge: 360000 });
    return res.redirect(twitterAuthorizeUrl);
  } else {
    console.log("checking req.query===>>", req.query);
    console.log("checking req.cookies===>>", req.cookies);
    if (
      !req.query.oauth_token ||
      !req.query.oauth_verifier ||
      !req.cookies.oauth_token
    ) {
      return res
        .status(500)
        .send(
          "did not receive the oauth_token, oauth_verifier, oauth_tokenin cookie"
        );
    }
    if (req.query.oauth_token !== req.cookies.oauth_token) {
      return res
        .status(500)
        .send("the oauth from the request and authorize did not match");
    }
    const twitterAccessTokenUrl = `https://api.twitter.com/oauth/access_token?oauth_verifier=${req.query.oauth_verifier}&oauth_token=${req.query.oauth_token}`;
    const accessTokenResponse = await axios.post(twitterAccessTokenUrl, null, {
      headers: {
        oauth_token: req.query.oauth_token,
        rejectUnauthorized: false
      },
      httpsAgent: new Agent({
        rejectUnauthorized: false
      })
    });
    if (accessTokenResponse.status !== 200) {
      return res
        .status(500)
        .send("unable to fetch the final user access token");
    }
    const tokenDatas = {};
    accessTokenResponse.data?.split("&")?.forEach((query) => {
      const [key, value] = query.split("=");
      if (key) {
        tokenDatas[key] = value;
      }
    });
    if (!req.cookies.userId) {
      return res.status(500).send("no userId is present in the cookie");
    }
    const updateResponse = await updateUserTokensDetails(req.cookies.userId, {
      twitter: {
        ...tokenDatas
      }
    });
    res.send({ msg: "finally I am done", updateResponse });
  }
});

router.get("/facebook", async (req, res) => {
  if (req.query.code) {
    try {
      const accessTokenUrl = `https://graph.facebook.com/v15.0/oauth/access_token?client_id=${encodeURIComponent(
        facebookCOnfig.clientId
      )}&redirect_uri=${encodeURIComponent(
        facebookCOnfig.redirectUrl
      )}&client_secret=${encodeURIComponent(
        facebookCOnfig.clientSecret
      )}&code=${req.query.code}`;

      const response = await axios.get(accessTokenUrl, {
        headers: {
          rejectUnauthorized: false
        },
        httpsAgent: new Agent({
          rejectUnauthorized: false
        })
      });
      if (response.status === 200) {
        const longLiveTokenResp = await longLivedToken(
          response.data.access_token
        );
        const meCallResp = await facebookMeCall(
          longLiveTokenResp.data.access_token
        );
        const userFbGroups = await getUserGroups(
          longLiveTokenResp.data.access_token,
          meCallResp.data.id
        );
        const userId = req.cookies.userId;
        if (!userId) {
          return res
            .status(500)
            .send("no userId was sent to update the tokens");
        }
        const updateResponse = await updateUserTokensDetails(userId, {
          facebook: {
            ...longLiveTokenResp.data,
            ...meCallResp.data,
            groups: userFbGroups.data.data
          }
        });
        if (!updateResponse) {
          return res.status(500).send("unable to push the token to the db");
        }
        if (req.query?.state?.split("---")[0]) {
          return res.redirect(req.query?.state?.split("---")[0]);
        }
        return res.send("updated successfully");
      }
      return res.status(500).send("unable to get the access token");
    } catch (err) {
      console.log("checking the error===>>", err);
      return res.status(500).send({
        error: "unable to fetch token"
      });
    }
  } else {
    res.cookie("userId", req.userData?.userId || "6374c1143e64be02acf24f04", {
      maxAge: 360000
    });
    const redirectUrl = `https://www.facebook.com/v15.0/dialog/oauth?client_id=${
      facebookCOnfig.clientId
    }&redirect_uri=${facebookCOnfig.redirectUrl}&state=${
      req.query.redirectUrl || ""
    }---`;
    return res.redirect(redirectUrl);
  }
});

export default router;
