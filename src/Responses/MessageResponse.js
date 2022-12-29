const { Logger } = require("../Logger/Logger");

require("dotenv").config();

const SPAMBOT_MESSAGES = process.env.SPAMBOT_MESSAGES.split(";;;");

const isSpambotMessage = (json) => {
  return SPAMBOT_MESSAGES.some((message) => {
    const that = json.message.toLowerCase();
    const another = message.toLowerCase();

    return that.includes(another);
  });
};

class MessageResponse {
  async react(json, me, partner) {
    if (json.mine) {
      return;
    }

    if (isSpambotMessage(json)) {
      Logger.log(
        me.id,
        `spambot message (${json.message}), terminate conversation`
      );
      me.terminateConversation();
      me.banrequest();
    } else {
      partner.sendMessage(json.message);
      partner.stopTyping();
      Logger.log(me.id, json.message);
    }
  }
}

module.exports = {
  MessageResponse,
};
