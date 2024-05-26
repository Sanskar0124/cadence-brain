// Utils
const logger = require('../../../utils/winston');

// Packages
const axios = require('axios');

// Helpers and Services
const fetchPeopleDetails = require('./fetchPeopleDetails');
const getMyProfile = require('./getMyProfile');
const getNetworkInfo = require('./getNetworkInfo');
const fetchClientApplicationDetails = require('./fetchClientApplicationDetails');

const viewLinkedinProfile = async ({ linkedin_url, headers }) => {
  try {
    //const [myProfile, errForMyProfile] = await getMyProfile(headers);
    const myProfilePromise = getMyProfile(headers);

    //const [networkInfo, errForNetworkInfo] = await getNetworkInfo(
    const networkInfoPromise = getNetworkInfo(
      headers,
      linkedin_url.split('/')[4]
    );

    //const [targetProfileInfo, errForTargetProfileInfo] =
    const targetProfileInfoPromise = fetchPeopleDetails(linkedin_url, headers);

    //const [clientApplicationDetails, errForClientApplicationsDetails] =
    const clientApplicationDetailsPromise =
      fetchClientApplicationDetails(headers);

    const [
      [myProfile, errForMyProfile],
      [networkInfo, errForNetworkInfo],
      [targetProfileInfo, errForTargetProfileInfo],
      [clientApplicationDetails, errForClientApplicationsDetails],
    ] = await Promise.all([
      myProfilePromise,
      networkInfoPromise,
      targetProfileInfoPromise,
      clientApplicationDetailsPromise,
    ]);
    if (errForMyProfile) return [null, errForMyProfile];
    if (errForNetworkInfo) return [null, errForNetworkInfo];
    if (errForTargetProfileInfo) return [null, errForTargetProfileInfo];
    if (errForClientApplicationsDetails)
      return [null, errForClientApplicationsDetails];

    const network_distance =
      networkInfo?.distance?.value?.split('_')?.pop() || '2';
    let viewer_privacy_setting = 'F';
    let me_member_id = myProfile?.plainId;
    let target_profile_member_urn_id = targetProfileInfo.member_urn_id;

    let eventBody = {
      viewerPrivacySetting: viewer_privacy_setting,
      networkDistance: network_distance,
      vieweeMemberUrn: `urn:li:member:${target_profile_member_urn_id}`,
      //"profileTrackingId": self.client.metadata["clientPageInstanceId"],
      //profileTrackingId: 'a9f8cea6-b50a-492c-beeb-667684c80f15',
      profileTrackingId: clientApplicationDetails?.clientPageInstanceId,
      entityView: {
        viewType: 'profile-view',
        viewerId: me_member_id,
        targetId: target_profile_member_urn_id,
      },
      header: {
        pageInstance: {
          pageUrn: 'urn:li:page:d_flagship3_profile_view_base',
          //trackingId: 'a9f8cea6-b50a-492c-beeb-667684c80f15',
          //trackingId: self.client.metadata['clientPageInstanceId'],
          trackingId: clientApplicationDetails?.clientPageInstanceId,
        },
        time: new Date().getTime(),
        //version: client_application_instance['version'],
        //clientApplicationInstance: client_application_instance,

        //version: '1.11.4959',
        version: clientApplicationDetails?.applicationInstance?.version,
        //clientApplicationInstance: {
        //applicationUrn: 'urn:li:application:(voyager-web,voyager-web)',
        //version: '1.11.4959',
        //trackingId: [
        //-105, -96, 16, -9, 95, -51, 78, 99, -124, 73, -69, 102, 67, 108,
        //-33, -52,
        //],
        //},
        clientApplicationInstance:
          clientApplicationDetails?.applicationInstance,
      },
      requestHeader: {
        interfaceLocale: 'en_US',
        pageKey: 'd_flagship3_profile_view_base',
        path: `/in/${target_profile_member_urn_id}/`,
        referer: 'https://www.linkedin.com/feed/',
      },
    };

    const body = {
      eventBody,
      eventInfo: {
        appId: 'com.linkedin.flagship3.d_web',
        eventName: 'ProfileViewEvent',
        topicName: 'ProfileViewEvent',
      },
    };

    //console.log(JSON.stringify(body, null, 4));
    const res = await axios.post(
      `https://linkedin.com/li/track`,
      JSON.stringify(body),
      {
        headers: {
          ...headers,
          accept: '*/*',
          'content-type': 'text/plain;charset=UTF-8',
        },
      }
    );

    logger.info(`Profile view response data: ${res?.data}`);

    return [true, null];
  } catch (err) {
    console.log(err);
    logger.error(`Error while viewing linkedin profile helper: `, err);
    return [null, err.message];
  }
};

module.exports = viewLinkedinProfile;
