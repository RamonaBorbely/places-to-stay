/**
    User Booking Management API

    This file contains API route handlers for users to manage their bookings
    The DELETE handler allows users to delete their bookings
    PUT handler allows users to update their booking details
    These handlers interact with Firestore to update booking information and adjust the available 
    rooms in the associated places accordingly
 
  Endpoints:
  - DELETE `/api/bookings/[id]`: Delete a booking by its ID and update the room count
  - PUT `/api/bookings/[id]`: Update booking details by its ID and adjust room availability
 
  Error Handling:
  - Proper error handling is implemented to ensure meaningful error messages and status codes are returned in case of failures
 */


import { adminDb, admin } from "@/firebase/firebaseAdminConfig";

// DELETE request handler
export async function DELETE(req, { params }) {
  // get booking id
  const { id } = params

  try {
    // reference to booking with id
    const bookingRef = adminDb.collection('bookings').doc(id)
    const bookingSnapshot = await bookingRef.get() // fetch booking document

    if (!bookingSnapshot.exists) {
      return new Response(JSON.stringify({ error: 'Booking not found' }), {
        status: 404,
      })
    }

    // get booking data and asociated place
    const bookingData = bookingSnapshot.data()
    const placeRef = adminDb.collection('places').doc(bookingData.placeId)

    // update place available rooms by incrementing number of available rooms from the booking
    await placeRef.update({
      available_rooms: admin.firestore.FieldValue.increment(bookingData.rooms),
    })

   // delete the booking
    await bookingRef.delete()

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
    })
  } catch (error) {
    console.error('Error deleting booking:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete booking' }), {
      status: 500,
    })
  }
}

// PUT request handler
export async function PUT(req, { params }) {
    const { id } = params // get booking id
    const { rooms, checkInDate, nights, people } = await req.json() // parse the request body 
  
    try {
      // ref the spec booking doc in firestore
      const bookingRef = adminDb.collection('bookings').doc(id)
      const bookingSnapshot = await bookingRef.get() // fetch booking doc
  
      // if not exists return these
      if (!bookingSnapshot.exists) {
        return new Response(JSON.stringify({ error: 'Booking not found' }), {
          status: 404,
        })
      }
  
      // get booking data and ref associated to place
      const bookingData = bookingSnapshot.data()
      const placeRef = adminDb.collection('places').doc(bookingData.placeId)
  
      // fetch place document and check if exists
      const placeSnapshot = await placeRef.get();
      if (!placeSnapshot.exists) {
        return new Response(JSON.stringify({ error: 'Place not found' }), {
          status: 404,
        })
      }
  
      // calculate changes
      const placeData = placeSnapshot.data()
      const pricePerNight = placeData.price
  
      const roomDifference = rooms - bookingData.rooms

      await placeRef.update({
        available_rooms: admin.firestore.FieldValue.increment(-roomDifference),
      })
  
      const totalPrice = rooms * nights * pricePerNight;
  
      // update booking document
      await bookingRef.update({
        rooms,
        checkInDate,
        nights,
        people,
        totalPrice,
        updatedAt: new Date(), // timestamp for usdated date
      })
  
      // terurn success
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
      })
    } catch (error) {
      console.error('Error updating booking:', error);
      return new Response(JSON.stringify({ error: 'Failed to update booking' }), {
        status: 500,
      })
    }
  }