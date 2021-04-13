export class DiscordAdapter {
	constructor(
		config: {
			credentials: {
				token: string,
			},

			intents: string | number | string[] | number[],

			prefix: string | string[],

			shouldRegisterSlashCommands: boolean,
		}
	)
}
