// Module imports
import { BaseAdapter } from '@b-frame/base-adapter'
import Discord from 'discord.js'





// Local imports
import defaultConfig from 'default.config.js'





export class DiscordAdapter extends BaseAdapter {
	/***************************************************************************\
		Public Methods
	\***************************************************************************/

	async connect (options) {
		const { credentials } = options

		this.client = new Discord.Client

		this.client.login(credentials.token)

		this.isConnected = await new Promise(resolve => {
			this.client.once('ready', () => {
				resolve(true)
			})
		})

		this.client.on('message', async message => {
			this.emit('message', message, options)
		})
	}

	disconnect () {
		this.client?.destroy()
	}

	getCommandOptions (commandName, args, message, options) {
		const { commands } = options

		return {
			argsString: args.trim(),
			channel: message.channel,
			commandName,
			message,
			say: this.say,
		}
	}

	constructor (options) {
		super(options)
		this.client = null
	}

	parseMessage (message, option) {
		return super.parseMessage(message.content, option)
	}

	say = (channel, message) => {
		channel.send(message)
	}

	get config () {
		return this._config || (this._config = {
			...defaultConfig,
			...this.options,
		})
	}
}
