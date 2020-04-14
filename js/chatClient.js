import ChatClientStore from "./chatClientStore.js";
import ChatAPI from "./chatAPI.js";
import { Account, Alias, Message } from "./models.js";

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
   * @returns {Promise<Account>} Upon success returns the account which was logged in.
   */
  signup(alias, email, password) {
    return this.api.auth.signup(alias, email, password).then(() => {
      // on successful signup login
      return this.login(email, password);
    });
  }

  /**
   * Login to an existing account.
   * @param {string} email The email address associated with the account.
   * @param {string} password The password associated with the account.
   * @returns {Promise<Account>} Upon success returns the account which was logged in.
   */
  login(email, password) {
    return this.api.auth.login(email, password).then((account) => {
      this.store.loggedIn = true;
      this.store.account = account;
      return account;
    });
  }

  /**
   * Logout of an existing account
   */
  logout() {
    return this.api.auth.logout().then((res) => {
      this.store.loggedIn = false;
      this.store.account = undefined;
      return res;
    });
  }

  /**
   * Check if the user is currently logged in
   */
  isLoggedIn() {
    return this.api.auth.isLoggedIn().then((result) => {
      if (result.isLoggedIn) {
        this.store.account = result.account;
      } else {
        this.store.account = undefined;
      }
      this.store.loggedIn = result.isLoggedIn;
      return result.isLoggedIn;
    });
  }

  /**
   *
   * @param {Alias} alias
   * @param {Alias[]} [interlocutors]
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
   * @param {Alias} alias
   * @param {Alias[]} recipients
   * @param {string} payload
   * @returns {Promise<Message>}
   */
  sendMessage(alias, recipients, payload) {
    return this.api.messages.sendMessage(alias, recipients, payload);
  }

  /**
   *
   * @param {Alias} alias
   * @param {Message} message
   * @param {string} payload
   * @returns {Promise<Message>}
   */
  editMessage(alias, message, payload) {
    return this.api.messages.updateMessage(alias, message.id, payload);
  }

  /**
   *
   * @param {Alias} alias
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
    return this.api.aliases.getAliasesForAccount();
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
