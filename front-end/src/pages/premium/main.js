import { validateUser } from "../../api/validateUser";
import { returnUserExceededTestTime } from "../../utils/returnUserExceededTestTime";
import logo from "/assets/logo.png";
import "/assets/style.css";

const logofgButton = document.querySelector("[data-js='logoff-button']");
document.querySelector('[data-js="logo"]').src = logo;

async function main() {
  const userData = await validateUser(true);
  const userExceededTestTime = returnUserExceededTestTime(userData.created_at, userData.is_premium)

  if (!userData) {
    location.href = "/login/";
    return;
  }

  if (userData.is_premium) {
    location.href = "/app/";
    return;
  }

  if (userExceededTestTime) {
    document.querySelector('[data-js="test-period-expired-text"]').classList.remove("hidden")
    return;
  }

  const preferenceId = await getPreferenceId()
  createPreference(preferenceId)
}

main();

function logoffAccount() {
  localStorage.removeItem("token");
  window.location.href = "/login/";
}

async function getPreferenceId() {
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
      return preferenceData.id
    }
  }
  catch(error) {
    console.log(error)
  }
}

function createPreference(preferenceId) {
  const mp = new MercadoPago(import.meta.env.VITE_MP_PUBLICK_KEY, { locale: "pt-BR" });
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

logofgButton.addEventListener("click", logoffAccount);