import { startServer } from "./server";

startServer(false, Number(process.env.SERVER_PORT ?? '2081'));
