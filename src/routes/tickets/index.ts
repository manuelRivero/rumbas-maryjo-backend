import { Router } from "express";
import { MercadoPagoConfig, Payment, Preference } from "mercadopago";
import Events from "../../models/events";
import tickets from "../../models/tickets";

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN as string,
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
        success: "https://rumbas-maryjo.onrender.com/",
        failure: "https://rumbas-maryjo.onrender.com/",
      },
      payer: {
        email,
      },
      metadata: {
        dni,
        email,
        name,
        quantity,
        eventId: id,
      },
      notification_url:
        "https://rumbas-maryjo-backend.onrender.com/api/tickets/save-ticket",
    };
    const preference = await new Preference(client);
    const response = await preference.create({ body } as any);
    res.json(response);
  } catch (error) {}
});

router.post("/save-ticket", async (req, res) => {
  const { topic } = req.query;
  const id = req.query.id as unknown as string;
  console.log("entro a /save-ticket");

  if (topic === "payment") {
    // Si la notificación es de tipo pago
    try {
      const { metadata } = await payment.get({ id }); // Consultas el pago en MP
      const newTicket = new tickets({
        event_id: metadata.event_id,
        quantity: metadata.quantity,
        name: metadata.name,
        dni: metadata.name,
        email: metadata.email,
      });
      await newTicket.save();
      res.sendStatus(200);
      // Procesa la información del pago según tus necesidades
    } catch (error) {
      console.error("Error al consultar el pago:", error);
    }
  }

  res.sendStatus(200); // Confirmas recepción de la notificación
});

export default router;
