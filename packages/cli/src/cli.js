#!/usr/bin/env node

import dotenv from 'dotenv'
dotenv.config()

// Module imports
import chokidar from 'chokidar'
import fs from 'fs-extra'
import path from 'path'





// Local imports
import { Command } from 'structures/Command.js'
import { log } from 'helpers/log.js'
import { mergeConfigs } from 'helpers/mergeConfigs.js'
import defaultConfig from 'default.config.js'





// Local constants
const commands = {}
const commandsPath = path.resolve(process.cwd(), 'commands')
const configPath = path.resolve(process.cwd(), 'b-frame.config.js')
const outputPath = path.resolve(process.cwd(), '.b-frame')





;(async () => {
	let commandFiles = null
	let config = null
	let localConfig = null

	try {
		await fs.mkdir(path.resolve(outputPath, 'commands'), { recursive: true })
	} catch (error) {
		log('Couldn\'t create the `.b-frame` build directory.')
		process.exit(1)
	}

	try {
		localConfig = await import(configPath)
		chokidar.watch(configPath).on('change', () => {
			log('Changes detected in b-frame.config.js. Restart the server to see those changes take effect.')
		})
	} catch (error) {
		log(error)
		log('Couldn\'t find `b-frame.config.js`. Please create it under the project root.')
		process.exit(1)
	}

	try {
		commandFiles = (await fs.readdir(commandsPath)).filter(filename => /\.js$/.test(filename))
	} catch (error) {
		log('Couldn\'t find a `commands` directory. Please create one under the project root.')
		process.exit(1)
	}

	if (commandFiles.length === 0) {
		log('No commands found.')
		process.exit(1)
	}

	commandFiles.forEach(filename => {
		const commandName = filename.replace(path.extname(filename), '')
		const commandPath = path.resolve(commandsPath, filename)

		commands[commandName] = new Command({
			name: commandName,
			outputPath,
			path: commandPath,
		})
	})

	config = mergeConfigs(defaultConfig, localConfig)

	const cleanup = () => {
		log('Cleaning up...')
		config.adapters.forEach(adapter => adapter.stop())
		Object.values(commands).forEach(command => command.watcher.close())
		log('Exiting...')
		process.exit(0)
	}

	process.on('SIGINT', cleanup)
	process.on('SIGUSR1', cleanup)
	process.on('SIGUSR2', cleanup)
	process.on('uncaughtException', cleanup)

	config.adapters.forEach(adapter => {
		log(`Starting adapter: ${adapter.constructor.name}`)
		adapter.on('ready', () => log(`Adapter started: ${adapter.constructor.name}`))
		adapter.start({ commands })
	})
})()
