/**
 * The interface for interacting with the ChatServer API.
 */
class ChatAPI {
	/**
	 * ChatAPI constructor.
	 *
	 * @param {string} host see [ChatAPI's host property]{@link ChatAPI#host}
	 */
	constructor(host) {
		/**
		 * The host of the chat server. Includes the hostname and port. For example https://mozilla.org:4000
		 *
		 * See https://developer.mozilla.org/en-US/docs/Web/API/URL/host
		 */
		this.host = host;
		this.messages = new MessagesEndpoint()
		this.aliases = new AliasesEndpoint()
		this.auth = new AuthEndpoint()
		this.accounts = new AccountsEndpoint()

		// TODO(lukemurray): websocket routes or endpoints. maybe its own file
	}

}


/**
 * The authorization endpoint of the chat server.
 */
class AuthEndpoint {
	constructor() {}

	signup() {
		// TODO(lukemurray): not implemented. add ability to pick an alias
	}

	login() {
		// TODO(lukemurray): not implemented
	}

	logout() {
		// TODO(lukemurray): not implemented
	}
}



/**
 * The account endpoint of the chat server.
 */
class AccountsEndpoint {
	constructor() {

	}

	/**
	 * Get a list of aliases owned by the authenticated account
	 */
	getAliases() {

	}
}

/**
 * The aliases endpoint of the chat server.
 */
class AliasesEndpoint {
	constructor() {

	}
}

/**
 * The messages endpoint of the chat server.
 */
class MessagesEndpoint {
	constructor() {}

	/**
	 *
	 * @param {Object} options
	 * @param {string} options.sinceTime this or that
	 * @param {string[]} options.addresses this or that
	 */
	get(options) {}
}

export default ChatAPI;