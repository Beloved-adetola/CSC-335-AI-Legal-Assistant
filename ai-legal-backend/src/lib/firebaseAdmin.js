const admin = require("firebase-admin");

function initFirebase() {
  if (admin.apps.length) return admin;

  const base64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
  if (!base64) {
    console.warn("FIREBASE_SERVICE_ACCOUNT_BASE64 missing; Firebase admin won't start.");
    return admin;
  }
  const serviceAccountJson = JSON.parse(Buffer.from(base64, "base64").toString("utf8"));

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccountJson),
  });

  return admin;
}

function verifyIdToken(idToken) {
  initFirebase();
  return admin.auth().verifyIdToken(idToken);
}

module.exports = { initFirebase, verifyIdToken };
