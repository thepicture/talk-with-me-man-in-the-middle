const { Logger } = require("../Logger/Logger");

class UserRegisteredResponse {
  react(json, me, partner) {
    Logger.log(me.id, `user registered`);
  }
}

module.exports = {
  UserRegisteredResponse,
};
