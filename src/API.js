import ClientStore from "./ClientStore.js";

import WebSocketEndpoint from "./WebSocketEndpoint.js";
import AuthEndpoint from "./AuthEndpoint.js";
import AliasesEndpoint from "./AliasesEndpoint.js";
import MessagesEndpoint from "./MessagesEndpoint.js";
import PrivatePayloadsEndpoint from "./PrivatePayloadsEndpoint.js";
import FriendsEndpoint from "./FriendsEndpoint.js";

import Client from "./Client.js";

/**
 * The interface for interacting with the ChatServer API.
 */
export default class API {
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