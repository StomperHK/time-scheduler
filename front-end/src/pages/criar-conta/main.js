import { validateUser } from "../../api/validateUser";
import { createToaster } from "../../utils/createToaster";
import logo from "/assets/logo.png"
import "/assets/style.css"


const createAccountForm = document.querySelector('[data-js="create-account-form"]');
const submitButton = document.querySelector('[type="submit"')

document.querySelector('[data-js="logo"]').src = logo

validateUser()
.then((userIsValid) => {
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
  });

  disableButton()

  const response = await fetch(import.meta.env.VITE_API_URL + "/auth/register", {
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

    if (message === "short password") {
      toasterMessage = "Senha muito curta";
    }

    if (message === "invalid email") {
      toasterMessage = "E-mail inválido"
    }

    if (message === "email registered") {
      toasterMessage = "E-mail já registrado";
    }

    if (message === "server error") {
      toasterMessage = "Erro ao acessar banco de dados";
    }

    createToaster(toasterMessage, "error");
  } else {
    const { token } = await response.json();
    createToaster("Login efetuado com sucesso");

    localStorage.setItem("token", token);

    setTimeout(() => {
      window.location.href = "/app/";
    }, 2000);
  }
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