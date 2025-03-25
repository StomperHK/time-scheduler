import { User } from "mercadopago"

export async function handleUserSubscription(sql, paymentData) {
  const {user_id} = paymentData
  const userModel = new User(sql)

  userModel.upgradeUserToPremium(user_id)
}