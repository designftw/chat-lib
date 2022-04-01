import ClientStore from "./ClientStore.js";
import { Account, Alias, Message, PrivatePayload } from "./models.js";
import {
  createAccountFromAccountDTO,
  createAliasFromAliasDTO,
  createMessageFromMessageDTO,
  createPrivatePayloadFromPayloadDTO,
  getErrorFromResponse,
  createDefaultRequestInit,
} from "./util.js";
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

    /**
     * Private object mapping alias ids to open web sockets.
     * @type {Object.<number, WebSocket>}
     */
    this._aliasNameToWebSocket = {};
  }

  /**
   * Returns an open web socket which can be used to send and receive messages.
   * @param {string} aliasName the alias to get the web socket for.
   * @returns {Promise<WebSocket>}
   */
  _getWebSocketForAlias(aliasName) {
    // if the socket exists return it
    if (this._aliasNameToWebSocket.hasOwnProperty(aliasName)) {
      return Promise.resolve(this._aliasNameToWebSocket[aliasName]);
    }
    return new Promise((resolve, reject) => {
      let socket = new WebSocket(
        `${this.store.host.replace(
          "https://",
          "wss://"
        )}/realtime?alias=${aliasName}`
      );
      // handle the open event
      socket.addEventListener(
        "open",
        () => {
          this._aliasNameToWebSocket[aliasName] = socket;
          resolve(socket);
        },
        { once: true }
      );
      // handle the error event
      socket.addEventListener(
        "error",
        (err) => {
          reject(err);
        },
        { once: true }
      );
      socket.addEventListener(
        "close",
        () => {
          delete this._aliasNameToWebSocket[aliasName];
        },
        { once: true }
      );
      socket.addEventListener("message", (e) => {
        const data = JSON.parse(e.data);
        if (data.type === "new_message") {
          this.client.dispatchEvent(
            new CustomEvent("onNewMessage", {
              detail: {
                messageId: data.messageId,
                aliasName,
              },
            })
          );
        }
        if (data.type === "message_update") {
          this.client.dispatchEvent(
            new CustomEvent("onUpdateMessage", {
              detail: {
                messageId: data.messageId,
                aliasName,
              },
            })
          );
        }
        if (data.type === "message_delete") {
          this.client.dispatchEvent(
            new CustomEvent("onDeleteMessage", {
              detail: {
                messageId: data.messageId,
                aliasName,
              },
            })
          );
        }
        if (data.type === "unauthorized") {
          new CustomEvent("onUnauthorizedAccess", {
            detail: { message: data.message, aliasName },
          });
        }
      });
    });
  }

  /**
   *
   * @param {string} aliasName an alias to open a web socket for
   */
  openWebSocketFor(aliasName) {
    return this._getWebSocketForAlias(aliasName).then((res) => ({
      message: "successfully opened web socket",
    }));
  }
}

/**
 * Helper class for authentication routes.
 */
class AuthEndpoint {
  /**
   * AuthEndpoint constructor.
   *
   * @param {ClientStore} store see [Client's store property]{@link Client#store}
   */
  constructor(store) {
    /**
     * See [Client's store property]{@link Client#store}
     * @type {ClientStore}
     */
    this.store = store;
  }

  /**
   * Sign up for a new account with a single initial alias.
   * @param {string} alias The name of the initial alias if signup is successful.
   * @param {string} email The email address associated with the account.
   * @param {string} password The password associated with the account.
   * @returns {Promise<any>} A success message upon successful login
   */
  signup(alias, email, password) {
    let route = "signup";
    return fetch(
      `${this.store.host}/${route}`,
      createDefaultRequestInit({
        method: "POST",
        body: { alias, email, password },
      })
    )
      .then(getErrorFromResponse)
      .then((res) => res.json());
  }

  /**
   * Login to an existing account.
   * @param {string} email The email address associated with the account.
   * @param {string} password The password associated with the account.
   * @returns {Promise<Account>} Upon success returns the account which was logged in.
   */
  login(email, password) {
    let route = "login";
    return fetch(
      `${this.store.host}/${route}`,
      createDefaultRequestInit({
        method: "POST",
        body: { email, password },
      })
    )
      .then(getErrorFromResponse)
      .then((res) => res.json())
      .then((accountDTO) => {
        return createAccountFromAccountDTO(accountDTO);
      });
  }

  /**
   * Logout of the currently logged in account
   * @returns {Promise<void>} Upon success returns nothing.
   */
  logout() {
    let route = "logout";
    return fetch(
      `${this.store.host}/${route}`,
      createDefaultRequestInit({ method: "POST" })
    )
      .then(getErrorFromResponse)
      .then((res) => {
        return;
      });
  }

  /**
   * Check if the client is currently logged in
   * @returns {Promise<{isLoggedIn: boolean, account: Account | undefined}>} an
   * object with two keys isLoggedIn and account. If isLoggedIn is true then
   * account contains has the currently logged in account. If isLoggedIn is
   * false then account is undefined.
   */
  isLoggedIn() {
    let route = "isloggedin";
    return fetch(
      `${this.store.host}/${route}`,
      createDefaultRequestInit({ method: "GET" })
    )
      .then(getErrorFromResponse)
      .then((res) => res.json())
      .then((json) => {
        return {
          isLoggedIn: json.response,
          account: json.data
            ? createAccountFromAccountDTO(json.data)
            : undefined,
        };
      });
  }
}

/**
 * The aliases endpoint of the chat server.
 */
class AliasesEndpoint {
  /**
   * AliasesEndpoint constructor.
   *
   * @param {ClientStore} store see [Client's store property]{@link Client#store}
   */
  constructor(store) {
    /**
     * See [Client's store property]{@link Client#store}
     * @type {ClientStore}
     */
    this.store = store;
  }

  /**
   * Get all the aliases associated with the currently logged in account.
   * @returns {Promise<Alias[]>} the aliases associated with the currently logged in account
   */
  getAliasesForAccount() {
    let route = "aliases";
    return fetch(
      `${this.store.host}/${route}`,
      createDefaultRequestInit({ method: "GET" })
    )
      .then(getErrorFromResponse)
      .then((response) => response.json())
      .then((aliasesArray) => {
        return aliasesArray.map((aliasDTO) => {
          return createAliasFromAliasDTO(aliasDTO);
        });
      });
  }

  /**
   * Create a new alias associated with the currently logged in account.
   *
   * Raises an error if the alias already exists.
   * @param {string} name the name of the alias to create
   * @param {string } payload payload to attach to the new alias
   * @returns {Promise<Alias>}
   */
  createAlias(name, payload) {
    let route = "aliases";
    return fetch(
      `${this.store.host}/${route}`,

      createDefaultRequestInit({
        method: "POST",
        body: {
          name,
          payload,
        },
      })
    )
      .then(getErrorFromResponse)
      .then((response) => response.json())
      .then((newAliasDTO) => {
        const aliasDTO = newAliasDTO.data;
        return createAliasFromAliasDTO(aliasDTO);
      });
  }

  /**
   * Get an existing alias by its name.
   *
   * Raises an error if the alias does not exist.
   * @param {string} aliasName the name of the alias to get.
   * @returns {Promise<Alias>}
   */
  getAlias(aliasName) {
    let route = `aliases/${aliasName}`;
    return fetch(
      `${this.store.host}/${route}`,
      createDefaultRequestInit({ method: "GET" })
    )
      .then(getErrorFromResponse)
      .then((response) => response.json())
      .then((aliasDTO) => {
        return createAliasFromAliasDTO(aliasDTO);
      });
  }

  /**
   * Update an existing alias by its name.
   *
   * Raises an error if the alias does not exist or belong to the currently logged in account.
   * @param {Alias} alias the alias to update.
   * @param {string} [newName] optional updated name of the alias. if not included alias retains the same name.
   * @param {string} [newPayload] optional updated payload of the alias. if not included alias retains the same payload.
   * @returns {Promise<Alias>}
   */
  updateAlias(alias, newName, newPayload) {
    let route = `aliases/${alias.name}`;
    if (newName === undefined) {
      newName = alias.name;
    }
    if (newPayload === undefined) {
      newPayload = alias.payload;
    }
    return fetch(
      `${this.store.host}/${route}`,

      createDefaultRequestInit({
        method: "PUT",
        body: { name: newName, payload: newPayload },
      })
    )
      .then(getErrorFromResponse)
      .then((response) => response.json())
      .then((updatedAliasDTO) => {
        const aliasDTO = updatedAliasDTO.data;
        return createAliasFromAliasDTO(aliasDTO);
      });
  }

  /**
   * Delete an existing alias by its name
   *
   * Raises an error if the alias does not exist or belong to the currently logged in account.
   * @param {string} aliasName the alias to delete.
   * @returns {Promise<any>} a validation message.
   */
  deleteAlias(aliasName) {
    let route = `aliases/${aliasName}`;
    return fetch(
      `${this.store.host}/${route}`,
      createDefaultRequestInit({ method: "DELETE" })
    )
      .then(getErrorFromResponse)
      .then((response) => response.json());
  }
}

/**
 * The messages endpoint of the chat server.
 */
class MessagesEndpoint {
  /**
   * AliasesEndpoint constructor.
   *
   * @param {ClientStore} store see [Client's store property]{@link Client#store}
   */
  constructor(store) {
    /**
     * See [Client's store property]{@link Client#store}
     * @type {ClientStore}
     */
    this.store = store;
  }

  /**
   * Get all the messages sent or received by the alias and the passed in interlocutors.
   *
   * If no interlocutors are passed in, returns all the messages sent or received by the alias.
   *
   * If for example the passed in interlocutors contains the id for the alias Sally, and the passed
   * in alias is Jack, then this method returns all messages sent by Jack to Sally, or by Sally to Jack.
   * If there are multiple interlocutors this method returns all messages sent by Jack to any of the
   * interlocutors, or by any of the interlocutors to Jack. Note this does not mean that the message
   * has to be sent to all of the interlocutors to be here. Any pair suffices.
   * @param {string} ownAlias an alias associated with the currently logged in account
   * @param {string[] | undefined} interlocutors An optional list of aliases which are either the sender or receiver of the returned messages..
   * @param {Date | undefined} sinceTime An optional date which filters messages to those which were sent after this time.
   * @returns {Promise<Message[]>} The messages which pass the filters.
   */
  getMessagesForAlias(
    ownAlias,
    interlocutors = undefined,
    sinceTime = undefined
  ) {
    let route = `messages`;
    // create the headers for the message get request
    let headers = {
      "user-alias-name": ownAlias,
    };
    if (interlocutors !== undefined) {
      headers = { ...headers, interlocutors: JSON.stringify(interlocutors) };
    }
    if (sinceTime !== undefined) {
      headers = { ...headers, "since-time": sinceTime.getTime() };
    }
    return fetch(
      `${this.store.host}/${route}`,
      createDefaultRequestInit({ method: "GET", headers: headers })
    )
      .then(getErrorFromResponse)
      .then((response) => response.json())
      .then((messagesDTO) => {
        return messagesDTO.map((messageDTO) =>
          createMessageFromMessageDTO(messageDTO)
        );
      });
  }

  /**
   * Send a new message from ownAlias to recipients. The payload is a potentially jsonified string.
   * @param {string} ownAlias an alias associated with the currently logged in account.
   * @param {string[]} recipientNames the recipients of the message
   * @param {string} messagePayload the payload of the message
   * @returns {Promise<Message>} The sent message.
   */
  sendMessage(ownAlias, recipientNames, messagePayload) {
    let route = `messages`;
    let headers = {
      "user-alias-name": ownAlias,
    };
    const body = {
      payload: messagePayload,
      recipients: recipientNames,
    };
    return fetch(
      `${this.store.host}/${route}`,
      createDefaultRequestInit({
        method: "POST",
        body,
        headers,
      })
    )
      .then(getErrorFromResponse)
      .then((response) => response.json())
      .then((responseDTO) => {
        const messageDTO = responseDTO.data;
        return this.getMessage(ownAlias, messageDTO.id);
      });
  }

  /**
   * Get a single message by it's id.
   * @param {string} ownAlias the alias associated with the message id, either the sender or recipient.
   * @param {string} messageId The Message Id. see [Message's id property]{@link Message#id}
   * @returns {Promise<Message>} The message associated with the passed in id.
   */
  getMessage(ownAlias, messageId) {
    let route = `messages/${messageId}`;
    // create the headers for the message get request
    let headers = {
      "user-alias-name": ownAlias,
    };
    return fetch(
      `${this.store.host}/${route}`,
      createDefaultRequestInit({ method: "GET", headers: headers })
    )
      .then(getErrorFromResponse)
      .then((response) => response.json())
      .then((messageDTO) => createMessageFromMessageDTO(messageDTO));
  }

  /**
   * Update a single message by it's id.
   * @param {string} ownAlias the alias associated with the message id. Must be the sender of the message.
   * @param {string} messageId The Message Id. see [Message's id property]{@link Message#id}
   * @param {string} payload The new payload to be associated with the message. See [Message's payload property]{@link Message#payload}
   * @returns {Promise<Message>} The updated message
   */
  updateMessage(ownAlias, messageId, payload) {
    let route = `messages/${messageId}`;
    // create the headers for the message get request
    let headers = {
      "user-alias-name": ownAlias,
    };
    const body = { payload };
    return fetch(
      `${this.store.host}/${route}`,
      createDefaultRequestInit({
        method: "PUT",
        body,
        headers,
      })
    )
      .then(getErrorFromResponse)
      .then((response) => response.json())
      .then((resultDTO) => {
        const messageDTO = resultDTO.data;
        return this.getMessage(ownAlias, messageDTO.id);
      });
  }

  /**
   * Delete a single message by it's id.
   * @param {string} ownAlias the alias associated with the message id, either the sender or recipient.
   * @param {string} messageId The Message Id. see [Message's id property]{@link Message#id}
   * @returns {Promise<any>} A validation message.
   */
  deleteMessage(ownAlias, messageId) {
    let route = `messages/${messageId}`;
    // create the headers for the message get request
    let headers = {
      "user-alias-name": ownAlias,
    };
    return fetch(
      `${this.store.host}/${route}`,
      createDefaultRequestInit({
        method: "DELETE",
        headers,
      })
    )
      .then(getErrorFromResponse)
      .then((response) => response.json());
  }
}

/**
 * The Private Payload endpoint of the chat server
 */
class PrivatePayloadsEndpoint {
  /**
   * PrivatePayloadEndpoint constructor.
   *
   * @param {ClientStore} store see [Client's store property]{@link Client#store}
   */
  constructor(store) {
    /**
     * See [Client's store property]{@link Client#store}
     * @type {ClientStore}
     */
    this.store = store;
  }

  /**
   * Create a new private payload.
   * @param {string} ownAlias the alias associated with the private payload.
   * @param {string} entityId the [id]{@link BaseModel#id} of the entity the payload is attached to.
   * @param {string} payload the payload, private to the passed in alias, to be attached to the passed in model.
   * @returns {Promise<PrivatePayload>} the newly created private payload.
   */
  createPayload(ownAlias, entityId, payload) {
    let route = `payloads`;
    let headers = {
      "user-alias-name": ownAlias,
    };
    const body = { payload, entity_id: entityId };
    return fetch(
      `${this.store.host}/${route}`,
      createDefaultRequestInit({
        method: "POST",
        body,
        headers,
      })
    )
      .then(getErrorFromResponse)
      .then((response) => response.json())
      .then((resultDTO) => {
        const payloadDTO = resultDTO.data;
        return createPrivatePayloadFromPayloadDTO(payloadDTO);
      });
  }

  /**
   * Get the payload associated with the passed in alias and entity.
   * @param {string} ownAlias the alias associated with the private payload.
   * @param {string} entityId the [id]{@link BaseModel#id} of the entity the returned payload is attached to.
   * @returns {Promise<PrivatePayload>} the requested PrivatePayload model.
   */
  getPayload(ownAlias, entityId) {
    let route = `payloads/${entityId}`;
    let headers = {
      "user-alias-name": ownAlias,
    };
    return fetch(
      `${this.store.host}/${route}`,
      createDefaultRequestInit({ method: "GET", headers: headers })
    )
      .then(getErrorFromResponse)
      .then((response) => response.json())
      .then((payloadDTO) => {
        return createPrivatePayloadFromPayloadDTO(payloadDTO);
      });
  }

  /**
   * Update the payload associated with the passed in alias and entity.
   * @param {string} ownAlias the alias associated with the private payload.
   * @param {string} entityId the [id]{@link BaseModel#id} of the entity the payload to update is attached to.
   * @param {string} newPayload the new payload to attach to the alias and model
   * @returns {Promise<PrivatePayload>} the updated private payload model.
   */
  updatePayload(ownAlias, entityId, newPayload) {
    let route = `payloads/${entityId}`;
    let headers = {
      "user-alias-name": ownAlias,
    };
    const body = { payload: newPayload };
    return fetch(
      `${this.store.host}/${route}`,
      createDefaultRequestInit({
        method: "PUT",
        body,
        headers,
      })
    )
      .then(getErrorFromResponse)
      .then((response) => response.json())
      .then((resultDTO) => {
        const payloadDTO = resultDTO.data;
        return createPrivatePayloadFromPayloadDTO(payloadDTO);
      });
  }

  /**
   * Delete the payload associated with the passed in alias and entity.
   * @param {string} ownAlias the alias associated with the private payload.
   * @param {string} entityId the [id]{@link BaseModel#id} of the entity the payload to delete is attached to.
   * @returns {Promise<any>} a validation message.
   */
  deletePayload(ownAlias, entityId) {
    let route = `payloads/${entityId}`;
    let headers = {
      "user-alias-name": ownAlias,
    };
    return fetch(
      `${this.store.host}/${route}`,
      createDefaultRequestInit({ method: "DELETE", headers })
    )
      .then(getErrorFromResponse)
      .then((response) => response.json());
  }
}

/**
 * The Friends endpoint of the chat server
 */
class FriendsEndpoint {
  /**
   * FriendsEndpoint constructor.
   *
   * @param {ClientStore} store see [Client's store property]{@link Client#store}
   */
  constructor(store) {
    /**
     * See [Client's store property]{@link Client#store}
     * @type {ClientStore}
     */
    this.store = store;
  }

  /**
   * Get all the friends of the passed in alias.
   * @param {string} ownAlias the alias whose friends will be retrieved.
   * @returns {Promise<Alias[]>} an array of aliases which are friends with the passed in alias
   */
  getFriendsForAlias(ownAlias) {
    let route = `friends`;
    let headers = {
      "user-alias-name": ownAlias,
    };
    return fetch(
      `${this.store.host}/${route}`,
      createDefaultRequestInit({ method: "GET", headers: headers })
    )
      .then(getErrorFromResponse)
      .then((response) => response.json())
      .then((friendsListDTO) =>
        friendsListDTO.map((aliasDTO) => createAliasFromAliasDTO(aliasDTO))
      );
  }

  /**
   * Add a new friend to the friend list of ownAlias.
   * @param {string} ownAlias the alias adding a friend.
   * @param {string} newFriend the new friend of the ownAlias.
   * @returns {Promise<any>} a validation message.
   */
  addFriend(ownAlias, newFriend) {
    let route = `friends`;
    let headers = {
      "user-alias-name": ownAlias,
    };
    const body = {
      alias_name: newFriend,
    };
    return fetch(
      `${this.store.host}/${route}`,
      createDefaultRequestInit({
        method: "POST",
        body,
        headers,
      })
    )
      .then(getErrorFromResponse)
      .then((response) => response.json());
  }

  /**
   * Remove a friend from the friend list of ownAlias.
   * @param {string} ownAlias the alias removing a friend.
   * @param {string} friendToRemove the friend to remove from ownAlias's friend list.
   * @returns {Promise<any>} a validation message.
   */
  removeFriend(ownAlias, friendToRemove) {
    let route = `friends`;
    let headers = {
      "user-alias-name": ownAlias,
    };
    const body = {
      alias_name: friendToRemove,
    };
    return fetch(
      `${this.store.host}/${route}`,
      createDefaultRequestInit({
        method: "DELETE",
        body,
        headers,
      })
    )
      .then(getErrorFromResponse)
      .then((response) => response.json());
  }
}

export default API;
