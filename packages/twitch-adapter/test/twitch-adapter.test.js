// Module imports
import { expect } from 'chai'
import EventEmitter from 'events'
import WebSocket from 'ws'





// Local imports
import { TwitchAdapter } from '../src'
import defaultConfig from '../src/default.config'





describe('@b-frame/twitch-adapter', () => {
	const testOptions = {
		channels: [
			'foo',
		]
	}
	let adapter = null

	beforeEach(async () => {
		adapter = new TwitchAdapter(testOptions)
	})

	describe('constructor', () => {
		it('should be an instance of EventEmitter', () => {
			expect(adapter).to.be.instanceof(EventEmitter)
		})

		describe('default props', () => {
			describe('isConnected', () => {
				it('should be false', () => {
					expect(adapter.isConnected).to.be.false
				})
			})

			describe('ws', () => {
				it('should be null', () => {
					expect(adapter.ws).to.be.null
				})
			})

			describe('options', () => {
				it('should represent passed options', () => {
					expect(adapter.options).to.deep.equal(testOptions)
				})
			})
		})
	})

	describe('getters', () => {
		describe('config', () => {
			it('should be a merged copy of the default config and the passed options', () => {
				expect(adapter.config).to.deep.equal({
					...defaultConfig,
					...testOptions,
				})
			})
		})
	})

	describe('start', () => {
		it('should initialize a new websocket connection', done => {
			adapter.start({ commands: {} })
			adapter.ws.on('open', () => {
				expect(adapter.ws).to.be.instanceof(WebSocket)
				adapter.stop()
				done()
			})
		})
	})

	describe('say', () => {

	})
})
