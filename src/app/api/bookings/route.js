// on this enpoint loged users make a requests for list of bookings

// import Admin SDK config
import { adminDb } from "@/firebase/firebaseAdminConfig"; 

// GET request handler to feched all bookings for a loged in user based on their user id
export async function GET(req) {
  // extract search parameters fro request URL
  const { searchParams } = new URL(req.url) // parse URL to access search parameters
  const userId = searchParams.get('userId') // get user id from the query string

  // chack if userId parameter is provided. 
  if (!userId) {
    return new Response(JSON.stringify({ error: 'User ID is required' }), {
      status: 400,
    })
  }

  try {
    // create a firestore query to find bookings where the userId matches the provided id
    const bookingsRef = adminDb.collection('bookings').where('userId', '==', userId)
    const snapshot = await bookingsRef.get() // execute query

    // if no bookings swere found
    if (snapshot.empty) {
      return new Response(JSON.stringify([]), {
        status: 200,
      })
    }

    const bookings = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    // return list of bookings for that user id
    return new Response(JSON.stringify(bookings), {
      status: 200,
    })
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch bookings' }), {
      status: 500,
    })
  }
}
