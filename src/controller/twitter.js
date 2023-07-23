import { createNewTwitterPost, uploadImageToTwitter } from "../sdk/twitter.js";

export const createNewImagePost = async (userTokens, body) => {
  try {
    const imageUploadResponse = await uploadImageToTwitter(
      userTokens.tokens.twitter,
      body.files.imageFile[0]
    );
    if (imageUploadResponse.error) {
      return {
        error: "unable to upload the image to twitter",
        errorMessage: imageUploadResponse
      };
    }
    const createImgPostResp = await createNewTwitterPost(
      userTokens.tokens.twitter,
      body
    );
    if (createImgPostResp.error) {
      return createImgPostResp;
    }
    const respSplit = createImgPostResp.text.split(" ");
    createImgPostResp.postUrl = respSplit[respSplit.length];
    return createImgPostResp;
  } catch (e) {
    console.log("this is the error in twitter====>>>>", e);
    return {
      error: "unable to create a new twitter image post"
    };
  }
};
