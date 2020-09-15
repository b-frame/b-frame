// Module imports
import fs from 'fs-extra'
import path from 'path'





before(async () => {
	// Create compile directories
	await fs.mkdir(path.resolve(__dirname, '.b-frame', 'commands'), { recursive: true })
})

after(async () => {
	// Delete compile directory
	await fs.rmdir(path.resolve(__dirname, '.b-frame'), { recursive: true })
})
