import { END } from "./../../../node_modules/mongoose/node_modules/mongodb/src/constants";
import { Router } from "express";
import { MercadoPagoConfig, Payment, Preference } from "mercadopago";
import { title } from "process";
import Events from "../../models/events";

const client = new MercadoPagoConfig({
  accessToken: "access_token",
  options: { timeout: 5000, idempotencyKey: "abc" },
});
const payment = new Payment(client);

const router = Router();

router.post("/create-ticket", async (req, res) => {

  const { email, name, dni, quantity, id } = req.body;

  try {
    const targetEvent = await Events.findById(id);
    const body = {
      items: [
        {
          title: targetEvent.name,
          unit_price: targetEvent.price,
          quantity: Number(quantity),
          currency_id: "ARS",
        },
      ],
      auto_return: "approved",
      back_urls: {
        success: "http://localhost:3000/detalle-evento",
        failure: "http://localhost:3000/detalle-evento",
      },
      payer: {
        email
      },
      metadata: {
        dni,
        email,
        name,
        quantity,
        eventId: id
      },
      notification_url: "https://tu-servidor.com/webhook",
    };
    const preference = await new Preference(client);
    // const response = await preference.create({ body });
  } catch (error) {}

  res.json({ ok: true });
});

export default router;
