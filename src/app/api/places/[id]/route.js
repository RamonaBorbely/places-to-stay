/**
 
  This file contains API route handlers for interactng with places collection
  in Firestore. The handlers include functionality for:
 
  GET Fetching the details of a specific place by its id
  PUT Updating the details of a specific place by its id, accessible only to admins
  DELETE Deleting a specific place by its id, accessible only to admins
 
  The routes are protected with an admin check middleware to ensure only authorised users can perform
  update and delete operations. The endpoints use Firebase Admin SDK to authenticate users and interact
  with Firestore
 * 
  Endpoints:
   - GET `/api/places/[id]`: Fetch details of a place by id.
   - PUT `/api/places/[id]`: Update a place by id (admin only).
   - DELETE `/api/places/[id]`: Delete a place by id (admin only).

 */


import { db } from "@/firebase/firebaseConfig" // import firestore db config
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore" // import firestore methods for interacting with documents
import { checkAdmin } from "@/middleware/checkAdmin"
import { adminDb } from "@/firebase/firebaseAdminConfig"

// GET request handler to fetch a place details
export async function GET(req, {params}) {
    const { id } = params // get the pace id from the request parameters

    try {
        const docRef = doc(db, 'places', id) // reference to the speciffic place document in firestore
        const docSnap = await getDoc(docRef) // fetch document snapshot

        // if document doesnt exists respond with status 404 and error message Place not found
        if(!docSnap.exists()) {
            return new Response(JSON.stringify({ error: 'Place not found'}), {
                status: 404,
            })
        }

        // create the place object with document id and its data and respond with status code 200
        const place = {id: docSnap.id, ...docSnap.data()}
        return new Response(JSON.stringify(place), {
            status: 200
        })
    } catch (error) {
        console.log("Error fetching place:", error) // log errors
        //return error response if fetching the place details fails
        return new Response(JSON.stringify({ error: "Failed to fetch place details"}), {
            status: 500
        })
    }
}

// PUT request handler to update a place details
export async function PUT(req, { params }) {
    const { id } = params
  
    // Apply the admin check middleware
    const adminCheckResponse = await checkAdmin(req, () => {})
    if (adminCheckResponse) {
      return adminCheckResponse
    }
  
    try {
      const updatedData = await req.json()
      const docRef = doc(db, 'places', id)
  
      // update the place document
      await updateDoc(docRef, updatedData)

      // fetch the updated document
      const updatedDoc = await getDoc(docRef)
      const updatedPlace = { id: updatedDoc.id, ...updatedDoc.data() }
  
      // return the updated details
      return new Response(JSON.stringify(updatedPlace), {
        status: 200,
      });
    } catch (error) {
      console.error('Error updating place:', error);
      return new Response(JSON.stringify({ error: 'Failed to update place' }), {
        status: 500,
      })
    }
  }  
  
  // DELETE request handler to delete a place
  export async function DELETE(req, { params }) {
    const { id } = params // get place ID from equest parameters
  
    // apply the admin check middleware
    const adminCheckResponse = await checkAdmin(req, () => {})
    if (adminCheckResponse) {
      return adminCheckResponse; // return response if admin check fails
    }
  
  
    try {
      // check if the place has bookings, so it cant be deleted
      const bookingsQuery = adminDb.collection('bookings').where('placeId', '==', id)
      const bookingsSnapshot = await bookingsQuery.get() // fetch bookings that match query
  
      // if place has bookings, dont delete the place
      if (!bookingsSnapshot.empty) {
        return new Response(
          JSON.stringify({
            error: 'Cannot delete this place because it has bookings.', 
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        )
      }
  
      const placeRef = adminDb.collection('places').doc(id)
  
      // delete the place document
      await placeRef.delete() // delete from frirestore Admin SDK
  
      // return success if the place was deleted 
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    } catch (error) {
      console.error('Error deleting place:', error)
      return new Response(JSON.stringify({ error: 'Failed to delete place' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }
  }
  