import {
	Account
} from './models.js'

/**
 * The store is an object passed by reference which is used to access global state
 * of the chat application.
 */
class ChatClientStore {
	/**
	 * ChatClientStore constructor.
	 * @param {string} host see [ChatClientStore's host property]{@link ChatClientStore#host}
	 */
	constructor(host) {

		/**
		 * The host of the chat server. Includes the hostname and port.
		 * For example https://mozilla.org:4000.
		 * // TODO(lukemurray): add the chat server url to the docs when we have the chat server
		 *
		 * See https://developer.mozilla.org/en-US/docs/Web/API/URL/host
		 * @type {string}
		 */
		this.host = host;

		/**
		 * The currently logged in account. If there is no logged in account this is undefined.
		 *
		 * @type {Account | undefined}
		 */
		this.account = undefined;

	}

}

export default ChatClientStore;