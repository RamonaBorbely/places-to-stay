// 

import { db } from "@/firebase/firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";

export async function GET(req) {
    const { searchParams } = new URL(req.url) // parse url to access search parameters
    const location = searchParams.get('location')
    const type = searchParams.get('type')

    // location is required
    if(!location) {
        return new Response(JSON.stringify({ error: 'Location is required'}), {
            status: 400,
        })
    }

    try {
        // create firestore query to find places with the specified location
        let placesQuery = query(collection(db, 'places'), where('location', '==', location)) // only results with matching location

        // if type is specified, but is not required
        if(type) {
            placesQuery = query(placesQuery, where('type', '==', type)) // only results with matching type
        }
        // execute query and get matching documents
        const querySnapshot = await getDocs(placesQuery)

        // map over results to extract data and id
        const places = querySnapshot.docs.map( doc => ({
            id: doc.id, // add the document id
            ...doc.data(), // spread document data to contain all fields
        }))

        // return list of places as JSON
        return new Response(JSON.stringify(places), {
            status: 200,
        })
    } catch (error) {
        return new Response(JSON.stringify({error: 'Error while fetching Places'}), {
            status: 500,
        })
    }
}