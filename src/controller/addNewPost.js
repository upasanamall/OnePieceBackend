import PostSchema from "../models/PostSchema.js";
import { publishPostInGroup } from "../sdk/facebook.js";
import {
  uploadLinkedInVideo,
  createNewLinkedInPost,
  uploadLinkedInImage
} from "../sdk/index.js";
import { createNewTwitterPost, uploadImageToTwitter } from "../sdk/twitter.js";
import { createNewImagePost as createNewLinkedInImagePost } from "./linkedin.js";
import { getUserTokensDetails } from "./users.js";
import { createNewImagePost as createNewTwitterImagePost } from "./twitter.js";
import { createNewImagePost as createNewfacebookImagePost } from "./facebook.js";

export const addNewVideoPost = async (userId, body) => {
  const userTokens = await getUserTokensDetails(userId);
  console.log("body check===>", body.files);
  if (body.files.videoFile) {
    if (userTokens?.tokens?.linkedIn) {
      const {
        token: linkedInToken,
        userId: linkedInUserId
      } = userTokens.tokens.linkedIn;
      const videoResult = await uploadLinkedInVideo(
        linkedInToken,
        linkedInUserId,
        body.files.videoFile[0]
      );
      if (videoResult.error) return videoResult;
      const content = {
        media: {
          id: videoResult.videoId
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
      if (newPostResponse.error) return newPostResponse;
      const post = new PostSchema({
        userId: userId,
        linkedInPost: newPostResponse.postId
      });
      const insertResult = post.save();
      return insertResult;
    }
    return {
      error: "unable to get the linkedin token"
    };
  }
  return {
    error: "no video file found"
  };
};

export const addNewImagePost = async (userId, body) => {
  const imagePostResult = {};
  try {
    const userTokens = await getUserTokensDetails(userId);
    if (body.files.imageFile?.length > 0) {
      if (userTokens?.tokens?.linkedIn) {
        const linkedInResult = await createNewLinkedInImagePost(
          userTokens,
          body,
          userId
        );
        imagePostResult.linkedIn = linkedInResult;
      }
      if (userTokens?.tokens?.twitter) {
        const twitterResult = await createNewTwitterImagePost(userTokens, body);
        imagePostResult.twitter = twitterResult;
        console.log("checking the response====>>>>", twitterResult);
      }
      if (userTokens?.tokens?.facebook?.selectedGroup?.id) {
        const faceBookResult = await createNewfacebookImagePost(
          userTokens.tokens.facebook.access_token,
          userTokens?.tokens?.facebook?.selectedGroup?.id,
          body.files.imageFile[0],
          body.description
        );
        imagePostResult.facebook = faceBookResult;
      }
      delete body.files;
      const insertResult = await insertPostDetails(
        userId,
        imagePostResult,
        body
      );
      return insertResult;
    }
  } catch (e) {
    return {
      error: "unable to create an image post"
    };
  }
};

export const addNewTextPost = async (userId, body) => {
  const postResponses = {};
  try {
    const userTokens = await getUserTokensDetails(userId);
    if (userTokens?.tokens?.linkedIn) {
      const {
        token: linkedInToken,
        userId: linkedInUserId
      } = userTokens.tokens.linkedIn;
      const newPostResponse = await createNewLinkedInPost(
        linkedInToken,
        linkedInUserId,
        body.description
      );
      if (newPostResponse.error) return newPostResponse;
      postResponses.linkedIn = { postId: newPostResponse.postId };
      console.log("completed the linked in ", postResponses);
    }
    if (userTokens?.tokens?.twitter) {
      const newPostResponse = await createNewTwitterPost(
        userTokens.tokens.twitter,
        body
      );
      postResponses.twitter = newPostResponse;
      console.log("completed the twitter in ", postResponses);
    }
    if (userTokens?.tokens?.facebook) {
      const { access_token, selectedGroup } = userTokens?.tokens?.facebook;
      if (selectedGroup) {
        const facebookPostResponse = await publishPostInGroup(
          selectedGroup.id,
          access_token,
          body.description,
          body.link
        );
        postResponses.facebook = facebookPostResponse.data;
      } else {
        postResponses.facebook = {
          error: "cannot proceed for facebook as fb group is not selected"
        };
      }
    }
    const insertResult = await insertPostDetails(userId, postResponses, body);
    return insertResult;
  } catch (e) {
    console.log("error====== in the text post", e);
    return {
      error: "unable to upload the posts",
      postResponses
    };
  }
};

const insertPostDetails = async (userId, postResponses, postDetails) => {
  const post = new PostSchema({
    userId,
    postResponses,
    postDetails
  });
  const insertResult = await post.save();
  return insertResult;
};
