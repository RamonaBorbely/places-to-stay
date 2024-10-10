import { db } from "./firebaseConfig.js"
import { addDoc, collection } from "firebase/firestore"

async function seedPlaces() {
    const places = [
    {
        name: "Holiday Hotel",
        location: "London",
        type: "hotel",
        availableRooms: {
            "2024-08-01": 5,
            "2024-08-01": 3,
            "2024-08-01": 3,
           
        },

        pricePerNight: 100,
    },

    {
        name: "The Guest Hostel",
        location: "Guilford",
        type: "hostel",
        availableRooms: {
            "2024-08-01": 4,
            "2024-08-01": 3,
            "2024-08-01": 3,
        },
        pricePerNight: 50,
    },

    {
        name: "Chertsey Campsite",
        location: "Chertsey",
        type: "campsite",
        availableRooms: {
            "2024-08-01": 10,
            "2024-08-01": 3,
            "2024-08-01": 3,
           
        },
        pricePerNight: 30
    }]

    for (const place of places) {
        try {
            const docRef = await addDoc(collection(db, 'places'), place)
            console.log('Document written with ID: ', docRef.id)
        } catch(e) {
            console.error('Error adding document: ', e)
        }
    }
}

// seedPlaces()
