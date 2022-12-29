const EventEmitter = require("events");

const W3CWebSocket = require("websocket").w3cwebsocket;

class Bot extends EventEmitter {
  /**@type {W3CWebSocket} */
  client = null;

  ping = null;

  constructor({ id, websocketUrl }) {
    super();

    this.id = id;
    this.websocketUrl = websocketUrl;
  }

  register = async () => {
    await new Promise((resolve) => {
      this.client = new W3CWebSocket(this.websocketUrl);

      this.client.onmessage = (message) => {
        this.emit("message", message.data);
        if (message.data === '{"event": "user_registered"}') {
          resolve(message.data);
        }
      };

      this.client.onopen = () => {
        this.ping = setInterval(
          () => this._dispatchEvent({ event: "online" }),
          5000
        );
        this._dispatchEvent({ event: "register_user" });
        this._dispatchEvent({ event: "online" });
      };
    });
  };

  getPartner = async () => {
    await new Promise((resolve) => {
      const callback = (data) => {
        if (data === '{"event": "joined_to_conversation"}') {
          this.removeListener("message", callback);
          resolve(data);
        }
      };
      this.on("message", callback);

      this._dispatchEvent({ event: "get_partner" });
    });
  };

  sendMessage = (message) => {
    const event = {
      event: "send_message",
      message,
    };

    this._dispatchEvent(event);
  };

  startTyping = () => {
    this._dispatchEvent({
      event: "start_typing",
    });
  };

  stopTyping = () => {
    this._dispatchEvent({
      event: "stop_typing",
    });
  };

  terminateConversation = () => {
    this._dispatchEvent({
      event: "terminate_conversation",
    });
  };

  banrequest = () => {
    this._dispatchEvent({
      event: "banrequest",
    });
  };

  _dispatchEvent = (event) => {
    const message = JSON.stringify(event);

    this.client.send(message);
  };
}

module.exports = {
  Bot,
};
