export function mergeConfigs (...configs) {
	return configs.reduce((accumulator, config) => {
		return {
			...accumulator,
			...config,
		}
	})
}
