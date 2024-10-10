// this endpoint is for admins to see users
import { checkAdmin } from '@/middleware/checkAdmin';
import { admin } from '@/firebase/firebaseAdminConfig';

// GET request handler for fetching users, available only for aadmin users
export async function GET(req) {
  // Use the admin middleware to ensure only admins can access this route
  const adminCheckResponse = await checkAdmin(req, () => {})

  if (adminCheckResponse) {
    return adminCheckResponse // return the response if user is not admin
  }

  try {
    // fetch all users from users collection
    const usersSnapshot = await admin.firestore().collection('users').get()

    // map over results to get user data and ids
    const users = usersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(), // spread document data
    }))

    // return the list of users
    return new Response(JSON.stringify(users), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return new Response(JSON.stringify({ error: 'Failed to fetch users' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
