import ChatClientStore from "./chatClientStore.js";
import {
	createRequestInitForPostRequest,
	createRequestInitForGetRequest
} from "./util.js";
import {
	Account,
	Alias
} from './models.js'

/**
 * The interface for interacting with the ChatServer API.
 */
class ChatAPI {
	/**
	 * ChatAPI constructor.
	 *
	 * @param {ChatClientStore} store see [ChatClient's store property]{@link ChatClient#store}
	 */
	constructor(store) {
		/**
		 * See [ChatClient's store property]{@link ChatClient#store}
		 * @type{ChatClientStore}
		 */
		this.store = store;


		/**
		 * Helper class for authorization routes. Signup, Login, Logout, etc...
		 * @type {AuthEndpoint}
		 */
		this.auth = new AuthEndpoint(this.store)

		/**
		 * Helper class for aliases routes. Create, Get, Update, Delete, etc...
		 * @type {AliasesEndpoint}
		 */
		this.aliases = new AliasesEndpoint(store)

		this.messages = new MessagesEndpoint()
		// TODO(lukemurray): websocket routes or endpoints. maybe its own file
	}

}


/**
 * Helper class for authentication routes.
 */
class AuthEndpoint {

	/**
	 * AuthEndpoint constructor.
	 *
	 * @param {ChatClientStore} store see [ChatClient's store property]{@link ChatClient#store}
	 */
	constructor(store) {
		/**
		 * See [ChatClient's store property]{@link ChatClient#store}
		 * @type{ChatClientStore}
		 */
		this.store = store;
	}


	/**
	 * Sign up for a new account with a single initial alias.
	 * @param {string} alias The name of the initial alias if signup is successful.
	 * @param {string} email The email address associated with the account.
	 * @param {string} password The password associated with the account.
	 * @returns {Promise<Object>} A success message upon successful login
	 */
	signup(alias, email, password) {
		let route = 'signup'
		return fetch(`${this.store.host}/${route}`, createRequestInitForPostRequest({
				alias,
				email,
				password,
			}))
			.then(response => {
				// if the response is not ok i.e. status not in 200-299
				// the server sends an error message as json {message: 'error'}
				if (response.ok) {
					return response.json()
				}
				// by throwing the response the error handler can parse
				// the message and bubble it up the api
				throw response
			}).catch(responseOrError => {
				if (responseOrError instanceof Response) {
					return responseOrError.json().then(errorJSON => {
						throw new Error(errorJSON.message)
					})
				}
				throw responseOrError
			})
	}

	// TODO(lukemurray): the alias field here doesn't make any sense. if the account deletes its alias can't log in change to email
	/**
	 * Login to an existing account.
	 * @param {string} alias The name of an alias the account has access too.
	 * @param {string} password The password associated with the account.
	 * @returns {Promise<Account>} Upon success returns the account which was logged in.
	 */
	login(alias, password) {
		let route = 'login'
		return fetch(`${this.store.host}/${route}`, createRequestInitForPostRequest({
				alias,
				password,
			}))
			.then(response => {
				if (response.ok) {
					return response.json()
				}
				throw response
			}).then(account => {
				return new Account(account.id, account.email, new Date(account.createdAt), new Date(account.updatedAt))
			}).catch(responseOrError => {
				if (responseOrError instanceof Response) {
					return responseOrError.json().then(errorJSON => {
						throw new Error(errorJSON.message)
					})
				}
				throw responseOrError
			})
	}

	/**
	 * Logout of the currently logged in account
	 * @returns {Promise<void>} Upon success returns nothing.
	 */
	logout() {
		let route = 'logout'
		return fetch(`${this.store.host}/${route}`, createRequestInitForPostRequest())
			.then(response => {
				if (response.ok) {
					return
				}
				throw response
			}).catch(responseOrError => {
				if (responseOrError instanceof Response) {
					return responseOrError.json().then(errorJSON => {
						throw new Error(errorJSON.message)
					})
				}
				throw responseOrError
			})
	}
}


/**
 * The aliases endpoint of the chat server.
 */
class AliasesEndpoint {
	/**
	 * AliasesEndpoint constructor.
	 *
	 * @param {ChatClientStore} store see [ChatClient's store property]{@link ChatClient#store}
	 */
	constructor(store) {
		/**
		 * See [ChatClient's store property]{@link ChatClient#store}
		 * @type{ChatClientStore}
		 */
		this.store = store;
	}

	/**
	 * Get all the aliases associated with the currently logged in account.
	 * @returns {Promise<Alias[]>} the aliases associated with the currently logged in account
	 */
	getAccountAliases() {
		let route = 'aliases'
		return fetch(`${this.store.host}/${route}`, createRequestInitForGetRequest()).then(response => response.json()).then(aliasesArray => {
			return aliasesArray.map(aliasDTO => {
				return new Alias(aliasDTO.id, aliasDTO.name, aliasDTO.createdAt, aliasDTO.updatedAt, aliasDTO.payload)
			})
		})
	}

	/**
	 * Create a new alias
	 */
	createNew() {
		// TODO(lukemurray): not implemented
		// route: /aliases
		// type: POST
		// expects: name, payload
		// returns: alias or error
	}

	/**
	 * Create a new alias
	 */
	getById(id) {
		// TODO(lukemurray): not implemented
		// route: /aliases/:alias_id
		// type: GET
		// returns: alias or error
	}

	updateById(id) {
		// TODO(lukemurray): not implemented
		// route: /aliases/:alias_id
		// type: PUT
		// expects: name, payload
		// returns: alias or error
	}

	deleteById(id) {
		// TODO(lukemurray): not implemented
		// route: /aliases/:alias_id
		// type: PUT
		// returns: alias or error
	}
}

/**
 * The messages endpoint of the chat server.
 */
class MessagesEndpoint {
	constructor() {}

	// all requests
	// user-alias-id: id of your alias
	// since-time: epoch time
	// interlocutors: 'senders and recipients' (Stringified array)

	get() {
		// TODO(lukemurray): not implemented
		// route: /messages
		// type: GET
		// returns: message[]
		// user-alias-id: id of your alias
		// since-time: epoch time
		// interlocutors: 'senders and recipients' (Stringified array)
	}

	create() {
		// TODO(lukemurray): not implemented
		// user-alias-id: id of your alias
		// route: /messages
		// type: POST
		// expects: payload, recipients[]
		// returns: message[]
	}

	getById() {
		// TODO(lukemurray): not implemented
		// user-alias-id: id of your alias
		// route: /messages/:message_id
		// type: GET
		// returns: message
	}

	updateById() {
		// TODO(lukemurray): not implemented
		// user-alias-id: id of your alias
		// route: /messages/:message_id
		// type: PUT
		// expects: payload
		// returns: message
	}

	deleteById() {
		// TODO(lukemurray): not implemented
		// user-alias-id: id of your alias
		// route: /messages/:message_id
		// type: PUT
		// expects: payload
		// returns: message
	}
}

class PrivatePayloadEndpoint {
	constructor() {}

	create() {
		// TODO(lukemurray): not implemented
		// route: /payloads
		// type: POST
		// expects: entityId, payload
		// returns: success
	}

	get() {
		// TODO(lukemurray): not implemented
		// user-alias-id: id of your alias
		// route: /payloads/:entity_id
		// type: GET
		// returns: Payload
	}

	put() {
		// TODO(lukemurray): not implemented
		// user-alias-id: id of your alias
		// route: /payloads/:payload_id
		// expects: payload
		// type: PUT
		// returns: Payload
	}

	delete() {
		// TODO(lukemurray): not implemented
		// user-alias-id: id of your alias
		// route: /payloads/:payload_id
		// type: DELETE
		// returns: ok
	}

}

export default ChatAPI;