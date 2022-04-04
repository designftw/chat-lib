import {
	createAliasFromAliasDTO,
	getErrorFromResponse,
	createDefaultRequestInit,
  } from "./util.js";

/**
 * The Friends endpoint of the chat server
 */
export default class FriendsEndpoint {
	/**
	 * FriendsEndpoint constructor.
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
	 * Get all the friends of the passed in alias.
	 * @param {string} ownAlias the alias whose friends will be retrieved.
	 * @returns {Promise<Alias[]>} an array of aliases which are friends with the passed in alias
	 */
	getFriendsForAlias(ownAlias) {
		let route = `friends`;
		let headers = {
			"user-alias-name": ownAlias,
		};
		return fetch(
		`${this.store.host}/${route}`,
		createDefaultRequestInit({ method: "GET", headers: headers })
		)
		.then(getErrorFromResponse)
		.then((response) => response.json())
		.then((friendsListDTO) =>
			friendsListDTO.map((aliasDTO) => createAliasFromAliasDTO(aliasDTO))
		);
	}

	/**
	 * Add a new friend to the friend list of ownAlias.
	 * @param {string} ownAlias the alias adding a friend.
	 * @param {string} newFriend the new friend of the ownAlias.
	 * @returns {Promise<any>} a validation message.
	 */
	async addFriend(ownAlias, newFriend) {
		let response = await fetch(
			`${this.store.host}/friends`,
			createDefaultRequestInit({
				method: "POST",
				body: {
					alias_name: newFriend,
				},
				headers: {
					"user-alias-name": ownAlias
				},
			})
		);

		response = await getErrorFromResponse(response);
		return response.json();
	}

	/**
	 * Remove a friend from the friend list of ownAlias.
	 * @param {string} ownAlias the alias removing a friend.
	 * @param {string} friendToRemove the friend to remove from ownAlias's friend list.
	 * @returns {Promise<any>} a validation message.
	 */
	async removeFriend(ownAlias, friendToRemove) {
		let response = await fetch(
			`${this.store.host}/friends`,
			createDefaultRequestInit({
				method: "DELETE",
				body: {
					alias_name: friendToRemove,
				},
				headers: {
					"user-alias-name": ownAlias,
				},
			})
		);

		response = await getErrorFromResponse(response);
		return response.json();
	}
}