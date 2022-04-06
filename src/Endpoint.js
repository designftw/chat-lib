import { request } from "./util.js";

/**
 * Abstract base class for all endpoints.
 */

export default class Endpoint {
	/**
	 * @param {Client} client The client using this endpoint
	 */
	constructor(client) {
		/**
		 * @type {Client}
		 */
		this.client = client;
	}

	request(route, options = {}) {
		return request(`${this.client.host}/${route}`, options);
	}
}