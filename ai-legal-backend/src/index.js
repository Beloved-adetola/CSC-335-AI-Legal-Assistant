require('dotenv').config();
const app = require("./app");
const { initFirebase } = require("./lib/firebaseAdmin");

initFirebase(); // optional; will warn if not configured

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`AI Legal Backend listening on ${PORT}`);
});
