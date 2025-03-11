export async function validateUser() {
  const token = localStorage.getItem("token")

  if (!token) return false

  const response = await fetch(import.meta.env.VITE_API_URL + "/user?send-user-data=false", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  return response.ok
}