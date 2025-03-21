import { validateUser } from "../../api/validateUser";
import logo from "/assets/logo.png";
import "/assets/style.css";

document.querySelector('[data-js="logo"]').src = logo;

async function main() {
  const userIsValid = await validateUser();

  if (!userIsValid) {
    location.href = "/login/";
    return;
  }

  const preferenceId = await getPreferenceId()
  createPreference(preferenceId)
}

main();

async function getPreferenceId() {
  const preferenceId = localStorage.getItem("preference_id")

  if (preferenceId) {
    try {
      const response = fetch(import.meta.env.VITE_API_URL + "/verify-preference", {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ preferenceId })
      })
  
      if (response.ok) {
        return preferenceId
      }
      else {
        localStorage.removeItem("preference_id")
      }
    }
    catch(error) {
      console.log(error)
    }
  }

  const token = JSON.parse(localStorage.getItem("token"))?.token

  try {
    const response = await fetch(import.meta.env.VITE_API_URL + "/create-preference", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    if (response.ok) {
      const preferenceData = await response.json()
      localStorage.setItem("preference_id", preferenceData.id)
      console.log(preferenceData.id)

      return preferenceData.id
    }
  }
  catch(error) {
    console.log(error)
  }
}

function createPreference(preferenceId) {
  const mp = new MercadoPago("APP_USR-ae325170-a9d6-4305-98ae-60ae16a34215", { locale: "pt-BR" });
  const bricksBuilder = mp.bricks();

  bricksBuilder.create("wallet", "wallet-container", {
    initialization: {
      preferenceId: preferenceId,
    },
    customization: {
      texts: {
        valueProp: "smart_option",
      },
    }
  });
}
