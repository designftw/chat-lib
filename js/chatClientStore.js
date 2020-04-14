import { Account } from "./models.js";

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
     *
     * See https://developer.mozilla.org/en-US/docs/Web/API/URL/host
     * @type {string}
     */
    this.host = host;

    // TODO(lukemurray): RESOLVE THIS
    this.webSocketHost = "wss://128.52.128.220:3000";

    /**
     * The currently logged in account. If there is no logged in account this is undefined.
     *
     * @type {Account | undefined}
     */
    this.account = undefined;

    /**
     * Whether or not the client is currently logged in
     */
    this.loggedIn = false;
  }

  /**
   * Set the account on the ChatClientStore.
   * See [ChatClientStore's account property]{@link ChatClientStore#account}
   *
   * @param {Account | undefined} account
   */
  setAccount(account) {
    this.account = account;
  }

  /**
   * Set the account on the ChatClientStore.
   * See [ChatClientStore's account property]{@link ChatClientStore#account}
   *
   * @param {boolean} loggedIn
   */
  setLoggedIn(loggedIn) {
    this.loggedIn = loggedIn;
  }
}

export default ChatClientStore;
