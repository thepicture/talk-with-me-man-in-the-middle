const { Logger } = require("../Logger/Logger");

class JoinedToConversationResponse {
  react(json, me, partner) {
    Logger.log(me.id, `joined to conversation`);
  }
}

module.exports = {
  JoinedToConversationResponse,
};
