require("dotenv").config();

const { pascalCase } = require("change-case");

const { Bot } = require("./Bot/Bot.js");

const { SelfDetector } = require("./SelfDetector/SelfDetector.js");

const { WEBSOCKET_URL } = process.env;

const stdin = process.openStdin();

const PYTHON_REGEXP = /([a-z])_(a-z])/g;

const subscribeToBots = async ([bot1, bot2]) => {
  bot1.on("message", async (data) => {
    const { event } = JSON.parse(data);

    const className = `${pascalCase(event, {
      splitRegexp: PYTHON_REGEXP,
    })}Response`;

    eval(`import("./Responses/${className}.js")
    .then(({${className}}) => new ${className}().react(${data}, bot1, bot2)).catch(() => {});`);
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
