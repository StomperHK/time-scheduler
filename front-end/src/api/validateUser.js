export async function validateUser() {
  const token = localStorage.getItem("token")

  if (!token) return false

  const response = await fetch("http://localhost:3000" + "/user?send-user-data=false", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  console.log(await response.json())

  return response.ok
}