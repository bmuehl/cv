import { onDestroy } from 'svelte'

export const getJoke = async () => {
	const response = await fetch(
		'https://sv443.net/jokeapi/v2/joke/Programming?blacklistFlags=racist,sexist,explicit'
	)

	if (response.status === 200) {
		const jokeJson = await response.json()

		if (jokeJson.type === 'single') {
			return `<q>${jokeJson.joke}</q>`
		}

		const joke = `<q>${jokeJson.setup}</q><q>${jokeJson.delivery}</q>`
		return joke
	}
	return ''
}

export function clickOnKey(element: HTMLElement, key = 'Enter') {
	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === key) {
			event.preventDefault()
			element.focus()
		}
	}

	function handleKeyUp(event: KeyboardEvent) {
		if (event.key === key) {
			event.preventDefault()
			element.click()
		}
	}

	document.addEventListener('keydown', handleKeyDown)
	document.addEventListener('keyup', handleKeyUp)

	return {
		destroy() {
			document.removeEventListener('keydown', handleKeyDown)
			document.removeEventListener('keyup', handleKeyUp)
		}
	}
}

export function randomNumberBetween(min = 0, max = 1) {
	return Math.floor(Math.random() * (max - min + 1) + min)
}

export function onInterval(callback: () => void, milliseconds: number) {
	const interval = setInterval(callback, milliseconds)

	onDestroy(() => {
		clearInterval(interval)
	})
}

export function inView(node: HTMLElement, params = { threshold: 0 }) {
	let observer: IntersectionObserver

	const handleIntersect: IntersectionObserverCallback = (e) => {
		const v = e[0].isIntersecting ? 'enter' : 'exit'
		node.dispatchEvent(new CustomEvent(v))
	}

	const setObserver = ({ root, threshold }: IntersectionObserverInit) => {
		const options = { root, threshold }
		if (observer) observer.disconnect()
		observer = new IntersectionObserver(handleIntersect, options)
		observer.observe(node)
	}

	setObserver(params)

	return {
		update(params: IntersectionObserverInit) {
			setObserver(params)
		},

		destroy() {
			if (observer) observer.disconnect()
		}
	}
}
