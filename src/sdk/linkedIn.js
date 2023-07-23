import axios from "axios";
import https from "https";
const linkedInFetch = async (token, url, data, type = "post") => {
  const options = {
    headers: {
      "LinkedIn-Version": "202210",
      "X-Restli-Protocol-Version": "2.0.0",
      Authorization: `Bearer ${token}`,
      rejectUnauthorized: false
    },
    httpsAgent: new https.Agent({
      rejectUnauthorized: false
    })
  };
  if (type === "post") {
    const resp = await axios.post(
      `https://api.linkedin.com${url}`,
      data,
      options
    );
    return resp;
  } else {
    const resp = await axios.get(`https://api.linkedin.com${url}`, options);
    return resp;
  }
};

export const uploadLinkedInVideo = async (token, userId, videoFile) => {
  try {
    const initVideoUploadResp = await linkedInFetch(
      token,
      "/rest/videos?action=initializeUpload",
      {
        initializeUploadRequest: {
          owner: `urn:li:person:${userId}`,
          fileSizeBytes: videoFile.size,
          uploadCaptions: false,
          uploadThumbnail: false
        }
      }
    );
    if (initVideoUploadResp.status !== 200) {
      return {
        error: "unable to initialize video upload",
        errorDescription: initVideoUploadResp.statusText
      };
    }
    if (!initVideoUploadResp?.data?.value?.uploadInstructions[0]?.uploadUrl) {
      return {
        error: "upload url not present in the init video resp",
        errorDescription: initVideoUploadResp.statusText
      };
    }
    let eTag = null;
    const videoUploadResp = await axios.put(
      initVideoUploadResp.data.value.uploadInstructions[0].uploadUrl,
      videoFile.buffer,
      {
        headers: {
          rejectUnauthorized: false,
          "Content-Type": videoFile.mimetype,
          "Content-Length": videoFile.size
        },
        httpsAgent: new https.Agent({
          rejectUnauthorized: false
        })
      }
    );
    if (videoUploadResp.status !== 200)
      throw new Error("unable to upload file to blob");
    eTag = videoUploadResp.headers.get("ETag");
    const finalizeUploadResponse = await linkedInFetch(
      token,
      "/rest/videos?action=finalizeUpload",
      {
        finalizeUploadRequest: {
          video: initVideoUploadResp.data.value.video,
          uploadToken: "",
          uploadedPartIds: [eTag]
        }
      }
    );
    if (finalizeUploadResponse.status !== 200) {
      return {
        error: "unable to finalize the video upload",
        errorDescription: finalizeUploadResponse.statusText
      };
    }
    return {
      videoId: initVideoUploadResp.data.value.video
    };
  } catch (e) {
    console.log("I have caught the error ===>>", e);
    return {
      error: "unable to upload file to blob"
    };
  }
};

export const uploadLinkedInImage = async (token, userId, imageFile) => {
  try {
    const initImageUploadResp = await linkedInFetch(
      token,
      "/rest/images?action=initializeUpload",
      {
        initializeUploadRequest: {
          owner: `urn:li:person:${userId}`
        }
      }
    );
    if (initImageUploadResp.status !== 200) {
      return {
        error: "unable to initialize image upload",
        errorDescription: resp.statusText
      };
    }
    if (!initImageUploadResp?.data?.value?.uploadUrl) {
      return {
        error: "upload url not present in the init image resp",
        errorDescription: resp.statusText
      };
    }
    try {
      const imageUploadResp = await axios.put(
        initImageUploadResp.data.value.uploadUrl,
        imageFile.buffer,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            rejectUnauthorized: false,
            "Content-Type": imageFile.mimetype,
            "Content-Length": imageFile.size
          },
          httpsAgent: new https.Agent({
            rejectUnauthorized: false
          })
        }
      );
      if (imageUploadResp.status !== 201)
        throw new Error("status error unable to upload image file to blob");
    } catch (e) {
      return {
        error: "unable to upload image file to blob"
      };
    }
    return {
      imageId: initImageUploadResp.data.value.image
    };
  } catch (e) {
    console.log("this is an error while fetching===>>", e.response);
    return {
      error: "unable to initialize the image"
    };
  }
};

export const createNewLinkedInPost = async (
  token,
  userId,
  description,
  content
) => {
  try {
    const data = {
      author: `urn:li:person:${userId}`,
      commentary: description,
      visibility: "PUBLIC",
      distribution: {
        feedDistribution: "MAIN_FEED",
        targetEntities: [],
        thirdPartyDistributionChannels: []
      },
      lifecycleState: "PUBLISHED",
      isReshareDisabledByAuthor: false
    };
    if (content) {
      data.content = content;
    }
    const newPostResp = await linkedInFetch(token, "/rest/posts", data);
    if (newPostResp.status !== 201)
      return {
        error: "unable to create a new post"
      };
    return {
      postId: newPostResp.headers.get("x-restli-id")
    };
  } catch (err) {
    return {
      error: "unable to create a post in linkedin"
    };
  }
};

export const linkedInMeCall = async (token) => {
  const meCallUrl = "/v2/me";
  const response = await linkedInFetch(token, meCallUrl, null, "get");
  if (response.status !== 200) {
    return {
      error: "unable to get me call"
    };
  }
  const userData = {
    lastName: response.data.localizedLastName,
    firstName: response.data.localizedFirstName,
    userId: response.data.id,
    token
  };
  return userData;
};
