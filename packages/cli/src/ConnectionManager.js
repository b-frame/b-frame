// Module imports
import ircMessage from 'irc-message'
import EventEmitter from 'events'
import WebSocket from 'ws'





export class ConnectionManager extends EventEmitter {
	/***************************************************************************\
		Public Methods
	\***************************************************************************/

	constructor (options) {
		super()
		this.isConnected = false
		this.ws = null
		this.options = options
	}

	say = (channelName, message) => {
		this.ws.send(`PRIVMSG ${channelName} :${message}`)
	}

	start () {
		const {
			twitch: twitchConfig,
		} = this.config

		this.ws = new WebSocket(twitchConfig.websocketURL)

		this.ws.on('open', () => {
			this.ws.send(`CAP REQ :${twitchConfig.capabilities.join(' ')}`)
			this.ws.send(`PASS ${twitchConfig.credentials.token}`)
			this.ws.send(`NICK ${twitchConfig.credentials.username}`)

			twitchConfig.channels.forEach(channel => {
				this.ws.send(`JOIN ${channel}`)
			})

			this.ws.send(`PRIVMSG #fdgt :bits "!project"`)

			this.isConnected = true
		})

		this.ws.on('message', async data => {
			const parsedMessage = ircMessage.parse(data)

			const {
				command: ircCommand,
				params: [
					channelName,
					...[message]
				],
			} = parsedMessage

			const [, commandName] = (this.commandRegex.exec(message) || [])

			if ((ircCommand === 'PRIVMSG') && commandName) {
				const results = await this.commands[commandName].execute({
					channel: channelName,
					rawMessage: parsedMessage.raw,
					say: this.say,
				})
			}
		})
	}

	get commandRegex () {
		return new RegExp(`^!(${Object.keys(this.commands).map(name => name).join('|')})`)
	}

	get commands () {
		return this.options.commands
	}

	get config () {
		return this.options.config
	}
}
