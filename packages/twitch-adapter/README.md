# @b-frame/twitch-adapter

This is a Twitch adapter for the `b-frame` bot framework.

## Configuration

| Option				| Type				| Default	| Description																										|
|---------------|-------------|---------|---------------------------------------------------------------|
| `channels`		| `array`			| `[]`		| a list of channels to watch after establishing a connection		|
| `credentials`	| `object`		| 				| 																															|
| ├ `token`			| `string`		| 				| OAuth token for the bot's Twitch account											|
| └ `username`	| `string`		| 				| username of the bot's Twitch account													|
| `prefix`			| `[string]`	| `[!]`		| the prefix you want to use for your commands, e.g. `!command`	|

## Example usage

```js
// b-frame.config.js

import { TwitchAdapter } from '@b-frame/twitch-adapter'

const twitchAdapter = new TwitchAdapter({
	channels: [
		'#trezycodes',
	],

	credentials: {
		token: process.env.TWITCH_TOKEN,
		username: process.env.TWITCH_USERNAME,
	},

	prefix: [
		'!',
		'¡',
	],
})
```
