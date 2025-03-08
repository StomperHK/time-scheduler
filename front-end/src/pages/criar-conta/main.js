import { createToaster } from "../../utils/createToaster"
import "../../style.css"

const createAccountForm = document.querySelector('[data-js="create-account-form"]')

async function createAccount(event) {
  event.preventDefault()

  const formData = new FormData(event.target)
  const registerData = JSON.stringify({
    "email": formData.get("email"),
    "password": formData.get("password")
  })

  const response = await fetch(import.meta.env.VITE_API_URL + "/auth/register", {
    body: registerData,
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    }
  })

  if (!response.ok) {
    const {message} = await response.json()
    let toasterMessage = ""

    if (message === "missing fields") {
      toasterMessage = "Digite e-mail e senha"
    }

    if (message === "short password") {
      toasterMessage = "Senha muito curta"
    }

    if (message === "email registered") {
      toasterMessage = "E-mail já registrado"
    }

    createToaster(toasterMessage, "error")
  }
  else {
    console.log("ok")
    createToaster("Conta criada com sucesso")

    setTimeout(() => {
      window.location.href = "/app/"
    }, 2000)
  }
}

createAccountForm.addEventListener("submit", createAccount)