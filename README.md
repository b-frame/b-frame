# `b-frame`

`b-frame` is a framework for easily building extremely powerful chat bots!

## Why `b-frame`?

* Automatic command reloading
* Automatic/dynamic precompilation with Babel
* Automatic `.env` file loading
* Cross-platform
	* Discord
	* Twitch
	* Custom adapters

## Getting started

### Prerequisites

Currently, `b-frame` only runs on Node 14+. We'll eventually add support for Node 12 LTS, as well.

### Creating your first bot with `b-frame`

#### Install @b-frame/cli

To get started with `b-frame`, you'll want to install the `b-frame` CLI:

```sh
npm install -g @b-frame/cli
# or
yarn global add @b-frame/cli
```

##### Installing locally

Most CLIs require you to install them globally, but `b-frame` works just fine installed locally. The only difference is that you'll need to run it with the appropriate executable:

```sh
npm install @b-frame/cli
npm run b-frame
# or
yarn add @b-frame/cli
yarn b-frame
```

You could also run it via a script in your `package.json` file:

```json
{
	"name": "my-project",
	"version": "0.0.1",
	"scripts": {
		"start": "b-frame",
	},
	"dependencies": "...",
}
```

#### Install an adapter

Once you have the CLI, you'll want an adapter! Adapters allow your bot to connect to various services and communicate with them. To install and set up an adapter, check out the appropriate documentation:
* [@b-frame/base-adapter](packages/base-adapter)
* [@b-frame/discord-adapter](packages/discord-adapter)
* [@b-frame/twitch-adapter](packages/twitch-adapter)

#### Create a `b-frame` config file

Your config file tells `b-frame` what adapters to use. Information for configuring an adapter is available in its documentation, but here's an example of setting up the `TwitchAdapter` in your config:

```js
import { TwitchAdapter } from '@b-frame/twitch-adapter'

export const adapters = [
	new TwitchAdapter({
		channels: ['#MyTwitchChannel'],

		credentials: {
			token: process.env.TWITCH_TOKEN,
			username: process.env.TWITCH_USERNAME,
		},

		prefix: '!',
	})
]
```

#### Add your first command!

The last step before starting up your bot is to create a command file! First, create a `commands/` directory at the root of your project. Next, add a new command file in the folder. We'll call it `commands/test.js`.

***NOTE:** The filename will be used to determine the command used to run this file; e.g. for a file called `test.js`, the command will be `!test`.*

```js
export default function () {
	return {
		say: 'Hello, world! 👋🏻',
	}
}
```

And we're done! Let's start up our bot. If you installed the `b-frame` CLI globally, you can start up with:

```sh
b-frame
```

Alternatively, if you installed the CLI locally, you can run it like so...

```sh
npm run b-frame
# or
yarn b-frame
```

Now, if you run the bot and send the `!test` command in any of the connected channels, the bot should respond with `Hello, world! 👋🏻`!
