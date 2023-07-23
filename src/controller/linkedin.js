import { createNewLinkedInPost, uploadLinkedInImage } from "../sdk/index.js";

export const createNewImagePost = async (userTokens, body, userId) => {
  try {
    const {
      token: linkedInToken,
      userId: linkedInUserId
    } = userTokens.tokens.linkedIn;
    const imageResult = await uploadLinkedInImage(
      linkedInToken,
      linkedInUserId,
      body.files.imageFile[0]
    );
    if (imageResult.error) return imageResult;
    const content = {
      media: {
        id: imageResult.imageId
      }
    };
    if (body.title) {
      content.media.title = body.title;
    }
    const newPostResponse = await createNewLinkedInPost(
      linkedInToken,
      linkedInUserId,
      body.description,
      content
    );
    return newPostResponse;
  } catch (e) {
    return {
      error: "couldnt create a new image post in linkedin"
    };
  }
};
