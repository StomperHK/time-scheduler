import { User } from "../models/User.js"

export async function handleUserSubscription(sql, paymentData) {
  const {user_id} = paymentData.metadata
  const userModel = new User(sql)

  userModel.upgradeUserToPremium(user_id)
}