import axios from "axios";
import crypto from "crypto";
import https from "https";
import FormData from "form-data";
import { v1 } from "uuid";

const twitterConfig = {
  oauth_consumer_key: "4xHWiZzCDoo3kK6XCpAr6MSFN",
  oauth_signature_method: "HMAC-SHA1",
  oauth_version: "1.0"
};
const twitterFetch = async (token, url, data, options) => {
  twitterConfig.oauth_timestamp = Math.floor(Date.now() / 1000);
  twitterConfig.oauth_token = token.oauth_token;
  twitterConfig.oauth_nonce = v1().substring(0, 6);
  let authString = "";
  const queryString = url.split("?");
  let queriesStrArray = queryString[1]?.split("&");
  const queries = {};
  queriesStrArray = queriesStrArray?.sort((a, b) => a?.localeCompare(b || ""));
  queriesStrArray?.forEach((query, index) => {
    const [key, value] = query?.split("=");
    queries[key] = value;
  });
  let ordered = {};
  const parameters = {
    ...queries,
    oauth_consumer_key: twitterConfig.oauth_consumer_key,
    oauth_signature_method: twitterConfig.oauth_signature_method,
    oauth_timestamp: twitterConfig.oauth_timestamp,
    oauth_nonce: twitterConfig.oauth_nonce,
    oauth_token: twitterConfig.oauth_token,
    oauth_version: twitterConfig.oauth_version
  };
  Object.keys(parameters)
    .sort()
    .forEach(function (key) {
      ordered[key] = parameters[key];
    });
  let encodedParameters = "";
  for (const k in ordered) {
    const encodedValue = encodeURIComponent(ordered[k]);
    const encodedKey = encodeURIComponent(k);
    if (encodedParameters === "") {
      encodedParameters += `${encodedKey}=${encodedValue}`;
    } else {
      encodedParameters += `&${encodedKey}=${encodedValue}`;
    }
  }
  const method = "POST";
  const base_url = queryString[0];
  const encodedUrl = encodeURIComponent(base_url);
  encodedParameters = encodeURIComponent(encodedParameters);
  const signature_base_string = `${method}&${encodedUrl}&${encodedParameters}`;
  const oauth_consumer_secret =
    "uvRyn9F1TZ5MyfQqTV6Hxlrqsmc8DhDJTuwIRBIDgqnhODZVag";
  const signing_key = `${encodeURIComponent(
    oauth_consumer_secret
  )}&${encodeURIComponent(token.oauth_token_secret)}`;
  const oauth_signature = crypto
    .createHmac("sha1", signing_key)
    .update(signature_base_string)
    .digest()
    .toString("base64");
  twitterConfig.oauth_signature = oauth_signature;
  Object.keys(twitterConfig).forEach((keys, index) => {
    authString = `${authString}${
      index === 0 ? "" : ","
    }${keys}="${encodeURIComponent(twitterConfig[keys])}"`;
  });
  const confs = {
    headers: {
      Authorization: `OAuth ${authString}`,
      ...(options?.headers || {}),
      rejectUnauthorized: false
    },
    httpsAgent: new https.Agent({
      rejectUnauthorized: false
    })
  };
  const response = await axios.post(url, data, confs);
  return response;
};

export const uploadImageToTwitter = async (token, imageFile) => {
  try {
    const formData = new FormData();
    formData.append("media", imageFile.buffer);
    const twitterImageUrl =
      "https://upload.twitter.com/1.1/media/upload.json?media_category=tweet_image";
    const imageResponse = await twitterFetch(token, twitterImageUrl, formData);
    if (!imageResponse.data.media_id) {
      return {
        error: "no imageid present in the response"
      };
    }
    return imageResponse.data;
  } catch (e) {
    return {
      error: "errored"
    };
  }
};

export const createNewTwitterPost = async (token, body) => {
  try {
    const tweetUrl = "https://api.twitter.com/2/tweets";
    const data = {
      text: body.description
    };
    if (body.mediaId) {
      data.media = {
        media_ids: [`${body.mediaId}`]
      };
    }
    const response = await twitterFetch(token, tweetUrl, data);
    if (response.status !== 201) {
      return {
        error: `create tweet api returned a error code ${response.status}`,
        errorMessage: response.statusText
      };
    }
    return response.data.data;
  } catch (err) {
    console.log("unable to craete the tweet", err);
    return {
      error: "unable to create the tweet"
    };
  }
};
