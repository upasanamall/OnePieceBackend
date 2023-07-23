import { facebookPhotoCall } from "../sdk/facebook.js";

export const createNewImagePost = async (
  token,
  groupId,
  imageFile,
  captions
) => {
  try {
    const response = await facebookPhotoCall(
      token,
      groupId,
      imageFile,
      captions
    );
    return response;
  } catch (e) {
    return {
      error: "unable to create a image post in facebook"
    };
  }
};
