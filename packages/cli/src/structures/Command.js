// Module imports
import babel from '@babel/core'
import chokidar from 'chokidar'
import fs from 'fs-extra'
import EventEmitter from 'events'
import path from 'path'





// Local imports
import { log } from '../helpers/log.js'





export class Command extends EventEmitter {
	/***************************************************************************\
		Private Methods
	\***************************************************************************/

	afterExecute (options) {
		const {
			channel,
			results,
		} = options

		if (results) {
			if (typeof results === 'string') {
				return options.say(channel, results)
			} else if (results.say) {
				return options.say(channel, results.say)
			}
		}

		return
	}

	beforeExecute () {}

	async initialize () {
		await this.load()
		this.watcher = chokidar.watch(this.path)
		this.watcher.on('change', () => this.load())
	}

	async load () {
		log(`Loading \`${this.name}\` command...`)

		this.commandFunction = null
		this.config = null

		try {
			// await new Promise((resolve, reject) => {
			// 	babel.transformFile(this.path, this.babelConfig, async (error, result) => {
			// 		if (error) {
			// 			reject(error)
			// 			return
			// 		}

			// 		log({result: result.code})
			// 		await fs.writeFile(this.outputPath, result.code, 'utf8')
			// 		resolve()
			// 	})
			// })
			// delete require.cache[this.outputPath]
			const commandModule = await import(`${this.path}?update=${Date.now()}`)
			this.commandFunction = commandModule.default
			this.config = commandModule.config || {}
			this.getArgs = commandModule.getArgs || ((argsString) => argsString)
			log(`Finished loading \`${this.name}\` command.`)
			this.emit('loaded')
		} catch (error) {
			log(`Failed to load \`${this.name}\` command.`)
			log(error)
		}
	}





	/***************************************************************************\
		Public Methods
	\***************************************************************************/

	constructor (options) {
		super()

		this.commandFunction = null
		this.config = null
		this.options = options
		this.initialize()
	}

	async execute (options) {
		const executor = async () => {
			this.beforeExecute(options)
			const args = await this.getArgs(options)
			const results = await this.commandFunction({
				...options,
				args,
			})
			this.afterExecute({
				...options,
				results,
			})
		}

		if (this.isLoaded) {
			await executor()
		} else {
			this.once('loaded', executor)
		}
	}





	/***************************************************************************\
		Getters
	\***************************************************************************/

	get babelConfig () {
		return this.options.babelConfig
	}

	get isLoaded () {
		return Boolean(this.commandFunction)
	}

	get name () {
		return this.options.name
	}

	get outputPath () {
		return path.resolve(this.options.outputPath, 'commands', `${this.name}.js`)
	}

	get path () {
		return this.options.path
	}
}
