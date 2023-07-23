import axios from "axios";
import FormData from "form-data";
import { Agent } from "https";
let app_id = "720456953021786";
let app_secret = "5e2b399219a07dec3fa4305832466c7c";

// array in local storage for accounts
const accountsKey = "react-facebook-login-accounts";
let accounts = [];

export const facebookFetch = async (type, token, url, data, options) => {
  const confs = {
    headers: {
      Authorization: `Bearer ${token}`,
      rejectUnauthorized: false,
      ...(options?.headers || {})
    },
    httpsAgent: new Agent({
      rejectUnauthorized: false
    })
  };
  if (type === "post") return axios.post(url, data, confs);
  return axios.get(url, confs);
};
export async function authenticate(req) {
  const accessToken = req.body.accessToken;
  console.log("access-token", accessToken);
  const response = await axios
    .get(`https://graph.facebook.com/v15.0/me?access_token=${accessToken}`, {
      headers: {
        rejectUnauthorized: false
      },
      httpsAgent: new Agent({
        rejectUnauthorized: false
      })
    })
    .then((response) => {
      const { data } = response;
      if (data.error) return unauthorized(data.error.message);
      //need to save this long lived token:
      let longlivedToken = longLivedToken();
      let account = accounts.find((x) => x.facebookId === data.id);
      if (!account) {
        // create new account if first time logging in
        account = {
          id: accounts.length ? Math.max(...accounts.map((x) => x.id)) + 1 : 1,
          facebookId: data.id,
          name: data.name,
          extraInfo: `This is some extra info about ${data.name} that is saved in the API`
        };
        accounts.push(account);

        // localStorage.setItem(accountsKey, JSON.stringify(accounts));
      }
      return { status: response.status, data: response.data };
    });
}

export async function getUserGroups(token, userId) {
  const response = await facebookFetch(
    "get",
    token,
    `https://graph.facebook.com/v15.0/${userId}/groups`
  );
  return { status: response.status, data: response.data };
}

export async function getGroupFeed(groupId, token) {
  let response = await facebookFetch(
    "get",
    token,
    `https://graph.facebook.com/v15.0/${groupId}/feed`
  );
  return { status: response.status, data: response.data };
}

export async function publishPostInGroup(groupId, token, message, link) {
  const data = {};
  if (message) {
    data.message = message;
  }
  if (link) {
    data.link = link;
  }
  let response = await facebookFetch(
    "post",
    token,
    `https://graph.facebook.com/v15.0/${groupId}/feed`,
    data
  );
  return { status: response.status, data: response.data };
}

export async function longLivedToken(accessToken) {
  let response = await facebookFetch(
    "get",
    token,
    `https://graph.facebook.com/v15.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${app_id}&client_secret=${app_secret}&fb_exchange_token=${accessToken}`
  );
  return response;
}

export const facebookMeCall = async (token) => {
  const response = await facebookFetch(
    "get",
    token,
    "https://graph.facebook.com/me"
  );
  return response;
};

export const facebookPhotoCall = async (
  token,
  groupId,
  imageFile,
  captions
) => {
  const formData = new FormData();
  formData.append("image", imageFile.buffer);
  const reponse = await facebookFetch(
    "post",
    token,
    `https://graph.facebook.com/v15.0/${groupId}/photos`,
    formData
  );
  return reponse;
};
