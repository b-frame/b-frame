// Module imports
import EventEmitter from 'events'
import fetch from 'node-fetch'
import WebSocket from 'ws'





// Local imports
import { GATEWAY_OP_CODES } from './DiscordOpCodes.js'
import { INTENTS } from './DiscordIntents.js'





// Constants
const HEARTBEAT_INTERVAL = 45000





function rateLimit (response) {
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

export class Discord extends EventEmitter {
	connection = null
	credentials = null
	heartbeatInterval = 45000
	heartbeatIntervalID = null
	isConnected = false
	isGreeted = false
	isLastHeartbeatAcknowledged = false
	lastSequenceNumber = null

	async connect () {
		const response = await this.fetch('/gateway/bot')
		const responseJSON = await response.json()

		this.connection = new WebSocket(`${responseJSON.url}?v=6&encoding=json`)
		this.connection.on('close', (blep, foo, bar) => {
			console.log('close', blep, foo, bar)
		})
		this.connection.on('message', message => this.onMessage(message))
		this.connection.on('open', () => this.onConnectionOpen())
	}

	constructor (options) {
		super()
		this.credentials = options.credentials
		this.intents = options.intents
		this.log = options.logFn
	}

	destroy () {}

	async fetch (route, options = {}) {
		const requestOptions = {
			...options,
			headers: {
				Authorization: `Bot ${this.credentials.token}`,
				'Content-Type': 'application/json',
				...(options.headers || {})
			},
		}

		if (options.body) {
			requestOptions.body = JSON.stringify(options.body)
		}

		const response = await fetch(`https://discord.com/api/v8/${route}`, requestOptions)

		await rateLimit(response)

		return response
	}

	generateIntentsValue () {
		return this.intents.reduce((accumulator, intent) => {
			if (typeof intent === 'string') {
				accumulator += INTENTS[intent.toUpperCase()]
			} else if (typeof intent === 'number') {
				accumulator += intent
			} else {
				console.error('Unrecognized intent:', intent)
			}

			return accumulator
		}, 0)
	}

	onMessage (data) {
		const parsedData = JSON.parse(data)

		this.log('onMessage')
		this.log(parsedData)

		if (parsedData.s) {
			this.lastSequenceNumber = parsedData.s
		}

		this.log(`received ${GATEWAY_OP_CODES[parsedData.op]}`)
		this.log(parsedData)

		// if (parsedData.op === GATEWAY_OP_CODES['HEARTBEAT_ACK']) {
		// 	this.heartbeatInterval = parsedData.d.heartbeat_interval

		// 	if (!this.isGreeted) {
		// 		this.isGreeted = true
		// 		// this.startHeartbeat()
		// 		this.sendIdentify()
		// 	}

		// 	this.isLastHeartbeatAcknowledged = true
		// }
	}

	onConnectionOpen () {
		// this.sendHello()
		this.isConnected = true
	}

	sendHeartbeat () {
		if (!this.isLastHeartbeatAcknowledged) {
			this.log('Last HEARTBEAT was not acknowledged; stopping...')
			this.stopHeartbeat()
			// Do the disconnecty thingy
			return
		}

		this.log('Sending HEARTBEAT...')
		this.isLastHeartbeatAcknowledged = false
		this.sendOp(GATEWAY_OP_CODES['HEARTBEAT'], this.lastSequenceNumber)
	}

	sendHello () {
		this.log('Sending HELLO...')
		this.sendOp(GATEWAY_OP_CODES['HELLO'])
	}

	sendIdentify () {
		this.log('Sending IDENTIFY...')
		this.sendOp(GATEWAY_OP_CODES['IDENTIFY'], {
			intents: this.generateIntentsValue(),
			properties: {
				$browser: this.credentials.browser || 'b-frame',
				$device: this.credentials.device || 'b-frame',
				$os: this.credentials.os || 'linux',
			},
			token: this.credentials.token,
		})
	}

	sendOp (code, data) {
		const payload = { op: code }

		if (data) {
			payload.d = data
		}

		this.log('OP')
		this.log(payload)

		this.connection.send(JSON.stringify(payload))
	}

	startHeartbeat () {
		this.heartbeatIntervalID = setInterval(() => this.sendHeartbeat(), this.heartbeatInterval)
	}

	stopHeartbeat () {
		clearInterval(this.heartbeatIntervalID)
	}
}

// async #deleteSlashCommands (slashCommands) {
// 	this.log(`Deleting slash commands...`)

// 	let deletedSlashCommandCount = 0

// 	while (deletedSlashCommandCount < slashCommands.length) {
// 		await this.#deleteSlashCommand(slashCommands[deletedSlashCommandCount])
// 		deletedSlashCommandCount += 1
// 	}

// 	this.log('Done.')
// }

// async #deleteSlashCommand (command) {
// 	this.log(`Deleting ${command.name}...`)

// 	const response = await this.#fetch(`/applications/${this.client.user.id}/commands/${command.id}`, {
// 		method: 'delete',
// 	})

// 	this.log('Done.')

// 	return response
// }

// #getSlashCommands () {
// 	return this.#fetch(`/applications/${this.client.user.id}/commands`)
// }

// async #onInteraction (interaction, options) {
// 	const { commands } = options
// 	const { commandName } = interaction

// 	await commands[commandName].execute({
// 		channel: interaction.channel,
// 		commandName,
// 		interaction,
// 		isInteraction: true,
// 		say: (channel, message) => interaction.reply(message),
// 	})

// 	return false
// }

// async #registerSlashCommand (command) {
// 	this.log(`Registering ${command.name}...`)

// 	const response = await this.#fetch(`/applications/${this.client.user.id}/commands`, {
// 		body: command,
// 		method: 'post',
// 	})

// 	this.log('Done.')

// 	return response
// }
