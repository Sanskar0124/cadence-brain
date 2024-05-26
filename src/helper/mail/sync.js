// Repositories
const EmailRepository = require('../../repository/email.repository');
const LeadRepository = require('../../repository/lead.repository');
const UserRepository = require('../../repository/user-repository');
const UserTokenRepository = require('../../repository/user-token.repository');

// Helpers and services
const Mail = require('../../services/Google/Mail');
const ActivityHelper = require('../activity');

const sync = async (user) => {
  console.log('Syncing..', user);
  const [leads, err] = await LeadRepository.getLeadsByQuery({
    user_id: user.user_id,
  });

  if (err) return [null, err];

  console.log(leads.length);

  const [userToken, errForUserToken] =
    await UserTokenRepository.getUserTokenByQuery({
      user_id: user.user_id,
    });

  const syncTime = new Date().getTime();
  console.log(user.google_mail_last_update, 'to', syncTime);
  for (const lead of leads) {
    console.log(lead);
    const [received_mail, er] = await Mail.Inbox.get(
      {
        refresh_token: userToken?.google_refresh_token,
      },
      {
        fromEmail: lead.email,
        getSent: false,
        before: Math.floor(syncTime / 1000),
      }
    );
    //console.log(received_mail,er)
    console.log('Received mail=>', received_mail.length);

    await Promise.all(
      received_mail.map((mail) =>
        ActivityHelper.createAndSendMailActivity({ user, lead, mail })
      )
    );

    if (er) {
      console.log(er);
      continue;
    } else {
      const [success, e] = await EmailRepository.saveReceived(
        user.user_id,
        lead.lead_id,
        received_mail
      );
      console.log('Received=>', success, e);
    }

    const [sent_mail, e] = await Mail.Inbox.get(
      {
        refresh_token: userToken?.google_refresh_token,
      },
      {
        fromEmail: lead.email,
        getSent: true,
        before: Math.floor(syncTime / 1000),
      }
    );
    console.log('Sent mail=>', sent_mail.length);
    await Promise.all(
      sent_mail.map((mail) => activityHelper(user, lead, mail, true))
    );

    if (e) {
      continue;
    }
    const [success, errorr] = await EmailRepository.saveSent(
      user.user_id,
      lead.lead_id,
      sent_mail
    );
    console.log('Sent=>', success);
  }
  await UserRepository.updateUserById(
    { google_mail_last_update: syncTime },
    user.user_id
  );
};

module.exports = { sync };
