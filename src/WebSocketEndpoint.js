import ClientStore from "./ClientStore.js";
import Client from "./Client.js";

/**
 * Helper class for communicating with web sockets on the chat server.
 */
export default class WebSocketEndpoint {
	/**
	 * Private object mapping alias ids to open web sockets.
	 * @type {Object.<number, WebSocket>}
	 */
	#aliasNameToWebSocket = {};

	/**
	 * WebSocketEndpoint constructor.
	 *
	 * @param {ClientStore} store see [Client's store property]{@link Client#store}
	 * @param {Client} client see [Client]{@link Client}
	 */
	constructor(store, client) {
		/**
		 * See [Client's store property]{@link Client#store}
		 * @type {ClientStore}
		 */
		this.store = store;

		/**
		 * See [Client]{@link Client}
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
			let url = new URL(`/realtime?alias=${aliasName}`, this.store.host);
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
							aliasName,
						},
					});
					this.client.dispatchEvent(e);
				}

				if (data.type === "unauthorized") {
					let e = new CustomEvent("autherror", {
						detail: {
							message: data.message,
							aliasName
						},
					});
					this.client.dispatchEvent(e);
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