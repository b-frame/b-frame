// Module imports
import fetch from 'node-fetch'





export default async function (options) {
  const {
    args: {
			query,
		},
    message,
  } = options
  const response = {
    say: `I'm sorry, but you must provide a query for the magic 8-ball to respond.`,
    success: false,
  }

  if (query) {
    const magicResponse = await fetch(`https://8ball.delegator.com/magic/JSON/${query}`)
    const { magic } = await magicResponse.json()
    let emoji = null

    switch (magic.type) {
      case 'Affirmative':
        emoji = '😁'
        break

      case 'Contrary':
        emoji = '😬'
        break

      case 'Neutral':
        emoji = '🤔'
        break
    }

		// if () {}
		console.log(options)

    response.say = `> ${query}\n\n🔮 The Magic 8-ball says... ${magic.answer}. ${emoji}`
    response.success = true
  }

  return response
}

export const config = {
	discord: {
		description: 'Ask the Magic 8-ball a question!',
		options: [
			{
				name: 'query',
				description: 'Your question for the Magic 8-ball',
				type: 'STRING',
				required: true,
			},
		],
	},
}

function discordOptionsReducer (accumulator, option) {
	const {
		name,
		value,
	} = option

	accumulator[name] = value

	return accumulator
}

function parseDiscordOptions (optionsList) {
	return optionsList.reduce(discordOptionsReducer, {})
}

export function getArgs (options) {
	if (options.isInteraction) {
		return parseDiscordOptions(options.interaction.options)
	}

	return {
		query: options.argsString,
	}
}
