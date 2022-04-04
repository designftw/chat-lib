/**
 * The store is an object passed by reference which is used to access global state
 * of the chat application.
 */
export default class ClientStore extends EventTarget {
  /**
   * ClientStore constructor.
   * @param {string} host see [ClientStore's host property]{@link ClientStore#host}
   */
  constructor(host) {
    super();
    /**
     * The host of the chat server. Includes the hostname and port.
     * For example https://mozilla.org:4000.
     *
     * See https://developer.mozilla.org/en-US/docs/Web/API/URL/host
     * @type {string}
     */
    this.host = host;
  }
}
