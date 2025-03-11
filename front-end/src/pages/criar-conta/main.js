import { validateUser } from "../../api/validateUser";
import { createToaster } from "../../utils/createToaster";
import "../../style.css";

const createAccountForm = document.querySelector('[data-js="create-account-form"]');

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

  const response = await fetch("http://localhost:3000" + "/auth/register", {
    body: registerData,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const { message } = await response.json();
    let toasterMessage = "";

    if (message === "missing fields") {
      toasterMessage = "Digite e-mail e senha";
    }

    if (message === "short password") {
      toasterMessage = "Senha muito curta";
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
