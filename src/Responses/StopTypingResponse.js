class StopTypingResponse {
  react(json, me, partner) {
    partner.stopTyping();
  }
}

module.exports = {
  StopTypingResponse,
};
