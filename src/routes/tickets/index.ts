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
      const ticketsArray = Array.from({ length: metadata.quantity }, () => ({
        status: "active", // Todos los tickets inician como "active"
      }));
      const newTicket = new tickets({
        eventId: metadata.event_id,
        quantity: metadata.quantity,
        name: metadata.name,
        dni: metadata.dni,
        email: metadata.email,
        tickets: ticketsArray
      });
      await newTicket.save();
      res.sendStatus(200);
      // Procesa la información del pago según tus necesidades
    } catch (error) {
      console.error("Error al consultar el pago:", error);
      res.sendStatus(500);

    }
  }
});

router.get("/tickets", async (req, res) => {
  try {
    const targetsTickets = await tickets.find();
    res.json({targetsTickets})
    
  } catch (error) {
    res.status(404).json({ok:false, mesagge:"no se pudieron cargar los eventos"})
  }
})

router.put("/update-ticket/:id", async (req, res) => {
  const { id } = req.params; // ID del documento principal
  const { ticketId } = req.body; // ID del ticket individual que deseas actualizar

  try {
    const result = await tickets.updateOne(
      { _id: id, "tickets._id": ticketId }, // Busca el documento y el ticket específico
      {
        $set: {
          "tickets.$[ticket].status": "inactive", // Actualiza solo el ticket con el filtro
        },
      },
      {
        arrayFilters: [
          { "ticket._id": ticketId }, // Filtro para encontrar el ticket correcto
        ],
      }
    );

    if (result.modifiedCount === 0) {
       res.status(404).json({
        message: "No se encontró el ticket o ya estaba inactivo",
      });
      return;
    }

    res.status(200).json({ message: "Ticket actualizado con éxito", result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al actualizar el ticket" });
  }
})

export default router;
