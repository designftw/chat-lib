import ClientStore from "./ClientStore.js";
import API from "./API.js";
import { Account, Alias, Message } from "./models.js";

/**
 * onUnauthorizedAccess: detail is {message, aliasName}
 */

/**
 * Object passed to details on CustomEvents about messages fired by the Client.
 * @typedef {object} messageEventDetails
 * @property {string} messageId the id of the message the event is referring to
 * @property {string} aliasName the alias the event is associated with.
 */

/**
 * Delete Message Event
 * @event onDeleteMessage
 * @type {CustomEvent}
 * @property {messageEventDetails} detail the detail contains a messageEventDetails with the id and alias name of the message which was deleted.
 */

/**
 * Update Message Event
 * @event onUpdateMessage
 * @type {CustomEvent}
 * @property {messageEventDetails} detail the detail contains a messageEventDetails with the id and alias name of the message which was updated.
 */

/**
 * New Message Event
 * @event onNewMessage
 * @type {CustomEvent}
 * @property {messageEventDetails} detail the detail contains a messageEventDetails with the id and alias name of the message which was created.
 */

/**
 * The Client is the interface for interacting with the ChatServer.
 * @fires onDeleteMessage
 * @fires onUpdateMessage
 * @fires onNewMessage
 */
class Client extends EventTarget {
  /**
   * Client constructor.
   * @param {string} host see [ClientStore's host property]{@link ClientStore#host}
   */
  constructor(host) {
    super();
    /**
     * A reference to the [ClientStore]{@link ClientStore} which contains global state of the chat application.
     * @type {ClientStore}
     */
    this.store = new ClientStore(host);

    /**
     * A reference to the [API]{@link API}, a helper class for communicating with the Chat Server.
     * @type {API}
     */
    this.api = new API(this.store, this);
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
   * Get all the messages for the passed in alias
   *
   * Note the currently logged in account must own the alias associated with the aliasName.
   * @param {string} aliasName the name of the alias to get messages for.
   * @param {string[]} [interlocutors] an optional list of the senders and recipients of the messages.
   * @param {Date} [sinceTime] an optional date to limit the request by. only receive messages since this date.
   * @returns {Promise<Message[]>} a list of messages which pass the filters.
   */
  getMessagesForAlias(aliasName, interlocutors, sinceTime) {
    return this.api.messages.getMessagesForAlias(
      aliasName,
      interlocutors,
      sinceTime
    );
  }

  /**
   * Get a message which has the passed in messageId, and was sent or received by the passed in aliasName.
   *
   * Note the currently logged in account must own the alias associated with the aliasName.
   * @param {string} aliasName the name of the alias which sent or received the message.
   * @param {string} messageId the id of the message to get.
   * @returns {Promise<Message>} The model of the message with the associated id.
   */
  getMessageById(aliasName, messageId) {
    return this.api.messages.getMessage(aliasName, messageId);
  }

  /**
   * Send a message from the passed in alias to the passed in recipients with the passed in payload.
   *
   * Note the currently logged in account must own the alias associated with the aliasName.
   * @param {string} aliasName the name of the alias which will send the message.
   * @param {string[]} recipientNames a list of recipients of the message.
   * @param {string} payload the payload associated with the message.
   * @returns {Promise<Message>} The model of the sent message.
   */
  sendMessage(aliasName, recipientNames, payload) {
    return this.api.messages.sendMessage(aliasName, recipientNames, payload);
  }

  /**
   * Update a message with the passed in messageId which was sent by the passed in aliasName.
   * @param {string} aliasName the name of the alias which sent the message.
   * @param {string} messageId the id associated with the message.
   * @param {string} payload the new payload for the message.
   * @returns {Promise<Message>} The model of the updated message.
   */
  updateMessage(aliasName, messageId, payload) {
    return this.api.messages.updateMessage(aliasName, messageId, payload);
  }

  /**
   * Delete a message with the passed in messageId which was sent by the passed in aliasName.
   * @param {string} aliasName the name of the alias which sent the message.
   * @param {string} messageId the id associated with the message.
   * @returns {Promise<any>} a validation message.
   */
  deleteMessage(aliasName, messageId) {
    return this.api.messages.deleteMessage(aliasName, messageId);
  }

  /**
   * Get all the aliases for the currently logged in account.
   * @returns {Promise<Alias[]>} An array of Alias models.
   */
  getAliasesForAccount() {
    return this.api.aliases.getAliasesForAccount().then(async (aliases) => {
      for (let alias of aliases) {
        await this.api.webSocket.openWebSocketFor(alias.name);
      }

      return aliases;
    });
  }

  /**
   * Create a new alias with the passed in aliasName and payload.
   * @param {string} aliasName the name of the new alias
   * @param {string} payload the payload on the new alias.
   * @returns {Promise<Alias>} The Alias model of the newly created alias.
   */
  createAlias(aliasName, payload) {
    return this.api.aliases.createAlias(aliasName, payload);
  }

  /**
   * Update an existing alias.
   * @param {Alias} alias the model of the alias to update
   * @param {string} [name] the optional new name for the alias
   * @param {string} [payload] the optional new payload for the alias
   * @returns {Promise<Alias>} The Alias model of the newly updated alias.
   */
  updateAlias(alias, name, payload) {
    return this.api.aliases.updateAlias(alias, name, payload);
  }

  /**
   * Delete the alias associated with the passed in alias name.
   * @param {string} aliasName the name of the alias to delete.
   * @returns {Promise<any>} A validation message.
   */
  deleteAlias(aliasName) {
    return this.api.aliases.deleteAlias(aliasName);
  }
}

export default Client;
