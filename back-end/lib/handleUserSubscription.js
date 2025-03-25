import { User } from "mercadopago"

export async function handleUserSubscription(sql, paymentData) {
  const {user_id} = paymentData
  const userModel = new User(sql)

  userModel.turnUserIntoPremium(user_id)
}