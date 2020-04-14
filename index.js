// @ts-nocheck
import ChatClient from "./js/chatClient.js";

// TODO(lukemurray): change to chat server url
// const SERVER_HOST = "https://messaging-server.csail.mit.edu";
const SERVER_HOST = "https://128.52.128.220";
// const SERVER_HOST = "https://localhost:3000";

/**
 * Called when the document is loaded. Initializes functionality
 */
function initialize() {
  let client = new ChatClient(SERVER_HOST);

  createSignupHandler(client);
  createLoginHandler(client);
  createLogoutHandler(client);
  // TODO(lukemurray): remove this
  createTestHandler(client);
}

// initialize when the dom is loaded
document.addEventListener(
  "DOMContentLoaded",
  function () {
    initialize();
  },
  false
);

/**
 * Create a handler for the test button
 * @param {ChatClient} client the chat client for the application
 */
function createTestHandler(client) {
  const testButton = document.querySelector("#testButton");
  if (testButton !== null) {
    testButton.addEventListener("click", function (event) {
      event.preventDefault();
      client.api.aliases.getAliasesForAccount();
    });
  }
}

/**
 * Create a handler for the logout button
 * @param {ChatClient} client the chat client for the application
 */
function createLogoutHandler(client) {
  const logoutButton = document.querySelector("#logoutButton");
  if (logoutButton !== null) {
    logoutButton.addEventListener("click", function (event) {
      event.preventDefault();
      client.logout().catch(() => {
        // TODO(lukemurray): handle failure
      });
    });
  }
}

/**
 * Create a handler for the login form
 * @param {ChatClient} client the chat client for the application
 */
function createLoginHandler(client) {
  const loginButton = document.querySelector("#loginButton");
  const loginDialog = document.querySelector("#loginDialog");
  const loginForm = document.querySelector("#loginForm");
  const cancelLoginButton = loginForm.querySelector('[type="reset"]');
  loginButton.addEventListener("click", () => {
    loginDialog.showModal();
  });
  cancelLoginButton.addEventListener("click", () => {
    loginDialog.close();
  });
  loginForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const email = loginForm.elements["email"].value;
    const password = loginForm.elements["password"].value;
    // login
    client
      .login(email, password)
      .then(() => {
        loginForm.querySelector(".error").innerHTML = "";
        console.log("logged in");
        loginDialog.close();
      })
      .catch((err) => {
        // if there is an error display the error
        loginForm.querySelector(".error").innerHTML = err.message;
      });
  });
}

/**
 * Create a handler for the signup form
 * @param {ChatClient} client the chat client for the application
 */
function createSignupHandler(client) {
  const signupButton = document.querySelector("#signUpButton");
  const signupDialog = document.querySelector("#signUpDialog");
  const signupForm = document.querySelector("#signUpForm");
  const cancelSignupButton = signupForm.querySelector('[type="reset"]');
  signupButton.addEventListener("click", () => {
    signupDialog.showModal();
  });
  cancelSignupButton.addEventListener("click", () => {
    signupDialog.close();
  });
  signupForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const alias = signupForm.elements["alias"].value;
    const email = signupForm.elements["email"].value;
    const password = signupForm.elements["password"].value;
    // signup
    client
      .signup(alias, email, password)
      .then(() => {
        signupForm.querySelector(".error").innerHTML = "";
        signupDialog.close();
      })
      .catch((err) => {
        // if there is an error display the error
        signupForm.getElementsByClassName("error").innerHTML = err.message;
      });
  });
}
