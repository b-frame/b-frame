// Test environment setup
import '../setup'

// Module imports
import { expect } from 'chai'
import EventEmitter from 'events'
import fs from 'fs-extra'
import path from 'path'





// Local imports
import { Command } from '../../src/structures/Command'





// Local constants
const testCommandName = 'beep'





describe('Command', () => {
	let babelConfig = null
	let command = null

	before(() => {
		babelConfig = fs.readFileSync(path.resolve(__dirname, '..', '..', '.babelrc'), 'utf8')
		babelConfig = JSON.parse(babelConfig)
	})

	beforeEach(() => {
		command = new Command({
			babelConfig,
			name: testCommandName,
			outputPath: path.resolve(__dirname, '..', '.b-frame'),
			path: path.resolve(process.cwd(), 'test', 'app', 'commands', 'beep.js'),
		})
	})

	describe('constructor', () => {
		it('should be an instance of EventEmitter', () => {
			expect(command).to.be.instanceof(EventEmitter)
		})
	})
})
