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

    /**
     * The currently logged in account. If there is no logged in account this is undefined.
     *
     * @type {Account | undefined}
     */
    this.account = undefined;
  }

  /**
   * Set the account on the ChatClientStore.
   * See [ChatClientStore's account property]{@link ChatClientStore#account}
   *
   * @param account {Account | undefined}
   */
  setAccount(account) {
    this.account = account;
  }
}

export default ChatClientStore;
