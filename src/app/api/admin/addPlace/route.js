// Route where admin users send POST requests to add a new place

import { checkAdmin } from '@/middleware/checkAdmin' // middleware to verify admin access
import { db } from '@/firebase/firebaseConfig'
import { addDoc, collection } from 'firebase/firestore'

export async function POST(req) {
  // apply the admin check middleware to make sure only admins users can add places
  // it returns a response object if user not authorised (not admin user)
  const adminCheckResponse = await checkAdmin(req, () => {})

  // if the checkAdmin middleware return unauthorised, return 
  if (adminCheckResponse) {
    return adminCheckResponse
  }

  try {
    // deconstruct the request body to extract data
    const { name, location, type, price, total_rooms, available_rooms, amenities, description, image_URL } = await req.json();

    // add new place to firestore
    await addDoc(collection(db, 'places'), {
      name,
      location,
      type,
      price: Number(price), // convert to Number
      total_rooms: Number(total_rooms),
      available_rooms: Number(available_rooms),
      amenities,
      description,
      image_URL,
    })

    return new Response(JSON.stringify({ message: 'Place added successfully' }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error adding place:', error)
    return new Response(JSON.stringify({ error: 'Failed to add place' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
