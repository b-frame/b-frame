export default async function project (options) {
  return {
    say: 'The current project is b-frame.',
  }
}

export const config = {
	discord: {
		description: 'Gets the currently active project.',
	},
}
