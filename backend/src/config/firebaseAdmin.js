import admin from "firebase-admin";

const formatPrivateKey = (value = "") => value.replace(/\\n/g, "\n");

export const hasFirebaseAdminConfig = () =>
  Boolean(
    process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY
  );

export const getFirebaseAdmin = () => {
  if (!hasFirebaseAdminConfig()) {
    return null;
  }

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY),
      }),
    });
  }

  return admin;
};
