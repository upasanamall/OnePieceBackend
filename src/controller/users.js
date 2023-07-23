import User from "../models/User.js";

export const getUserTokensDetails = async (userId) => {
  try {
    const userDetails = await User.findById(userId);
    return userDetails;
  } catch (e) {
    console.log("unable to fetch the user details for ", userId);
    return null;
  }
};

export const updateUserTokensDetails = async (userId, tokenDetails) => {
  try {
    const userDetails = await getUserTokensDetails(userId);
    console.log("userDetails", userDetails);
    const updateUserResponse = await User.findByIdAndUpdate(
      userId,
      {
        tokens: {
          ...(userDetails.tokens || {}),
          ...tokenDetails
        }
      },
      { useFindAndModify: false }
    ).exec();
    return updateUserResponse;
  } catch (e) {
    console.log("unable to update the user token details for ", userId, e);
    return null;
  }
};

export const updateSelectedFacebookGroup = async (userId, selectedGroup) => {
  try {
    const userDetails = await getUserTokensDetails(userId);
    if (!userDetails?.tokens?.facebook) {
      return {
        error: "cannot update selectedGroup before linking facebook"
      };
    }
    const updateUserResponse = await User.findByIdAndUpdate(
      userId,
      {
        tokens: {
          facebook: {
            selectedGroup
          }
        }
      },
      { useFindAndModify: false }
    ).exec();
    return updateUserResponse;
  } catch (e) {
    return {
      error: "error occured while setting the selected facebook group"
    };
  }
};

export const updateSelectedInstaPage = async (userId, selectedPage) => {
  try {
    const userDetails = await getUserTokensDetails(userId);
    if (!userDetails?.tokens?.instagram) {
      return {
        error: "cannot update selectedPage before linking instagram"
      };
    }
    const updateUserResponse = await User.findByIdAndUpdate(
      userId,
      {
        tokens: {
          instagram: {
            selectedPage
          }
        }
      },
      { useFindAndModify: false }
    ).exec();
    return updateUserResponse;
  } catch (e) {
    return {
      error: "error occured while setting the selected facebook group"
    };
  }
};
