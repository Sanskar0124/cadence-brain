const getPrimaryEmail = (lead, onlyEmail = false) => {
  let primaryEmail = null;

  if (lead.Lead_emails?.length > 0)
    for (const email of lead.Lead_emails) {
      if (email.is_primary) {
        primaryEmail = email;
        break;
      }
    }

  if (onlyEmail) return [primaryEmail?.email_id ?? '', null];
  else return [primaryEmail, null];
};

module.exports = getPrimaryEmail;
