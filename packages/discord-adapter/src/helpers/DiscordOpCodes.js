import { generateTwoWayDictionary } from './generateTwoWayDictionary.js'

export const GATEWAY_OP_CODES = generateTwoWayDictionary([
	[0, 'DISPATCH'],
	[1, 'HEARTBEAT'],
	[2, 'IDENTIFY'],
	[3, 'PRESENCE_UPDATE'],
	[4, 'VOICE_STATE_UPDATE'],
	[6, 'RESUME'],
	[7, 'RECONNECT'],
	[8, 'REQUEST_GUILD_MEMBERS'],
	[9, 'INVALID_SESSION'],
	[10, 'HELLO'],
	[10, 'HEARTBEAT_ACK'],
])
