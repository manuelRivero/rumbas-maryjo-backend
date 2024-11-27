import { Router } from "express";
import { MercadoPagoConfig, Payment, Preference } from "mercadopago";
import Events from "../../models/events";

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
    const response = await preference.create({ body } as any);
    console.log("response", response)
    res.json(response)
  } catch (error) {

  }
});

router.post("/save-ticket", async (req, res) => {
  const { topic } = req.query;
  const id = req.query as unknown as string

  if (topic === "payment") { // Si la notificación es de tipo pago
      try {
          const paymentResponse = await payment.get({id}); // Consultas el pago en MP
          console.log(paymentResponse); // Aquí tienes todos los detalles del pago

          // Procesa la información del pago según tus necesidades
      } catch (error) {
          console.error("Error al consultar el pago:", error);
      }
  }

  res.sendStatus(200); // Confirmas recepción de la notificación
});



export default router;
