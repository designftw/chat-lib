import ChatClientStore from "./chatClientStore.js";
import ChatAPI from "./chatAPI.js";
import { Account, Alias, Message } from "./models.js";

/**
 * The ChatClient is the interface for interacting with the ChatServer.
 */
class ChatClient extends EventTarget {
  /**
   * ChatClient constructor.
   * @param {string} host see [ChatClientStore's host property]{@link ChatClientStore#host}
   */
  constructor(host) {
    super();
    /**
     * A reference to the [ChatClientStore]{@link ChatClientStore} which contains global state of the chat application.
     * @type {ChatClientStore}
     */
    this.store = new ChatClientStore(host);

    /**
     * A reference to the [ChatAPI]{@link ChatAPI}, a helper class for communicating with the Chat Server.
     * @type {ChatAPI}
     */
    this.api = new ChatAPI(this.store);
  }

  /**
   * Sign up for a new account with a single initial alias.
   * @param {string} alias The name of the initial alias if signup is successful.
   * @param {string} email The email address associated with the account.
   * @param {string} password The password associated with the account.
   * @returns {Promise<any>} A validation message
   */
  signup(alias, email, password) {
    return this.api.auth.signup(alias, email, password);
  }

  /**
   * Login to an existing account.
   * @param {string} email The email address associated with the account.
   * @param {string} password The password associated with the account.
   * @returns {Promise<Account>} Upon success returns the account which was logged in.
   */
  login(email, password) {
    return this.api.auth.login(email, password).then((res) => {
      this.dispatchEvent(new CustomEvent("login", { detail: res }));
      return res;
    });
  }

  /**
   * Logout of an existing account
   */
  logout() {
    this.dispatchEvent(new Event("logout"));
    return this.api.auth.logout();
  }

  /**
   * Check if the user is currently logged in
   */
  isLoggedIn() {
    return this.api.auth.isLoggedIn();
  }

  /**
   *
   * @param {string} aliasName
   * @returns {Promise<any>} a validation message
   */
  openWebSocketFor(aliasName) {
    return this.api.webSocket.openWebSocketFor(aliasName);
  }

  /**
   *
   * @param {string} alias
   * @param {string[]} [interlocutors]
   * @param {Date} [sinceTime]
   * @returns {Promise<Message[]>}
   */
  getMessagesForAlias(alias, interlocutors, sinceTime) {
    return this.api.messages.getMessagesForAlias(
      alias,
      interlocutors,
      sinceTime
    );
  }

  /**
   *
   * @param {string} alias
   * @param {string[]} recipientNames
   * @param {string} payload
   * @returns {Promise<Message>}
   */
  sendMessage(alias, recipientNames, payload) {
    return this.api.messages.sendMessage(alias, recipientNames, payload);
  }

  /**
   *
   * @param {string} alias
   * @param {Message} message
   * @param {string} payload
   * @returns {Promise<Message>}
   */
  editMessage(alias, message, payload) {
    return this.api.messages.updateMessage(alias, message.id, payload);
  }

  /**
   *
   * @param {string} alias
   * @param {Message} message
   * @returns {Promise<any>}
   */
  deleteMessage(alias, message) {
    return this.api.messages.deleteMessage(alias, message.id);
  }

  /**
   * @returns {Promise<Alias[]>}
   */
  getAliasesForAccount() {
    return this.api.aliases.getAliasesForAccount().then(async (aliases) => {
      for (let alias of aliases) {
        await this.api.webSocket.openWebSocketFor(alias);
      }

      return aliases;
    });
  }

  /**
   *
   * @param {string} name
   * @param {string} payload
   * @returns {Promise<Alias>}
   */
  createAlias(name, payload) {
    return this.api.aliases.createAlias(name, payload);
  }

  /**
   *
   * @param {Alias} alias
   * @param {string} [name]
   * @param {string} [payload]
   * @returns {Promise<Alias>}
   */
  updateAlias(alias, name, payload) {
    return this.api.aliases.updateAlias(alias, name, payload);
  }

  /**
   *
   * @param {Alias} alias
   * @returns {Promise<any>}
   */
  deleteAlias(alias) {
    return this.api.aliases.deleteAlias(alias);
  }
}

export default ChatClient;
