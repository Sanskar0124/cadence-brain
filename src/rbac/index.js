const AccessControl = require('accesscontrol');
const fs = require('fs');
const path = require('path');
const { USER_ROLE } = require('../utils/enums');

const basename = path.basename(__filename);

let permissions = {};

// * read all the files
fs.readdirSync(__dirname)
  .filter(
    (file) =>
      file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js'
  )
  .forEach((file) => {
    // * file name is same as role
    const roleName = file.split('.')[0];

    // * each file has its permissions
    const rolePermissions = require(path.join(__dirname, file));

    // * create a key as role and assign its value as its permission in the main accessControl object
    permissions[roleName] = rolePermissions;
  });

// console.log(`GRANT PERMISSIONS: `, JSON.stringify(accessControl, null, 4));

// * create access control object from created permissions json
const ac = new AccessControl(permissions);

// * list all role inheritances here

// * sales manager person inherits permission from sales person and manager
ac.grant(USER_ROLE.SALES_MANAGER_PERSON).extend([
  USER_ROLE.SALES_PERSON,
  USER_ROLE.SALES_MANAGER,
]);

// * admin inherits permission from all the user roles
ac.grant(USER_ROLE.ADMIN).extend([
  USER_ROLE.SALES_PERSON,
  USER_ROLE.SALES_MANAGER,
]);

// * super admin inherits permission from all the user roles
ac.grant(USER_ROLE.SUPER_ADMIN).extend([
  USER_ROLE.ADMIN,
  USER_ROLE.SALES_PERSON,
  USER_ROLE.SALES_MANAGER,
]);

module.exports = ac;
