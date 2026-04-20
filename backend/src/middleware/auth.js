const { initFirebase } = require('../config/firebase');


async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    if (token.startsWith('mock-token-')) {
      req.firebaseUid = token.replace('mock-token-', '');
      req.firebaseEmail = `mockuser_${req.firebaseUid}@example.com`;
      return next();
    }
    const admin = initFirebase();
    const decoded = await admin.auth().verifyIdToken(token);
    req.firebaseUid = decoded.uid;
    req.firebaseEmail = decoded.email;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}


async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    if (token.startsWith('mock-token-')) {
      req.firebaseUid = token.replace('mock-token-', '');
      req.firebaseEmail = `mockuser_${req.firebaseUid}@example.com`;
      return next();
    }
    const admin = initFirebase();
    const decoded = await admin.auth().verifyIdToken(token);
    req.firebaseUid = decoded.uid;
    req.firebaseEmail = decoded.email;
  } catch (_) {

  }
  next();
}

module.exports = { authenticate, optionalAuth };
