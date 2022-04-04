import {
	createAliasFromAliasDTO,
	getErrorFromResponse,
	createDefaultRequestInit,
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
	getAliasesForAccount() {
		let route = "aliases";

		return fetch(
			`${this.store.host}/${route}`,
			createDefaultRequestInit({ method: "GET" })
		)
			.then(getErrorFromResponse)
			.then((response) => response.json())
			.then((aliasesArray) => {
				return aliasesArray.map((aliasDTO) => {
					return createAliasFromAliasDTO(aliasDTO);
				});
			});
	}

	/**
	 * Create a new alias associated with the currently logged in account.
	 *
	 * Raises an error if the alias already exists.
	 * @param {string} name the name of the alias to create
	 * @param {string } payload payload to attach to the new alias
	 * @returns {Promise<Alias>}
	 */
	createAlias(name, payload) {
		let route = "aliases";
		return fetch(
			`${this.store.host}/${route}`,

			createDefaultRequestInit({
			method: "POST",
			body: {
				name,
				payload,
			},
			})
		)
			.then(getErrorFromResponse)
			.then((response) => response.json())
			.then((newAliasDTO) => {
				const aliasDTO = newAliasDTO.data;
				return createAliasFromAliasDTO(aliasDTO);
			});
	}

	/**
	 * Get an existing alias by its name.
	 *
	 * Raises an error if the alias does not exist.
	 * @param {string} aliasName the name of the alias to get.
	 * @returns {Promise<Alias>}
	 */
	getAlias(aliasName) {
		let route = `aliases/${aliasName}`;

		return fetch(
			`${this.store.host}/${route}`,
			createDefaultRequestInit({ method: "GET" })
		)
			.then(getErrorFromResponse)
			.then((response) => response.json())
			.then(createAliasFromAliasDTO);
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
	updateAlias(alias, newName = alias.name, newPayload = alias.payload) {
		let route = `aliases/${alias.name}`;

		return fetch(
			`${this.store.host}/${route}`,

			createDefaultRequestInit({
			method: "PUT",
			body: { name: newName, payload: newPayload },
			})
		)
			.then(getErrorFromResponse)
			.then(response => response.json())
			.then((updatedAliasDTO) => {
				const aliasDTO = updatedAliasDTO.data;
				return createAliasFromAliasDTO(aliasDTO);
			});
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
		return fetch(
			`${this.store.host}/${route}`,
			createDefaultRequestInit({ method: "DELETE" })
		)
			.then(getErrorFromResponse)
			.then((response) => response.json());
	}
}