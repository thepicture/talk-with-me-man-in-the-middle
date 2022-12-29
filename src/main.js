require("dotenv").config();

const colors = require("colors/safe");

const { Bot } = require("./Bot/Bot.js");

const { SelfDetector } = require("./SelfDetector/SelfDetector.js");

const { WEBSOCKET_URL } = process.env;
const SPAMBOT_MESSAGES = process.env.SPAMBOT_MESSAGES.split(";;;");

const stdin = process.openStdin();

const log = (id, message) => {
  const colorDispatcher = id % 2 === 0 ? colors.green : colors.yellow;

  console.log(
    colorDispatcher(`[${id}] [${new Date().toISOString()}] ${message}`)
  );
};

const isSpambotMessage = (json) => {
  return SPAMBOT_MESSAGES.some((message) => {
    const that = json.message.toLowerCase();
    const another = message.toLowerCase();

    return that.includes(another);
  });
};

const subscribeToBots = async ([bot1, bot2]) => {
  bot1.on("message", async (data) => {
    const json = JSON.parse(data);
    const { event } = json;

    let shouldGetPartner = true;

    try {
      if (event === "start_typing") {
        bot2.startTyping();
      } else if (event === "stop_typing") {
        bot2.stopTyping();
      } else if (event === "message" && !json.mine) {
        if (isSpambotMessage(json)) {
          log(
            bot1.id,
            `spambot message (${json.message}), terminate conversation`
          );
          bot1.terminateConversation();
          shouldGetPartner = false;
          await new Promise((r) =>
            setTimeout(() => {
              r((shouldGetPartner = true));
            }, 1000)
          );
          bot1.banrequest();
        } else {
          bot2.sendMessage(json.message);
          bot2.stopTyping();
        }
        log(bot1.id, json.message);
      } else if (event === "terminate_conversation") {
        log(bot1.id, `terminate conversation`);
        if (shouldGetPartner) {
          await bot1.getPartner();
        }
      } else if (event === "joined_to_conversation") {
        log(bot1.id, `joined to conversation`);
      } else if (event === "user_registered") {
        log(bot1.id, `user registered`);
      }
    } catch {}
  });
};

(async () => {
  const bots = [
    new Bot({
      id: 1,
      websocketUrl: WEBSOCKET_URL,
    }),
    new Bot({
      id: 2,
      websocketUrl: WEBSOCKET_URL,
    }),
  ];

  stdin.addListener("data", (data) => {
    const text = data.toString().trim();

    if (text.startsWith("1 ")) {
      const message = text.split("1 ")[1];
      bots[0].sendMessage(message);
    } else if (text.startsWith("2 ")) {
      const message = text.split("2 ")[1];
      bots[1].sendMessage(message);
    }
  });

  subscribeToBots(bots);
  subscribeToBots(bots.reverse());

  bots.forEach((bot) => {
    new SelfDetector(bot).activate();
  });

  bots.reverse();

  for (const bot of bots) {
    await bot.register();
    await bot.getPartner();
  }
})();
