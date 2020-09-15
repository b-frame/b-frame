"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _nodeFetch = _interopRequireDefault(require("node-fetch"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Module imports
async function _default(options) {
  const {
    argsString: query,
    message
  } = options;
  const response = {
    say: `I'm sorry, but you must provide a query for the magic 8-ball to respond.`,
    success: false
  };

  if (query) {
    const magicResponse = await (0, _nodeFetch.default)(`https://8ball.delegator.com/magic/JSON/${query}`);
    const {
      magic
    } = await magicResponse.json();
    let emoji = null;

    switch (magic.type) {
      case 'Affirmative':
        emoji = '😁';
        break;

      case 'Contrary':
        emoji = '😬';
        break;

      case 'Neutral':
        emoji = '🤔';
        break;
    }

    response.say = `🔮 The Magic 8-ball says... ${magic.answer}. ${emoji}`;
    response.success = true;
  }

  return response;
}