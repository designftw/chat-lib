import {
	createPrivatePayloadFromPayloadDTO,
	getErrorFromResponse,
	createDefaultRequestInit,
  } from "./util.js";

/**
 * The Private Payload endpoint of the chat server
 */
export default class PrivatePayloadsEndpoint {
	/**
	 * PrivatePayloadEndpoint constructor.
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
	 * Create a new private payload.
	 * @param {string} ownAlias the alias associated with the private payload.
	 * @param {string} entityId the [id]{@link BaseModel#id} of the entity the payload is attached to.
	 * @param {string} payload the payload, private to the passed in alias, to be attached to the passed in model.
	 * @returns {Promise<PrivatePayload>} the newly created private payload.
	 */
	createPayload(ownAlias, entityId, payload) {
		let route = `payloads`;
		let headers = {
		"user-alias-name": ownAlias,
		};
		const body = { payload, entity_id: entityId };
		return fetch(
		`${this.store.host}/${route}`,
		createDefaultRequestInit({
			method: "POST",
			body,
			headers,
		})
		)
		.then(getErrorFromResponse)
		.then((response) => response.json())
		.then((resultDTO) => {
			const payloadDTO = resultDTO.data;
			return createPrivatePayloadFromPayloadDTO(payloadDTO);
		});
	}

	/**
	 * Get the payload associated with the passed in alias and entity.
	 * @param {string} ownAlias the alias associated with the private payload.
	 * @param {string} entityId the [id]{@link BaseModel#id} of the entity the returned payload is attached to.
	 * @returns {Promise<PrivatePayload>} the requested PrivatePayload model.
	 */
	getPayload(ownAlias, entityId) {
		let route = `payloads/${entityId}`;
		let headers = {
		"user-alias-name": ownAlias,
		};
		return fetch(
		`${this.store.host}/${route}`,
		createDefaultRequestInit({ method: "GET", headers: headers })
		)
		.then(getErrorFromResponse)
		.then((response) => response.json())
		.then((payloadDTO) => {
			return createPrivatePayloadFromPayloadDTO(payloadDTO);
		});
	}

	/**
	 * Update the payload associated with the passed in alias and entity.
	 * @param {string} ownAlias the alias associated with the private payload.
	 * @param {string} entityId the [id]{@link BaseModel#id} of the entity the payload to update is attached to.
	 * @param {string} newPayload the new payload to attach to the alias and model
	 * @returns {Promise<PrivatePayload>} the updated private payload model.
	 */
	updatePayload(ownAlias, entityId, newPayload) {
		let route = `payloads/${entityId}`;
		let headers = {
		"user-alias-name": ownAlias,
		};
		const body = { payload: newPayload };
		return fetch(
		`${this.store.host}/${route}`,
		createDefaultRequestInit({
			method: "PUT",
			body,
			headers,
		})
		)
		.then(getErrorFromResponse)
		.then((response) => response.json())
		.then((resultDTO) => {
			const payloadDTO = resultDTO.data;
			return createPrivatePayloadFromPayloadDTO(payloadDTO);
		});
	}

	/**
	 * Delete the payload associated with the passed in alias and entity.
	 * @param {string} ownAlias the alias associated with the private payload.
	 * @param {string} entityId the [id]{@link BaseModel#id} of the entity the payload to delete is attached to.
	 * @returns {Promise<any>} a validation message.
	 */
	deletePayload(ownAlias, entityId) {
		let route = `payloads/${entityId}`;
		let headers = {
		"user-alias-name": ownAlias,
		};
		return fetch(
		`${this.store.host}/${route}`,
		createDefaultRequestInit({ method: "DELETE", headers })
		)
		.then(getErrorFromResponse)
		.then((response) => response.json());
	}
}