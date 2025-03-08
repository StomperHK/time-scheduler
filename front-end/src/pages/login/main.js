import { createToaster } from "../../utils/createToaster"
import "../../style.css"

const loginForm = document.querySelector('[data-js="login-form"]')

async function login(event) {
  event.preventDefault()

  const formData = new FormData(event.target)
  const registerData = JSON.stringify({
    "email": formData.get("email"),
    "password": formData.get("password")
  })

  const response = await fetch(import.meta.env.VITE_API_URL + "/auth/login", {
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

    if (message === "wrong login") {
      toasterMessage = "Dados de login incorretos"
    }

    createToaster(toasterMessage, "error")
  }
  else {
    createToaster("Login efetuado com sucesso")

    setTimeout(() => {
      window.location.href = "/app/"
    }, 2000)
  }
}

loginForm.addEventListener("submit", login)