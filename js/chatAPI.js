import ChatClientStore from "./chatClientStore.js";
import {
  createRequestInitForPostRequest,
  createRequestInitForGetRequest,
  getErrorFromResponse,
  createRequestInitForPutRequest,
  createRequestInitForDeleteRequest,
} from "./util.js";
import { Account, Alias } from "./models.js";

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
    this.auth = new AuthEndpoint(this.store);

    /**
     * Helper class for aliases routes. Create, Get, Update, Delete, etc...
     * @type {AliasesEndpoint}
     */
    this.aliases = new AliasesEndpoint(store);

    this.messages = new MessagesEndpoint();
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
    let route = "signup";
    return fetch(
      `${this.store.host}/${route}`,
      createRequestInitForPostRequest({
        alias,
        email,
        password,
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
      createRequestInitForPostRequest({
        email,
        password,
      })
    )
      .then(getErrorFromResponse)
      .then((res) => res.json())
      .then((accountDTO) => {
        return new Account(
          accountDTO.id,
          accountDTO.email,
          new Date(accountDTO.createdAt),
          new Date(accountDTO.updatedAt)
        );
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
      createRequestInitForPostRequest()
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
      createRequestInitForGetRequest()
    )
      .then(getErrorFromResponse)
      .then((res) => res.json())
      .then((json) => {
        return {
          isLoggedIn: json.response,
          account: json.data
            ? new Account(
                json.data.id,
                json.data.email,
                new Date(json.data.createdAt),
                new Date(json.data.updatedAt)
              )
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
    let route = "aliases";
    return fetch(
      `${this.store.host}/${route}`,
      createRequestInitForGetRequest()
    )
      .then(getErrorFromResponse)
      .then((response) => response.json())
      .then((aliasesArray) => {
        return aliasesArray.map((aliasDTO) => {
          return new Alias(
            aliasDTO.id,
            aliasDTO.name,
            aliasDTO.createdAt,
            aliasDTO.updatedAt,
            aliasDTO.payload
          );
        });
      });
  }

  /**
   * Create a new alias associated with the currently logged in account
   * @param name {string} the name of the alias to create
   * @param payload {string | undefined} an optional payload to attach to the new alias
   * @returns {Promise<Alias>}
   */
  createNewAlias(name, payload = undefined) {
    let route = "aliases";
    return fetch(
      `${this.store.host}/${route}`,
      createRequestInitForPostRequest({
        name,
        payload,
      })
    )
      .then(getErrorFromResponse)
      .then((response) => response.json())
      .then((newAliasDTO) => {
        const aliasDTO = newAliasDTO.data;
        return new Alias(
          aliasDTO.id,
          aliasDTO.name,
          aliasDTO.createdAt,
          aliasDTO.updatedAt,
          aliasDTO.payload
        );
      });
  }

  /**
   * Get an existing alias by its name
   * @param aliasName {string} the name of the alias to get.
   * @returns {Promise<Alias>}
   */
  getAliasByName(aliasName) {
    let route = `aliases/${aliasName}`;
    return fetch(
      `${this.store.host}/${route}`,
      createRequestInitForGetRequest()
    )
      .then(getErrorFromResponse)
      .then((response) => response.json())
      .then((aliasDTO) => {
        return new Alias(
          aliasDTO.id,
          aliasDTO.name,
          aliasDTO.createdAt,
          aliasDTO.updatedAt,
          aliasDTO.payload
        );
      });
  }

  /**
   * Update an existing alias by its name
   * @param prevName {string} the name of the alias to update.
   * @param newName {string} the updated name of the alias. can be the old name.
   * @param newPayload {string | undefined} the updated payload of the alias. can be the old payload.
   * @returns {Promise<Alias>}
   */
  updateAliasByName(prevName, newName, newPayload = undefined) {
    let route = `aliases/${prevName}`;
    return fetch(
      `${this.store.host}/${route}`,
      createRequestInitForPutRequest({
        name: newName,
        payload: newPayload,
      })
    )
      .then(getErrorFromResponse)
      .then((response) => response.json())
      .then((updatedAliasDTO) => {
        const aliasDTO = updatedAliasDTO.data;
        return new Alias(
          aliasDTO.id,
          aliasDTO.name,
          aliasDTO.createdAt,
          aliasDTO.updatedAt,
          aliasDTO.payload
        );
      });
  }

  /**
   * Delete an existing alias by its name
   * @param aliasName {string} the name of the alias to delete.
   * @returns {Promise<void>}
   */
  deleteAliasByName(aliasName) {
    let route = `aliases/${aliasName}`;
    return fetch(
      `${this.store.host}/${route}`,
      createRequestInitForDeleteRequest()
    )
      .then(getErrorFromResponse)
      .then((response) => response.json());
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
