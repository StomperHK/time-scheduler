import { MercadoPagoConfig, Preference, Payment } from "mercadopago"

import { User } from "../models/User.js";
import { handleUserSubscription } from "../lib/handleUserSubscription.js";
import { sql } from "../lib/databaseConnection.js";

const mercadoPagoClient = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN});

export async function createPreference(req, res) {
  const newPreference = new Preference(mercadoPagoClient)
  const userId = req.authorization

  try {
    const userEmail = (await (new User(sql)).getUserData(userId)).email
    const preference = await newPreference.create({
      body: {
        items: [
          {
            title: 'Agendador de Horários Premium',
            quantity: 1,
            unit_price: 35
          }
        ],
        metadata: {
          userId,
        },
        payer: {
          email: userEmail,
          identification: {
            type: "userId",
            number: userId
          }
        },
        back_urls: {
          success: process.env.FRONTEND_URL + "/pagamento-sucesso/",
          failure: process.env.FRONTEND_URL + "/pagamento-erro/",
          pending: process.env.FRONTEND_URL + "/pagamento-pendente/"
        }
      }
    })

    res.status(201)
    return res.json({id: preference.id})
  }
  catch (error) {
    console.log(error)
    res.status(500).json({ message: "server error" })
  }
}

export async function handleFeedback(req, res) {
  const { type, data: { id } } = req.body

  switch (type) {
    case "payment":
      let payment = null;
      let paymentData = null
      
      try {
        payment = new Payment(mercadoPagoClient)
        paymentData = await payment.get({ id })
      }
      catch(error) {
        if (error.error === "not_found") {
          res.status(404).send()
          return
        }
        else {
          res.status(500).send()
          return
        }
      }

      if (paymentData.status === "approved" || paymentData.date_approved !== null) {
        try {
          await handleUserSubscription(sql, paymentData)
          res.status(200).send()
          return
        }
        catch (error) {
          res.status(500).send()
          return
        }
      }

      break
    default:
      console.log("Not handled request event type: ", type)
      res.status(404).send()
  }
}