export async function validateUser(sendUserData) {
  const token = JSON.parse(localStorage.getItem("token"))?.token

  if (!token) return false

  const response = await fetch(import.meta.env.VITE_API_URL + `/user?send-user-data=${sendUserData}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  if (response.ok) {
    return sendUserData ? await response.json() : true
  }

  return false
}