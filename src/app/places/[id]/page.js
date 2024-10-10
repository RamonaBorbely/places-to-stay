// This component displays detailed about a specific place when a user selects it from the search results
// ReultList has a View Details button, when clicked fetched each place details

'use client'

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/firebase/firebaseConfig";

const PlaceDetails = ({ params }) => {
  const [place, setPlace] = useState(null) // state for place details
  const [loading, setLoading] = useState(true) // loading state
  const [error, setError] = useState(null) // error state
  const router = useRouter()
  const placeId = params.id // extract place id from props

  useEffect(() => {
    // fetch place details by id
    const fetchPlaceDetails = async () => {
      try {
        const response = await fetch(`/api/places/${placeId}`)
        const data = await response.json()

        if (response.ok) {
          setPlace(data) // if ok update place state with the fetched data
        } else {
          setError(data.error || "Failed to load place details")
        }
      } catch (error) {
        setError("Failed to load place details")
        console.error(error)
      }
      setLoading(false) // stop loading
    }

    fetchPlaceDetails()
  }, [placeId]) // this effect runs when place id changes

  // handle book now
  const handleBook = () => {
    // check if user is authenticated
    if (!auth.currentUser) {
      router.push(`/login?redirect=/places/${placeId}/book`)
    } else {
      // if authenticated redirect to booking page
      router.push(`/places/${placeId}/book`)
    }
  }
  // render text from p element while loading
  if (loading) {
    return <p>Loading...</p>
  }

  // if error display the error
  if (error) {
    return <p>{error}</p>
  }

  return (
    <div className="w-1/4 text-left mx-auto mt-8 p-8 shadow-md">
      <h2 className="text-2xl font-semibold mb-4">{place.name}</h2>
      <p className='font-bold text-darkBlue'>Location: {place.location}</p>
      <p className='font-bold text-darkBlue'>Type: {place.type}</p>
      <p className='font-bold text-darkBlue'>Description: {place.description}</p>
      <p className='font-bold text-darkBlue'>Price per night: £{place.price}</p>
      <p className='font-bold text-darkBlue'>Amenities: {place.amenities.map(a => <span>{a} </span>)}</p>

      <button
        className="mt-6 bg-darkBlue text-light py-2 px-6 rounded-lg font-bold hover:scale-105 transition duration-300"
        onClick={handleBook}
      >
        Book Now
      </button>
    </div>
  );
};

export default PlaceDetails;
