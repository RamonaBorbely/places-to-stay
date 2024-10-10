/**
     Admin Booking Management API
 
  This file contains API route handlers for managing bookings associated with users
  The handlers allow admin users to view, delete, and update bookings, ensuring that
  only authorised admin users have access to these sensitive operations
 
  The handlers interact with Firestore to perform CRUD operations on bookings and 
  update the available rooms in the corresponding places when bookings are modified or deleted
 
    Endpoints
  - GET `/api/admin/bookings/[id]`: Fetch bookings for a specific user by user ID (admin only)
  - DELETE `/api/admin/bookings/[id]`: Delete a booking by its ID and adjust the room count (admin only)
  - PUT `/api/admin/bookings/[id]`: Update booking details by its ID and adjust room availability (admin only)
 
  SECURITY:
 - All handlers use the `checkAdmin` middleware to ensure that only admins can perform these operations.

  Error Handling:
  Proper error handling is in place to ensure meaningful error messages and status codes are returned in case of failures
 */

import { checkAdmin } from '@/middleware/checkAdmin';
import { db } from '@/firebase/firebaseConfig';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { adminDb, admin } from '@/firebase/firebaseAdminConfig'; 

// GET request handler
export async function GET(req, { params }) {
  const { id } = params // get user id from request parameters

  console.log('Fetching bookings for userId:', id) // for debuging purpose
  // admin role check middleware to ensure only admins can access this route
  const adminCheckResponse = await checkAdmin(req, () => {})

  if (adminCheckResponse) {
    return adminCheckResponse
  }

  try {
    // create query to fetch bookings where user id matcjes the id
    const bookingsQuery = query(
      collection(db, 'bookings'),
      where('userId', '==', id)
    )

    // execute the query
    const bookingsSnapshot = await getDocs(bookingsQuery)

    // map over results to get data and id
    const bookings = bookingsSnapshot.docs.map((doc) => ({
      id: doc.id, // inculde doc id 
      ...doc.data(), // spread the doc to contain all fields
    }))

    // return the list of bookings
    return new Response(JSON.stringify(bookings), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return new Response(JSON.stringify({ error: 'Failed to fetch bookings' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

// DELETE request handler
export async function DELETE(req, { params }) {
  const { id } = params // get booking id from req params

  // Ensure again user is an admin
  const adminCheckResponse = await checkAdmin(req, () => {})

  if (adminCheckResponse) {
    return adminCheckResponse // Respond if the check fails
  }

  try {
    // ref to spec booking doc with id
    const bookingRef = adminDb.collection('bookings').doc(id)
    const bookingSnapshot = await bookingRef.get()

    // send status code 404 and message Booking not found
    if (!bookingSnapshot.exists) {
      return new Response(JSON.stringify({ error: 'Booking not found' }), {
        status: 404,
      })
    }

    // get booking data and ref to associated place
    const bookingData = bookingSnapshot.data();
    const placeRef = adminDb.collection('places').doc(bookingData.placeId);

    // update available rooms by increment the no of rooms from the booking
    await placeRef.update({
      available_rooms: admin.firestore.FieldValue.increment(bookingData.rooms),
    })

    // delete that booking
    await bookingRef.delete()

    // return success
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
    })
  } catch (error) { 
    console.error('Error deleting booking:', error)
    return new Response(JSON.stringify({ error: 'Failed to delete booking' }), {
      status: 500,
    })
  }
}


// PUT request handler to update booking details by its id
export async function PUT(req, { params }) {
  const { id } = params// get booking id from request parameters
  const { rooms, checkInDate, nights, people } = await req.json() // parse req body to get booking details

  // Ensure the user is an admin
  const adminCheckResponse = await checkAdmin(req, () => {});

  // ensure user is admin again
  if (adminCheckResponse) {
    return adminCheckResponse // Respond if the check fails
  }

  try {
    const bookingRef = adminDb.collection('bookings').doc(id) //ref to specific booking with that id
    const bookingSnapshot = await bookingRef.get() // fetch booking document

    // if no bookings return booking not found and status code 404
    if (!bookingSnapshot.exists) {
      return new Response(JSON.stringify({ error: 'Booking not found' }), {
        status: 404,
      })
    }
    // get booking data and reference the associated place
    const bookingData = bookingSnapshot.data()
    const placeRef = adminDb.collection('places').doc(bookingData.placeId)

    // fetch place document as well
    const placeSnapshot = await placeRef.get()

    // if not exists return Place not found and status code 404
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
    // calculate total price
    const totalPrice = rooms * nights * pricePerNight;

    // update booking document with new details
    await bookingRef.update({
      rooms,
      checkInDate,
      nights,
      people,
      totalPrice,
      updatedAt: new Date(), // date timestamp
    })

    // return success response
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
    })
  } catch (error) {
    console.error('Error updating booking:', error)
    return new Response(JSON.stringify({ error: 'Failed to update booking' }), {
      status: 500,
    })
  }
}
