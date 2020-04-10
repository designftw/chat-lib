// @ts-nocheck
import ChatClient from "./js/chatClient.js";

/**
 * Called when the document is loaded. Initializes functionality
 */
function initialize() {
  let client = new ChatClient("https://localhost:3000");

  createSignupHandler(client);
  createLoginHandler(client);
  createLogoutHandler(client);
  // TODO(lukemurray): remove this
  createTestHandler(client);

  // if the client is logged in and not on main app page redirect to app page
  client.isLoggedIn().then((isLoggedIn) => {
    if (isLoggedIn) {
      if (
        window.location.pathname === "/login.html" ||
        window.location.pathname === "signup.html"
      ) {
        navigateToHome();
      }
    }
  });
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
      client.api.aliases.getAccountAliases();
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
      client
        .logout()
        .then(() => {
          navigateToLogin();
        })
        .catch(() => {
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
  const loginForm = document.querySelector("#loginForm");
  if (loginForm !== null) {
    loginForm.addEventListener("submit", function (event) {
      event.preventDefault();
      const email = loginForm.elements["email"].value;
      const password = loginForm.elements["password"].value;
      // login
      client
        .login(email, password)
        .then(() => {
          loginForm.querySelector(".error").innerHTML = "";
          navigateToHome();
        })
        .catch((err) => {
          // if there is an error display the error
          loginForm.querySelector(".error").innerHTML = err.message;
        });
    });
  }
}

/**
 * Create a handler for the signup form
 * @param {ChatClient} client the chat client for the application
 */
function createSignupHandler(client) {
  const signupForm = document.querySelector("#signupForm");
  if (signupForm !== null) {
    signupForm.addEventListener("submit", function (event) {
      event.preventDefault();
      // get the form values from the form
      const alias = signupForm.elements["alias"].value;
      const email = signupForm.elements["email"].value;
      const password = signupForm.elements["password"].value;
      // signup
      client
        .signup(alias, email, password)
        .then(() => {
          signupForm.querySelector(".error").innerHTML = "";
          navigateToHome();
        })
        .catch((err) => {
          // if there is an error display the error
          signupForm.getElementsByClassName("error").innerHTML = err.message;
        });
    });
  }
}

/**
 * Navigate to the login page programmatically
 */
function navigateToLogin() {
  window.location.replace("./login.html");
}

/**
 * Navigate to the home page programmatically
 */
function navigateToHome() {
  window.location.replace("./index.html");
}
