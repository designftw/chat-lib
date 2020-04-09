import ChatClientStore from "./chatClientStore.js";
import ChatAPI from "./chatAPI.js";
import {
	Account
} from './models.js'

/**
 * The ChatClient is the interface for interacting with the ChatServer.
 */
class ChatClient {

	/**
	 * ChatClient constructor.
	 * @param {string} host see [ChatClientStore's host property]{@link ChatClientStore#host}
	 */
	constructor(host) {

		/**
		 * A reference to the [ChatClientStore]{@link ChatClientStore} which contains global state of the chat application.
		 * @type{ChatClientStore}
		 */
		this.store = new ChatClientStore(host)

		/**
		 * A reference to the [ChatAPI]{@link ChatAPI}, a helper class for communicating with the Chat Server.
		 * @type{ChatAPI}
		 */
		this.api = new ChatAPI(this.store)

	}

	/**
	 * Sign up for a new account with a single initial alias.
	 * @param {string} alias The name of the initial alias if signup is successful.
	 * @param {string} email The email address associated with the account.
	 * @param {string} password The password associated with the account.
	 * @returns {Promise<Object>} A success message upon successful login
	 */
	signup(alias, email, password) {
		// TODO(lukemurray): maybe on success also login
		return this.api.auth.signup(alias, email, password)
	}

	/**
	 * Login to an existing account.
	 * @param {string} alias The name of an alias the account has access too.
	 * @param {string} password The password associated with the account.
	 * @returns {Promise<Account>} Upon success returns the account which was logged in.
	 */
	login(alias, password) {
		return this.api.auth.login(alias, password).then(account => {
			this.store.account = account;
			return account
		})
	}

	/**
	 * Logout of an existing account
	 */
	logout() {
		return this.api.auth.logout()
	}
}

export default ChatClient;