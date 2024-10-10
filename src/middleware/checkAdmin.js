
// import firebase Admin SDK for authentication and firestore operations
import { admin } from '@/firebase/firebaseAdminConfig';

export const checkAdmin = async (req, next) => {
  // extract the token from  Authorization header
  const token = req.headers.get('authorization')?.split(' ')[1]

  // check if token is missing
  if (!token) {
    // return Unauthorised 401 then 
    return new Response(JSON.stringify({ error: 'Unauthorised' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    // verify the id token using Firebase Admin SDK to authenticate the user
    const decodedToken = await admin.auth().verifyIdToken(token)
    const userId = decodedToken.uid // extract user id from decoded token

    // get the user document from firestore
    const userDoc = await admin.firestore().collection('users').doc(userId).get()

    // if doesnt exists return 404 status code
    if (!userDoc.exists) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }
    // extract the user role from the document data
    const userRole = userDoc.data().role

    // if user is not admin respond with status code 403 forbiden
    if (userRole !== 'admin') {
      return new Response(JSON.stringify({ error: 'Only admins' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Call the next function if user is verified as admin
    return next()
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
};
