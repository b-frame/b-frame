// Module imports
import EventEmitter from 'events'





// Local imports
import defaultConfig from './default.config.js'





export class BaseAdapter extends EventEmitter {
	/***************************************************************************\
		Private Methods
	\***************************************************************************/

	async #onMessage (message, options) {
		const { commands } = options

		const {
			args,
			commandName,
		} = this.parseMessage(message, options)

		const commandExists = commands[commandName]

		if (commandExists) {
			const commandOptions = this.getCommandOptions(commandName, args, message, options)
			await commands[commandName].execute(commandOptions)
		}

		return false
	}





	/***************************************************************************\
		Public Methods
	\***************************************************************************/

	constructor (options) {
		super()
		this.isConnected = false
		this.options = options

		const requiredMethods = ['connect', 'disconnect']
		const missingMethods = requiredMethods.filter(method => !this[method])

		if (missingMethods.length) {
			throw new Error(`${this.constructor.name} is missing the following required methods: ${missingMethods.map(methodName => `'${methodName}()'`).join(', ')}`)
		}

		this.on('message', this.#onMessage)
	}

	getCommandOptions (commandName, args, message, options) {
		return {
			adapterType: this.name,
			args,
			commandName,
			message,
			...options,
		}
	}

	log (message, level = 'info') {
		return console[level](`[${this.name}]`, message)
	}

	parseMessage (message, options) {
		const {
			commands,
			prefix,
		} = options

		let prefixList = prefix

		if (!Array.isArray(prefixList)) {
			prefixList = [prefixList]
		}

		const commandRegex = new RegExp(`^(?:${prefixList.join('|')})(${Object.keys(commands).join('|')})\s?(.*)`)
		const [, commandName, args = ''] = (commandRegex.exec(message) || [])

		return {
			args,
			commandName,
		}
	}

	async start (options) {
		const allOptions = {
			...this.config,
			...options,
		}

		await this.connect(allOptions)

		this.emit('ready')
	}

	stop () {
		this.disconnect()
	}





	/***************************************************************************\
		Getters
	\***************************************************************************/

	get config () {
		return this._config || (this._config = {
			...defaultConfig,
			...this.options,
		})
	}

	get name () {
		return this.constructor.name
	}
}
