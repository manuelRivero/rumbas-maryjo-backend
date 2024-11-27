import './env';

import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import ticketRoutes from "./routes/tickets";
import eventsRoutes from "./routes/events";
import { dbConnection } from "./db";



const app = express();
const port = 5000;

const corsOptions = {
  //To allow requests from client
  origin: "http://localhost:3000",
  credentials: true,
  exposedHeaders: ["set-cookie"],
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
};
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors(corsOptions));

app.use("/api/tickets/", ticketRoutes);
app.use("/api/events/", eventsRoutes);

dbConnection();

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});
