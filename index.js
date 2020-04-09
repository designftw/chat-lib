// @ts-nocheck
import ChatClient from "./js/chatClient.js";


function initialize() {
	let client = new ChatClient('https://localhost:3000');

	// handle signup form
	const signupForm = document.getElementById('signupForm');
	if (signupForm !== null) {
		// add an event listener for submit
		signupForm.addEventListener("submit", function (event) {
			event.preventDefault();
			// get the form values from the form
			const alias = signupForm.elements['alias'].value;
			const email = signupForm.elements['email'].value;
			const password = signupForm.elements['password'].value;
			// signup
			client.signup(alias, email, password).then(() => {
				// on success clear the previously displayed error
				signupForm.getElementsByClassName('error')[0].innerHTML = "";
				// TODO(lukemurray): handle success
			}).catch(err => {
				// if there is an error display the error
				signupForm.getElementsByClassName('error')[0].innerHTML = err.message;
			});
		})

	}

	// handle login form
	const loginForm = document.getElementById('loginForm');
	if (loginForm !== null) {
		loginForm.addEventListener("submit", function (event) {
			event.preventDefault();
			const alias = loginForm.elements['alias'].value;
			const password = loginForm.elements['password'].value;
			// login
			client.login(alias, password).then(() => {
				// on success clear the previously displayed error
				loginForm.getElementsByClassName('error')[0].innerHTML = "";
				// TODO(lukemurray): handle success
			}).catch(err => {
				// if there is an error display the error
				loginForm.getElementsByClassName('error')[0].innerHTML = err.message;
			});
		})
	}

	const logoutButton = document.getElementById('logoutButton');
	if (logoutButton !== null) {
		logoutButton.addEventListener('click', function (event) {
			event.preventDefault()
			client.logout()
		})
	}


	// TODO(lukemurray): remove this
	const testButton = document.getElementById('testButton');
	if (testButton !== null) {
		testButton.addEventListener('click', function (event) {
			event.preventDefault()
			client.api.aliases.getAccountAliases()
		})
	}

}

// initialize when the dom is loaded
document.addEventListener('DOMContentLoaded', function () {
	initialize();
}, false);