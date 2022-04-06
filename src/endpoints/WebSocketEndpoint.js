/**
 * Helper class for communicating with web sockets on the chat server.
 */
export default class WebSocketEndpoint extends EventTarget {
	/**
	 * Private object mapping alias ids to open web sockets.
	 * @type {Object.<number, WebSocket>}
	 */
	#aliasNameToWebSocket = {};

	/**
	 * WebSocketEndpoint constructor.
	 *
	 * @param {Client} client The client using this endpoint
	 */
	constructor(client) {
		super();

		/**
		 * @type {Client}
		 */
		this.client = client;
	}

	/**
	 * Returns an open web socket which can be used to send and receive messages.
	 * @param {string} aliasName the alias to get the web socket for.
	 * @returns {Promise<WebSocket>}
	 */
	#getWebSocketForAlias(aliasName) {
		// if the socket exists return it
		if (this.#aliasNameToWebSocket.hasOwnProperty(aliasName)) {
			return Promise.resolve(this.#aliasNameToWebSocket[aliasName]);
		}

		return new Promise((resolve, reject) => {
			let url = new URL(`/realtime?alias=${aliasName}`, this.client.host);
			url.protocol = "wss:";

			let socket = new WebSocket(url);

			// handle the open event
			socket.addEventListener("open", () => {
				this.#aliasNameToWebSocket[aliasName] = socket;
				resolve(socket);
			}, { once: true });

			// handle the error event
			socket.addEventListener("error", reject, { once: true });

			socket.addEventListener("close", evt => {
				delete this.#aliasNameToWebSocket[aliasName];
			}, { once: true });

			socket.addEventListener("message", evt => {
				const data = JSON.parse(evt.data);
				let messageEvent;

				if (data.type === "new_message") {
					messageEvent = "message";
				}
				else if (data.type === "message_update") {
					messageEvent = "messageupdate";
				}
				else if (data.type === "message_delete") {
					messageEvent = "messagedelete";
				}

				if (messageEvent) {
					let e = new CustomEvent(messageEvent, {
						detail: {
							messageId: data.messageId,
							alias,
						},
					});
					this.dispatchEvent(e);
				}

				if (data.type === "unauthorized") {
					let e = new CustomEvent("autherror", {
						detail: {
							message: data.message,
							alias
						},
					});
					this.dispatchEvent(e);
				}
			});
		});
	}

	/**
	 *
	 * @param {string} aliasName an alias to open a web socket for
	 */
	async openWebSocketFor(aliasName) {
		await this.#getWebSocketForAlias(aliasName);

		return {
			message: "successfully opened web socket",
		};
	}
}