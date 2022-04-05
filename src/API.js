import ClientStore from "./ClientStore.js";

import AuthEndpoint from "./AuthEndpoint.js";
import AliasesEndpoint from "./AliasesEndpoint.js";
import MessagesEndpoint from "./MessagesEndpoint.js";
import PrivatePayloadsEndpoint from "./PrivatePayloadsEndpoint.js";
import FriendsEndpoint from "./FriendsEndpoint.js";

import Client from "./Client.js";

/**
 * The interface for interacting with the ChatServer API.
 */
class API {
  /**
   * API constructor.
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

    /**
     * Helper class for authorization routes.
     * @type {AuthEndpoint}
     */
    this.auth = new AuthEndpoint(this.store);

    /**
     * Helper class for alias routes.
     * @type {AliasesEndpoint}
     */
    this.aliases = new AliasesEndpoint(store);

    /**
     * Helper class for message routes.
     * @type {MessagesEndpoint}
     */
    this.messages = new MessagesEndpoint(store);

    /**
     * Helper class for private payload routes.
     * @type {PrivatePayloadsEndpoint}
     */
    this.privatePayloads = new PrivatePayloadsEndpoint(store);

    /**
     * Helper class for friends routes.
     * @type {FriendsEndpoint}
     */
    this.friends = new FriendsEndpoint(store);

    this.webSocket = new WebSocketEndpoint(store, client);
  }
}

/**
 * Helper class for communicating with web sockets on the chat server.
 */
class WebSocketEndpoint {
  /**
   * Private object mapping alias ids to open web sockets.
   * @type {Object.<number, WebSocket>}
   */
  #aliasNameToWebSocket;

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

    this.#aliasNameToWebSocket = {};
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
          messageEvent = "onNewMessage";
        }
        else if (data.type === "message_update") {
          messageEvent = "onUpdateMessage";
        }
        else if (data.type === "message_delete") {
          messageEvent = "onDeleteMessage";
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
          let e = new CustomEvent("onUnauthorizedAccess", {
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
    let res = await this.#getWebSocketForAlias(aliasName);
    return {
      message: "successfully opened web socket",
    };
  }
}



export default API;
