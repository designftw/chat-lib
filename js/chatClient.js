/**
 * The ChatClient is the interface for interacting with the ChatServer.
 */
class ChatClient {

	/**
	 * ChatClient constructor.
	 * @param {string} host see [ChatAPI's host property]{@link ChatAPI#host}
	 */
	constructor(host) {
		/**
		 * see [ChatAPI's host property]{@link ChatAPI#host}
		 * @type{string}
		 */
		this.host = host;
	}
}

export default ChatClient;