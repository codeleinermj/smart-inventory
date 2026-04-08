import { app } from "./app.js";
import { env } from "./config/env.js";

const PORT = env.PORT;

app.listen(PORT, () => {
  console.log(`API server listening on port ${PORT} [${env.NODE_ENV}]`);
});
