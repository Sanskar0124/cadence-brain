const getPrimaryPhoneNumber = (lead, onlyPhoneNumber) => {
  let primaryNumber = null;

  if (lead.Lead_phone_numbers?.length > 0)
    for (const pn of lead.Lead_phone_numbers)
      if (pn.is_primary) {
        primaryNumber = pn;
        break;
      }

  if (onlyPhoneNumber) return [primaryNumber?.phone_number ?? '', null];
  else return [primaryNumber, null];
};

module.exports = getPrimaryPhoneNumber;
