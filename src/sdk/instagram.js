import axios from "axios";
import { Agent } from "https";

//step 1: get the page id which has instagram business account linked
export async function getUserPages(token) {
  let response = await axios.get(
    `https://graph.facebook.com/v15.0/me/accounts`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        rejectUnauthorized: false
      },
      httpsAgent: new Agent({
        rejectUnauthorized: false
      })
    }
  );
  return { status: response.status, data: response.data };
}
//step 2: get the instagram business account linked to that page
export async function getInstaAccount(pageId, token) {
  let response = await axios.get(
    `https://graph.facebook.com/v15.0/${pageId}?fields=instagram_business_account&access_token=${token}`,
    {
      headers: {
        rejectUnauthorized: false
      },
      httpsAgent: new Agent({
        rejectUnauthorized: false
      })
    }
  );
  return response;
}

//step 3: create and upload the post in the account (images only for mvp):
export async function uploadPostInTheAccount(
  instaId,
  token,
  image_url,
  caption
) {
  //later we can add the optional params to the url string
  //  let params = ['caption', 'children']
  // let instaId = req.body.instaId;
  // let token = req.body.accessToken;
  // let image_url = req.body.imageUrl;
  // let caption = req.body.caption;
  let response = await axios.post(
    `https://graph.facebook.com/v15.0/${instaId}/media?image_url=${image_url}&caption=${caption}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        rejectUnauthorized: false
      },
      httpsAgent: new Agent({
        rejectUnauthorized: false
      })
    }
  );
  return response;
}

//step 4: publish the uploaded media
export async function publishPostInTheAccount(instaId, token, creation_id) {
  //later we can add the optional params to the url string
  //  let params = ['caption', 'children']
  // let instaId = req.body.instaId;
  // let token = req.body.accessToken;
  // let creation_id = req.body.creation_id;
  let response = await axios.post(
    `https://graph.facebook.com/v15.0/${instaId}/media_publish?creation_id=${creation_id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        rejectUnauthorized: false
      },
      httpsAgent: new Agent({
        rejectUnauthorized: false
      })
    }
  );
  return response;
}

//other APIs:
//Get the media for the insta account:
export async function getInstaMedia(instaId, token) {
  let response = await axios.get(
    `https://graph.facebook.com/v15.0/${instaId}/media?access_token=${token}`,
    {
      headers: {
        rejectUnauthorized: false
      },
      httpsAgent: new Agent({
        rejectUnauthorized: false
      })
    }
  );
  return response;
}
