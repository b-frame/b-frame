// Module imports
import { DiscordAdapter } from '@b-frame/discord-adapter'
import { TwitchAdapter } from '@b-frame/twitch-adapter'





const prefixes = [
  '!',
  '¡',
]

const discordAdapter = new DiscordAdapter({
	credentials: {
		token: process.env.DISCORD_TOKEN,
	},

	prefix: prefixes,
})

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





export const adapters = [
	discordAdapter,
	twitchAdapter,
]
