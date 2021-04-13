// Module imports
import { BaseAdapter } from '@b-frame/base-adapter'
import Discord from 'discord.js'
import fetch from 'node-fetch'





// Local imports
import { Discord as DiscordLocal } from './helpers/DiscordAPI.js'
import defaultConfig from './default.config.js'





export class DiscordAdapter extends BaseAdapter {
	/***************************************************************************\
		Private Properties
	\***************************************************************************/

	#connection = null





	/***************************************************************************\
		Private Methods
	\***************************************************************************/

	async #connect () {
		const response = await this.#fetch('/gateway/bot')
		const responseJSON = await response.json()

		this.#connection = WebSocket(`${responseJSON.url}?v=6&encoding=json`)
		this.#connection.on('open', this.#onConnectionOpen)
	}

	async #deleteSlashCommands (slashCommands) {
		this.log(`Deleting slash commands...`)

		let deletedSlashCommandCount = 0

		while (deletedSlashCommandCount < slashCommands.length) {
			await this.#deleteSlashCommand(slashCommands[deletedSlashCommandCount])
			deletedSlashCommandCount += 1
		}

		this.log('Done.')
	}

	async #deleteSlashCommand (command) {
		this.log(`Deleting ${command.name}...`)

		const response = await this.#fetch(`/applications/${this.client.user.id}/commands/${command.id}`, {
			method: 'delete',
		})

		this.log('Done.')

		return response
	}

	async #fetch (route, options = {}) {
		const { credentials } = this.config
		const requestOptions = {
			...options,
			headers: {
				Authorization: `Bot ${credentials.token}`,
				'Content-Type': 'application/json',
				...(options.headers || {})
			},
		}

		if (options.body) {
			requestOptions.body = JSON.stringify(options.body)
		}

		const response = await fetch(`https://discord.com/api/v8/${route}`, requestOptions)

		await this.#rateLimit(response)

		return response
	}

	#getSlashCommands () {
		return this.#fetch(`/applications/${this.client.user.id}/commands`)
	}

	#onConnectionOpen () {
		this.#connection.send({
			op: 10,
			d: {
				heartbeat_interval: 45000,
			},
		})
		this.isConnected = true
	}

	async #onInteraction (interaction, options) {
		const { commands } = options
		const { commandName } = interaction

		await commands[commandName].execute({
			channel: interaction.channel,
			commandName,
			interaction,
			isInteraction: true,
			say: (channel, message) => interaction.reply(message),
		})

		return false
	}

	#rateLimit (response) {
		const requestIsRateLimited = Boolean(response.headers.get('X-RateLimit-Limit'))

		if (!requestIsRateLimited) {
			return null
		}

		const requestsRemaining = parseInt(response.headers.get('X-RateLimit-Remaining'))

		if (requestsRemaining) {
			return null
		}

		const waitTime = Math.ceil(parseFloat(response.headers.get('X-RateLimit-Reset-After')))
		const waitTimeMS = waitTime * 1000

		this.log(`Rate limit met. Waiting ${waitTime} seconds before continuing...`)

		return new Promise(resolve => setTimeout(resolve, waitTimeMS))
	}

	async #registerSlashCommand (command) {
		this.log(`Registering ${command.name}...`)

		const response = await this.#fetch(`/applications/${this.client.user.id}/commands`, {
			body: command,
			method: 'post',
		})

		this.log('Done.')

		return response
	}





	/***************************************************************************\
		Public Methods
	\***************************************************************************/

	async connect (options) {
		const {
			commands,
			credentials,
			intents,
		} = options

		this.client = new DiscordLocal({
			credentials,
			intents,
			logFn: message => this.log(message),
		})
		this.client.connect()

		// this.client = new Discord.Client({
		// 	intents: intents ?? Discord.Intents.NON_PRIVILEGED,
		// })

		// this.client.login(credentials.token)

		// this.isConnected = await new Promise(resolve => {
		// 	this.client.once('ready', () => {
		// 		resolve(true)
		// 	})
		// })

		// if (this.config.shouldRegisterSlashCommands) {
		// 	await this.registerSlashCommands(commands)

		// 	this.client.on('message', async message => {
		// 		this.emit('message', message, options)
		// 	})
		// 	this.client.on('interaction', async interaction => {
		// 		if (!interaction.isCommand()) {
		// 			return
		// 		}

		// 		this.#onInteraction(interaction, options)
		// 	})
		// }
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

	async registerSlashCommands (commands) {
		this.log('Registering global commands as slash commands...')

		const commandKeys = Object.keys(commands)
		const commandValues = Object.values(commands)

		let registeredCommandCount = 0

		while (registeredCommandCount < commandKeys.length) {
			const name = commandKeys[registeredCommandCount]
			const command = commandValues[registeredCommandCount]
			const config = command.config.discord || { description: 'No description available' }

			this.log(`Registering ${name} command...`)
			const result = await this.client.application.commands.create({
				name,
				...config,
			})
			this.log('Done.')

			// const response = await this.#registerSlashCommand({
			// 	name,
			// 	...config,
			// })

			registeredCommandCount += 1
		}

		this.log('All slash commands registered.')
	}

	say = (channel, message) => {
		channel.send(message)
	}

	async stop () {
		// const response = await this.#getSlashCommands()
		// const slashCommands = await response.json()
		// await this.#deleteSlashCommands(slashCommands)
		super.stop()
	}

	get config () {
		return this._config || (this._config = {
			...defaultConfig,
			...this.options,
		})
	}
}
