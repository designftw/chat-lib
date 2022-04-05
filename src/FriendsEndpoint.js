import {
	request,
	createAliasFromAliasDTO,
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
	async getFriendsForAlias(ownAlias) {
		let route = `friends`;

		let friendsListDTO = await request(`${this.store.host}/${route}`, {
			headers: {
				"user-alias-name": ownAlias,
			}
		});

		return friendsListDTO.map(aliasDTO => createAliasFromAliasDTO(aliasDTO));
	}

	/**
	 * Add a new friend to the friend list of ownAlias.
	 * @param {string} ownAlias the alias adding a friend.
	 * @param {string} newFriend the new friend of the ownAlias.
	 * @returns {Promise<any>} a validation message.
	 */
	async addFriend(ownAlias, newFriend) {
		let route = `friends`;

		return request(`${this.store.host}/${route}`, {
			method: "POST",
			body: {
				alias_name: newFriend,
			},
			headers: {
				"user-alias-name": ownAlias
			},
		});
	}

	/**
	 * Remove a friend from the friend list of ownAlias.
	 * @param {string} ownAlias the alias removing a friend.
	 * @param {string} friendToRemove the friend to remove from ownAlias's friend list.
	 * @returns {Promise<any>} a validation message.
	 */
	async removeFriend(ownAlias, friendToRemove) {
		let route = `friends`;

		return request(`${this.store.host}/${route}`,{
			method: "DELETE",
			body: {
				alias_name: friendToRemove,
			},
			headers: {
				"user-alias-name": ownAlias,
			},
		});
	}
}