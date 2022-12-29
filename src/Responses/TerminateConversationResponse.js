const { Logger } = require("../Logger/Logger");

class TerminateConversationResponse {
  async react(json, me, partner) {
    Logger.log(me.id, `terminate conversation`);
    await me.getPartner();
  }
}

module.exports = {
  TerminateConversationResponse,
};
