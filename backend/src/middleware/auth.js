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

function roleMiddleware(requiredRole) {
  return (req, res, next) => {
    if (!req.firebaseUid || !req.firebaseEmail) {
      return res.status(403).json({ error: 'Unauthorized access' });
    }

    const admin = initFirebase();
    admin.firestore().collection('users').doc(req.firebaseUid).get()
      .then((doc) => {
        if (!doc.exists) {
          return res.status(403).json({ error: 'User not found' });
        }

        const userData = doc.data();
        if (userData.role !== requiredRole) {
          return res.status(403).json({ error: 'Insufficient permissions' });
        }

        req.userRole = userData.role;
        next();
      })
      .catch((err) => {
        console.error('Error verifying role:', err);
        res.status(500).json({ error: 'Internal server error' });
      });
  };
}

module.exports = { authenticate, optionalAuth, roleMiddleware };
