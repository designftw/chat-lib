import {
	request,
	createAliasFromAliasDTO,
	} from "./util.js";

/**
 * The aliases endpoint of the chat server.
 */
 export default class AliasesEndpoint {
	/**
	 * AliasesEndpoint constructor.
	 *
	 * @param {ClientStore} store see [Client's store property]{@link Client#store}
	 */
	constructor(store) {
		/**
		 * See [Client's store property]{@link Client#store}
		 * @type {ClientStore}
		 */
		this.store = store;
	}

	/**
	 * Get all the aliases associated with the currently logged in account.
	 * @returns {Promise<Alias[]>} the aliases associated with the currently logged in account
	 */
	async getAliasesForAccount() {
		let route = "aliases";

		let aliasesArray = await request(`${this.store.host}/${route}`);

		return aliasesArray.map(aliasDTO => createAliasFromAliasDTO(aliasDTO));
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
		let route = "aliases";

		let newAliasDTO = await request(`${this.store.host}/${route}`, {
				method: "POST",
				body: {
					name,
					payload,
				},
			});

		const aliasDTO = newAliasDTO.data;
		return createAliasFromAliasDTO(aliasDTO);
	}

	/**
	 * Get an existing alias by its name.
	 *
	 * Raises an error if the alias does not exist.
	 * @param {string} aliasName the name of the alias to get.
	 * @returns {Promise<Alias>}
	 */
	async getAlias(aliasName) {
		let route = `aliases/${aliasName}`;

		let json = await request(`${this.store.host}/${route}`);

		return createAliasFromAliasDTO(json);
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
		let route = `aliases/${alias.name}`;

		let updatedAliasDTO = await request(`${this.store.host}/${route}`, {
				method: "PUT",
				body: { name: newName, payload: newPayload },
			});

		return createAliasFromAliasDTO(updatedAliasDTO.data);
	}

	/**
	 * Delete an existing alias by its name
	 *
	 * Raises an error if the alias does not exist or belong to the currently logged in account.
	 * @param {string} aliasName the alias to delete.
	 * @returns {Promise<any>} a validation message.
	 */
	deleteAlias(aliasName) {
		let route = `aliases/${aliasName}`;

		return request(`${this.store.host}/${route}`, { method: "DELETE" });
	}
}