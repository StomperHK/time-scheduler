import { validateUser } from "../../api/validateUser"
import logo from "/assets/logo.png"
import "/assets/style.css"

document.querySelector('[data-js="logo"]').src = logo

async function main() {
  const userIsValid = await validateUser()

  if (!userIsValid) {
    location.href = "/login/"
  }
}

main()