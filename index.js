// @ts-nocheck
import ChatClient from "./js/chatClient.js";

const SERVER_HOST = "https://128.52.128.220";

/**
 *
 * @type {ChatClient | undefined}
 */
let client = undefined;

// my example start

const store = {};

// update the alias list to the alises in the store
function setAliasList() {
  let select = document.getElementById("accountAliasList");
  const currentlySelectedIndex = select.selectedIndex;
  let previouslySelectedAliasName = "";
  if (currentlySelectedIndex != -1) {
    previouslySelectedAliasName = select.options[currentlySelectedIndex].value;
  }
  while (select.length !== 0) {
    select.remove(select.length - 1);
  }
  for (let alias of store.aliases) {
    const newOption = new Option(alias.name);
    if (alias.name === previouslySelectedAliasName) {
      newOption.selected = true;
    }
    select.add(newOption);
  }
  if (currentlySelectedIndex === -1) {
    select.options[0].selected = true;
  }
}

// get the currently selected alias
function getCurrentlySelectedAlias() {
  let select = document.getElementById("accountAliasList");
  const currentlySelectedIndex = select.selectedIndex;
  if (currentlySelectedIndex === -1) {
    return undefined;
  }
  return select.options[currentlySelectedIndex].value;
}

async function initMyExample(account) {
  window._store = store;
  window._client = client;
  store.account = account;
  const aliases = await client.getAliasesForAccount();
  store.aliases = aliases;
  setAliasList();
  client.addEventListener("onNewMessage", async (e) => {
    const newMessage = await client.getMessage(
      e.detail.aliasName,
      e.detail.messageId
    );
    console.log("onNewMessage", newMessage);
  });
  client.addEventListener("onMessageUpdate", async (e) => {
    const updatedMessage = await client.getMessage(
      e.detail.aliasName,
      e.detail.messageId
    );
    console.log("onMessageUpdate", updatedMessage);
  });
  client.addEventListener("onUnauthorizedAccess", async (e) => {
    console.log("unauthorized access for", e.detail.aliasName);
  });
}

function handleSendMessage() {
  const toInput = document.querySelector("#sendMessageTo");
  const messageInput = document.querySelector("#sendMessagePayload");
  const sendMessageForm = document.querySelector("#sendMessageForm");
  sendMessageForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const to = toInput.value.split(",");
    const message = messageInput.value;
    const from = getCurrentlySelectedAlias();
    const sentMessage = await client.sendMessage(from, to, message);
  });
}

function handleGetMessages() {
  const getMessageButton = document.querySelector("#getMessageButton");
  getMessageButton.addEventListener("click", async () => {
    let messages = await client.getMessagesForAlias(
      getCurrentlySelectedAlias()
    );
    console.log(messages);
  });
}

document.addEventListener(
  "DOMContentLoaded",
  function () {
    handleSendMessage();
    handleGetMessages();
  },
  false
);

// my example end

function onAccountLoaded(account) {
  /**
   * Students can add code here
   */
  initMyExample(account);
}

/**
 * Called when the document is loaded. Initializes functionality
 */
async function initialize() {
  client = new ChatClient(SERVER_HOST);
  createSignupHandler(client);
  createLoginHandler(client);
  createLogoutHandler(client);

  // check if the client is logged in
  const loginResult = await client.isLoggedIn();
  toggleLoginUI(loginResult.isLoggedIn);

  // if client is logged in call account loaded
  if (loginResult.isLoggedIn) {
    onAccountLoaded(loginResult.account);
  }
  // otherwise wait for the client to log in
  client.addEventListener("login", (e) => {
    onAccountLoaded(e.detail);
    toggleLoginUI(true);
  });
  client.addEventListener("logout", (e) => {
    toggleLoginUI(false);
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
 * Show and hide the log in ui.
 * @param {boolean} isLoggedIn true if the user is currently logged in
 */
function toggleLoginUI(isLoggedIn) {
  const logoutButton = document.querySelector("#logoutButton");
  const loginButton = document.querySelector("#loginButton");
  const signupButton = document.querySelector("#signUpButton");

  if (isLoggedIn) {
    // hide login ui
    if (!loginButton.classList.contains("isHidden")) {
      loginButton.classList.add("isHidden");
    }
    if (!signupButton.classList.contains("isHidden")) {
      signupButton.classList.add("isHidden");
    }
    // show logout ui
    logoutButton.classList.remove("isHidden");
  } else {
    // show login ui
    loginButton.classList.remove("isHidden");
    signupButton.classList.remove("isHidden");
    // hide logout ui
    if (!logoutButton.classList.contains("isHidden")) {
      logoutButton.classList.add("isHidden");
    }
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
