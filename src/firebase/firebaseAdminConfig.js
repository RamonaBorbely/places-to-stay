import admin from 'firebase-admin';
import serviceAccount from './placestostay-2bd9b-firebase-adminsdk-do8uc-a25b9594ca.json'

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const adminDb = admin.firestore(); 

export { adminDb, admin };
