//Importing Firestore and authentication modules from Firebase Admin SDK
import { adminDb, admin } from "@/firebase/firebaseAdminConfig";

// POST request handler
export async function POST(req, { params }) {
  const { id } = params // extracting the place ID from the request parameters
  const { rooms, checkInDate, nights, people } = await req.json() // decontruct booking details from the request body

  // reference to bokings collection in firestore
  const bookingRef = adminDb.collection('bookings')

  // reference to place document in firestore with this id
  const placeRef = adminDb.collection('places').doc(id)

  // get the authorization header from request to verify user identity
  const authHeader = req.headers.get('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // if authorization header is missing or bad formated return error response
    return new Response(JSON.stringify({ error: 'No token provided' }), {
      status: 401,
    })
  }

  // extract the token from the authorization header
  const token = authHeader.split('Bearer ')[1]
  
  try {
    // Verify the id token to authenticate the user
    const decodedToken = await admin.auth().verifyIdToken(token)
    const userId = decodedToken.uid  // extract user id from decoded token

    // fetch place document
    const placeSnapshot = await placeRef.get()

    // check if place document exists. if not, return 404 status code
    if (!placeSnapshot.exists) {
      return new Response(JSON.stringify({ error: 'Place not found' }), {
        status: 404, 
      })
    }

    // get place data, then get available_rooms and price
    const placeData = placeSnapshot.data()
    const availableRooms = placeData.available_rooms
    const pricePerNight = placeData.price

    // check if the requested no of rooms are available, if not return 400, bad request
    if (availableRooms < rooms) {
      return new Response(JSON.stringify({ error: 'No more rooms available for this place' }), {
        status: 400,
      })
    }
    // get place name
    const placeName = placeData.name
    const totalPrice = rooms * nights * pricePerNight // calculate total price

    // create new bokking document in bookings collection
    const newBooking = await bookingRef.add({
      userId,  
      placeId: id, 
      placeName,
      rooms,
      people,
      checkInDate,
      nights,
      totalPrice,
      bookedAt: new Date(),
      status: 'confirmed',
    })

    // update the available rooms in place document by decrementing the booked rooms
    await placeRef.update({
      available_rooms: admin.firestore.FieldValue.increment(-rooms),
    })

    // return success response and the new booking id
    return new Response(JSON.stringify({ success: true, bookingId: newBooking.id }), {
      status: 200,
    })
  } catch (error) {
    console.error("Error while booking:", error)
    // return server error if booking fails
    return new Response(JSON.stringify({ error: 'Booking failed' }), {
      status: 500,
    })
  }
}
