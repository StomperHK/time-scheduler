import { validateUser } from "../../api/validateUser";
import { createToaster } from "../../utils/createToaster";
import { hideLoadingScreen } from "../../utils/loadingScreen";
import logo from "/assets/logo.png";
import "/assets/style.css";

const createAccountForm = document.querySelector('[data-js="create-account-form"]');
const showPassword = document.querySelector('[data-js="show-password"]');
const submitButton = document.querySelector('[type="submit"');

document.querySelector('[data-js="logo"]').src = logo;

validateUser().then((userIsValid) => {
  if (userIsValid) {
    window.location.href = "/app/";
  } else {
    createAccountForm.addEventListener("submit", createAccount);
  }
});

async function createAccount(event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const registerData = JSON.stringify({
    email: formData.get("email"),
    password: formData.get("password"),
    name: `${capitalize(formData.get("firstname"))} ${capitalize(formData.get("lastname"))}`,
  });

  disableButton();

  const response = await fetch(import.meta.env.VITE_API_URL + "/auth/register", {
    body: registerData,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  enableButton();

  if (!response.ok) {
    const { message } = await response.json();
    let toasterMessage = "";

    if (message === "missing fields") {
      toasterMessage = "Digite nome, e-mail e senha";
    }

    if (message === "short password") {
      toasterMessage = "Senha muito curta";
    }

    if (message === "invalid email") {
      toasterMessage = "E-mail inválido";
    }

    if (message === "email registered") {
      toasterMessage = "E-mail já registrado";
    }

    if (message === "server error") {
      toasterMessage = "Erro ao acessar banco de dados";
    }

    createToaster(toasterMessage, "error");
    return;
  }

  const token = await response.json();
  createToaster("Login efetuado com sucesso");

  localStorage.setItem("token", JSON.stringify(token));

  setTimeout(() => {
    window.location.href = "/app/";
  }, 2000);
}

function disableButton() {
  const [spinner, buttonText] = submitButton.children;

  submitButton.disabled = true;
  submitButton.classList.add("opacity-70");

  spinner.classList.remove("hidden");
  buttonText.classList.add("opacity-0");
}

function enableButton() {
  const [spinner, buttonText] = submitButton.children;

  submitButton.disabled = false;
  submitButton.classList.add("opacity-100");

  spinner.classList.add("hidden");
  buttonText.classList.remove("opacity-0");
}

async function handleCredentialResponse(response) {
  disableButton()

  const apiResponse = await fetch(import.meta.env.VITE_API_URL + "/auth/oauth-register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(response),
  });

  enableButton()

  if (!apiResponse.ok) {
    createToaster("Erro no banco de dados", "error");
    return;
  }

  const token = await apiResponse.json();

  createToaster("Conta criada com sucesso");

  localStorage.setItem("token", JSON.stringify(token));

  setTimeout(() => {
    window.location.href = "/app/";
  }, 2000);
}

async function main() {
  const userIsValid = await validateUser();

  hideLoadingScreen();

  if (userIsValid) {
    window.location.href = "/app/";
  } else {
    createAccountForm.addEventListener("submit", createAccount);
  }
}

main();

window.onload = function () {
  google.accounts.id.initialize({
    client_id: "300608833225-6onv3a86efidv43u2lga3f3l7grsgm90.apps.googleusercontent.com",
    callback: handleCredentialResponse,
  });

  google.accounts.id.renderButton(document.getElementById("google-login-button"), { type: "standard", theme: "filled_blue", size: "large", text: "continue_with", logo_alignment: "left", width: "100%" });

  google.accounts.id.prompt();
};

function capitalize(str) {
  return str[0].toUpperCase() + str.slice(1, str.length);
}

function toggleShowPassword() {
  const passwordInput = document.querySelector('[data-js="password"]');
  const isPasswordVisible = passwordInput.type === "text";
  const icon = showPassword.querySelector("i");

  if (isPasswordVisible) {
    icon.classList.remove("fa-eye-slash");
    icon.classList.add("fa-eye");
  } else {
    icon.classList.remove("fa-eye");
    icon.classList.add("fa-eye-slash");
  }

  passwordInput.type = isPasswordVisible ? "password" : "text";
  passwordInput.focus();
  showPassword.setAttribute("aria-checked", !isPasswordVisible);
}

showPassword.addEventListener("click", toggleShowPassword);
