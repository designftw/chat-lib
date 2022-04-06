import Endpoint from "./Endpoint.js";
import Alias from "../models/Alias.js";

/**
 * The aliases endpoint of the chat server.
 */
 export default class AliasesEndpoint extends Endpoint {
	/**
	 * AliasesEndpoint constructor.
	 * @param {Client} client see [Endpoint's client property]{@link Endpoint#client}
	 */
	constructor(client) {
		super(client);
	}

	/**
	 * Get all the aliases associated with the currently logged in account.
	 * @returns {Promise<Alias[]>} the aliases associated with the currently logged in account
	 */
	async getAliasesForAccount() {
		let aliasesArray = await this.request("aliases");

		return aliasesArray.map(aliasDTO => new Alias(aliasDTO));
	}

	/**
	 * Create a new alias associated with the currently logged in account.
	 *
	 * Raises an error if the alias already exists.
	 * @param {string} name the name of the alias to create
	 * @param {string } payload payload to attach to the new alias
	 * @returns {Promise<Alias>}
	 */
	async createAlias(name, payload) {
		let newAliasDTO = await this.request("aliases", {
				method: "POST",
				body: {
					name,
					payload,
				},
			});

		const aliasDTO = newAliasDTO.data;
		return new Alias(aliasDTO);
	}

	/**
	 * Get an existing alias by its name.
	 *
	 * Raises an error if the alias does not exist.
	 * @param {string} aliasName the name of the alias to get.
	 * @returns {Promise<Alias>}
	 */
	async getAlias(aliasName) {
		let json = await this.request(`aliases/${aliasName}`);

		return new Alias(json);
	}

	/**
	 * Update an existing alias by its name.
	 *
	 * Raises an error if the alias does not exist or belong to the currently logged in account.
	 * @param {Alias} alias the alias to update.
	 * @param {string} [newName] optional updated name of the alias. if not included alias retains the same name.
	 * @param {string} [newPayload] optional updated payload of the alias. if not included alias retains the same payload.
	 * @returns {Promise<Alias>}
	 */
	async updateAlias(alias, newName = alias.name, newPayload = alias.payload) {
		let updatedAliasDTO = await this.request(`aliases/${alias.name}`, {
			method: "PUT",
			body: { name: newName, payload: newPayload },
		});

		return new Alias(updatedAliasDTO.data);
	}

	/**
	 * Delete an existing alias by its name
	 *
	 * Raises an error if the alias does not exist or belong to the currently logged in account.
	 * @param {string} aliasName the alias to delete.
	 * @returns {Promise<any>} a validation message.
	 */
	deleteAlias(aliasName) {
		return this.request(`aliases/${aliasName}`, { method: "DELETE" });
	}
}