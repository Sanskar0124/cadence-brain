const removeHtmlTags = require('./removeHtmlTags');
const inviteMail = require('./inviteMail');
const changePassword = require('./changePassword');
const reconnectCrmAdmin = require('./reconnectCrmAdmin');
const hotLeadMail = require('./hotLeadMail');
const taskReminder = require('./taskReminder');
const inviteMailForSuperAdmin = require('./inviteMailForSuperAdmin');

const HtmlHelper = {
  removeHtmlTags,
  inviteMail,
  changePassword,
  reconnectCrmAdmin,
  hotLeadMail,
  taskReminder,
  inviteMailForSuperAdmin,
};

module.exports = HtmlHelper;
