// Module imports
import { BaseAdapter } from '@b-frame/base-adapter'// Module imports
import ircMessage from 'irc-message'
import WebSocket from 'ws'





// Local imports
import defaultConfig from './default.config.js'





export class TwitchAdapter extends BaseAdapter {
	/***************************************************************************\
		Public Methods
	\***************************************************************************/

	async connect (options) {
		const {
			capabilities,
			channels,
			credentials,
			websocketURL,
		 } = options

		this.ws = new WebSocket(websocketURL)

		this.isConnected = await new Promise(resolve => {
			this.ws.on('open', () => {
				this.ws.send(`CAP REQ :${capabilities.join(' ')}`)
				this.ws.send(`PASS ${credentials.token}`)
				this.ws.send(`NICK ${credentials.username}`)

				channels.forEach(channel => {
					this.ws.send(`JOIN ${channel}`)
				})

				resolve(true)
			})
		})

		this.ws.on('message', packet => {
			packet.split('\r\n').filter(Boolean).forEach(async message => {
				if (message.startsWith('PING')) {
					this.ws.send('PONG')
				} else {
					this.emit('message', message, options)
				}
			})
		})
	}

	disconnect () {
		this.client?.destroy()
	}

	getCommandOptions (commandName, args, rawMessage, options) {
		const { commands } = options

		const parsedMessage = ircMessage.parse(rawMessage)

		const {
			command: ircCommand,
			params: [
				channelName,
				...[message]
			],
		} = parsedMessage

		return {
			argsString: args.trim(),
			channel: channelName,
			commandName,
			message,
			parsedMessage,
			rawMessage,
			say: this.say,
		}
	}

	constructor (options) {
		super(options)
		this.ws = null
	}

	parseMessage (rawMessage, options) {
		const parsedMessage = ircMessage.parse(rawMessage)
		const {
			command: ircCommand,
			params: [
				channelName,
				...[message]
			],
		} = parsedMessage

		return super.parseMessage(message, options)
	}

	say = (channelName, message) => {
		this.ws.send(`PRIVMSG ${channelName} :${message}`)
	}

	get config () {
		return this._config || (this._config = {
			...defaultConfig,
			...this.options,
		})
	}
}
