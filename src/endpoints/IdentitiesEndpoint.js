import Endpoint from "./Endpoint.js";
import Identity from "../models/Identity.js";

/**
 * The aliases endpoint of the chat server.
 * @ignore
 */
 export default class IdentitiesEndpoint extends Endpoint {
	/**
	 * AliasesEndpoint constructor.
	 * @param {Client} client see [Endpoint's client property]{@link Endpoint#client}
	 */
	constructor(client) {
		super(client);
	}

	/**
	 * Get all the aliases associated with the currently logged in account.
	 * @returns {Promise<Identity[]>} the aliases associated with the currently logged in account
	 * @ignore
	 */
	async getAliasesForAccount() {
		let aliasesArray = await this.request("aliases");

		return aliasesArray.map(aliasDTO => new Identity({...aliasDTO, data: aliasDTO.payload}));
	}

	/**
	 * Create a new alias associated with the currently logged in account.
	 *
	 * Raises an error if the alias already exists.
	 * @param {string} name the name of the alias to create
	 * @param {Object} data payload to attach to the new alias
	 * @returns {Promise<Identity>}
	 * @ignore
	 */
	async createAlias(name, data) {
		let newAliasDTO = await this.request("aliases", {
				method: "POST",
				body: {
					name,
					payload: JSON.stringify(data),
				},
			});

		const aliasDTO = newAliasDTO.data;
		return new Identity({...aliasDTO, data: aliasDTO.payload});
	}

	/**
	 * Get an existing alias by its name.
	 *
	 * Raises an error if the alias does not exist.
	 * @param {string} aliasName the name of the alias to get.
	 * @returns {Promise<Identity>}
	 * @ignore
	 */
	async getAlias(aliasName) {
		let json = await this.request(`aliases/${aliasName}`);

		return new Identity({...json, data: json.payload});
	}

	/**
	 * Update an existing alias by its name.
	 *
	 * Raises an error if the alias does not exist or belong to the currently logged in account.
	 * @param {string} aliasName the alias to update.
	 * @param {Object} updates
	 * @param {string} [updates.newName] optional updated name of the alias. if not included alias retains the same name.
	 * @param {Object} [updates.newData] optional updated payload of the alias. if not included alias retains the same payload.
	 * @returns {Promise<Identity>}
	 * @ignore
	 */
	async updateAlias(aliasName, {newName, newData}) {
		let updatedAliasDTO = await this.request(`aliases/${aliasName}`, {
			method: "PUT",
			body: { name: newName, payload: JSON.stringify(newData) },
		});

		return new Identity({...updatedAliasDTO.data, data: updatedAliasDTO.data.payload});
	}

	/**
	 * Delete an existing alias by its name
	 *
	 * Raises an error if the alias does not exist or belong to the currently logged in account.
	 * @param {string} aliasName the alias to delete.
	 * @returns {Promise<any>} a validation message.
	 * @ignore
	 */
	deleteAlias(aliasName) {
		return this.request(`aliases/${aliasName}`, { method: "DELETE" });
	}
}