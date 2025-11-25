const { verifyIdToken } = require("../lib/firebaseAdmin");
const prisma = require("../lib/prismaClient");

async function verifyFirebaseMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Missing Authorization token" });

  try {
    const decoded = await verifyIdToken(token);
    // upsert user in DB
    let user = await prisma.user.findUnique({ where: { firebaseUid: decoded.uid }});
    if (!user) {
      user = await prisma.user.create({
        data: {
          firebaseUid: decoded.uid,
          email: decoded.email ?? undefined,
          name: decoded.name ?? undefined,
        }
      });
    } else {
      // optional: update email/name if present
      await prisma.user.update({
        where: { id: user.id },
        data: {
          email: decoded.email ?? user.email,
          name: decoded.name ?? user.name,
        }
      });
    }
    req.user = user;
    next();
  } catch (err) {
    console.error("Firebase verify error", err);
    return res.status(401).json({ error: "Invalid token" });
  }
}

module.exports = verifyFirebaseMiddleware;
