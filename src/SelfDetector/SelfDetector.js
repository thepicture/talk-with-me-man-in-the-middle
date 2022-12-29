const { Bot } = require("../Bot/Bot.js");

class SelfDetector {
  /**
   *
   * @param {Bot} bot
   */
  constructor(bot) {
    this.bot = bot;
  }

  activate = () => {
    let timeoutForBot = setTimeout(
      async () => await this._reconnectBotWithAnotherPartner(),
      30000
    );
    this.bot.on("message", (data) => {
      if (JSON.parse(data).event === 'online') {
        return;
      }
      
      clearTimeout(timeoutForBot);
      timeoutForBot = setTimeout(
        async () => await this._reconnectBotWithAnotherPartner(),
        30000
      );
    });
  };

  /**
   *
   * @param {Bot} bot
   */
  _reconnectBotWithAnotherPartner = async () => {
    console.log(`reconnecting bot ${this.bot.id} with another partner...`);
    this.bot.terminateConversation();
    await this.bot.getPartner();
  };
}

module.exports = {
  SelfDetector,
};
