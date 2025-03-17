import { validateUser } from "../../api/validateUser";
import { createToaster } from "../../utils/createToaster";
import logo from "/assets/logo.png"
import "/assets/style.css"


const loginForm = document.querySelector('[data-js="login-form"]');
const submitButton = document.querySelector('[type="submit"')

document.querySelector('[data-js="logo"]').src = logo

validateUser()
.then((userIsValid) => {
  if (userIsValid) {
    window.location.href = "/app/";
  } else {
    loginForm.addEventListener("submit", login);
  }
});

async function login(event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const registerData = JSON.stringify({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  disableButton()

  const response = await fetch(import.meta.env.VITE_API_URL + "/auth/login", {
    body: registerData,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  enableButton()

  if (!response.ok) {
    const { message } = await response.json();
    let toasterMessage = "";

    if (message === "missing fields") {
      toasterMessage = "Digite e-mail e senha";
    }

    if (message === "account created with oauth") [
      toasterMessage = "Faça login via Google"
    ]

    if (message === "wrong login") {
      toasterMessage = "Dados de login incorretos";
    }

    if (message === "server error") {
      toasterMessage = "Erro ao acessar banco de dados";
    }

    createToaster(toasterMessage, "error");
  }

  const token = await response.json();
  createToaster("Login efetuado com sucesso");

  localStorage.setItem("token", JSON.stringify(token));

  setTimeout(() => {
    window.location.href = "/app/";
  }, 2000);
}

function disableButton() {
  const [spinner, buttonText] = submitButton.children

  submitButton.disabled = true
  submitButton.classList.add("opacity-70")

  spinner.classList.remove("hidden")
  buttonText.classList.add("opacity-0")
}

function enableButton() {
  const [spinner, buttonText] = submitButton.children

  submitButton.disabled = false
  submitButton.classList.add("opacity-100")

  spinner.classList.add("hidden")
  buttonText.classList.remove("opacity-0")
}

async function handleCredentialResponse(response) {
  const apiResponse = await fetch(import.meta.env.VITE_API_URL + "/auth/oauth-register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(response)
  })


  if (!apiResponse.ok) {
    createToaster("Erro no banco de dados", "error")
    return
  }

  const token = await apiResponse.json();
  
  createToaster("Login efetuado com sucesso");

  localStorage.setItem("token", JSON.stringify(token));

  setTimeout(() => {
    window.location.href = "/app/";
  }, 2000);
}

window.onload = function () {
  google.accounts.id.initialize({
    client_id: "300608833225-6onv3a86efidv43u2lga3f3l7grsgm90.apps.googleusercontent.com",
    callback: handleCredentialResponse
  });

  google.accounts.id.renderButton(
    document.getElementById("google-login-button"),
    { theme: "outline", size: "large" }
  );

  google.accounts.id.prompt();
}
