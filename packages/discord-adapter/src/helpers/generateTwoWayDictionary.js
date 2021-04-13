function reducePair (accumulator, pair) {
	const [key1, key2] = pair
	accumulator[key1] = key2
	accumulator[key2] = key1
	return accumulator
}

export function generateTwoWayDictionary (pairs) {
	return pairs.reduce(reducePair, {})
}
