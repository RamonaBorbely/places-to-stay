
'use client'

import { useState, useEffect } from 'react'
import { auth } from '@/firebase/firebaseConfig'

const ManagePlacesSection = () => {
  const [places, setPlaces] = useState([])
  const [error, setError] = useState(null)
  const [editingPlace, setEditingPlace] = useState(null)

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const response = await fetch('/api/places', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${await auth.currentUser.getIdToken()}`,
          },
        })

        if (!response.ok) {
          const { error } = await response.json();
          throw new Error(error || 'Failed to fetch places')
        }

        const placesData = await response.json()
        setPlaces(placesData);
      } catch (error) {
        console.error('Error fetching places:', error)
        setError('Failed to load places')
      }
    };

    fetchPlaces()
  }, [])

  const handleEditClick = (place) => {
    setEditingPlace(place)
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault()

    const {
      id,
      name,
      location,
      type,
      price,
      total_rooms,
      available_rooms,
      amenities,
      description,
      image_URL,
    } = editingPlace

    try {
      const response = await fetch(`/api/places/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${await auth.currentUser.getIdToken()}`,
        },
        body: JSON.stringify({
          name,
          location,
          type,
          price: Number(price),
          total_rooms: Number(total_rooms),
          available_rooms: Number(available_rooms),
          amenities,
          description,
          image_URL,
        }),
      })

      if (response.ok) {
        // Update the place in the state
        const updatedPlace = await response.json();
        setPlaces((prev) =>
          prev.map((place) => (place.id === updatedPlace.id ? updatedPlace : place))
        )
        setEditingPlace(null)
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to update place')
      }
    } catch (error) {
      console.error('Error updating place:', error)
      setError('Error updating place')
    }
  };

  const handleDelete = async (placeId) => {
    try {
      const response = await fetch(`/api/places/${placeId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${await auth.currentUser.getIdToken()}`,
        },
      });

      if (response.ok) {
        setPlaces(places.filter((place) => place.id !== placeId))
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to delete place')
      }
    } catch (error) {
      console.error('Error deleting place:', error)
      setError('Error deleting place')
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditingPlace((prev) => ({ ...prev, [name]: value }))
  };

  return (
    <div className='mx-auto w-full items-center gap-4 mt-8'>
      <h2 className="text-2xl font-bold text-dark text-center mb-8">Manage Places</h2>
      {error && <p className="text-red-600 font-bold text-xl mb-4 text-center">{error}</p>}
      <ul className="space-y-4 flex flex-wrap gap-4 shadow-inner shadow bg-light p-8">
        {places.map((place) => (
          <li
            key={place.id}
            className="p-4 border border-gray-300 rounded-md shadow-sm bg-lightSecondar w-60 flex flex-col justify-center hover:bg-neutral hover:scale-110 shadow-lg"
          >
            <h3 className="font-semibold text-lg text-dark mb-2">{place.name}</h3>
            <p className="text-dark">Location: {place.location}</p>
            <p className="text-dark">Type: {place.type}</p>
            <p className="text-dark">Price per night: £{place.price}</p>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => handleEditClick(place)}
                className="bg-purple text-light px-4 py-2 rounded hover:bg-darkBlue transition"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(place.id)}
                className="bg-red-600 text-light px-4 py-2 rounded hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>

      {editingPlace && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <form
            className="bg-light p-6 rounded shadow-md w-full max-w-lg"
            onSubmit={handleEditSubmit}
          >
            <h2 className="text-xl mb-4 text-dark font-semibold">Edit Place</h2>
            {/* Form Fields */}
            <input
              type="text"
              name="name"
              value={editingPlace.name}
              onChange={handleInputChange}
              className="w-full text-dark py-2 px-4 border border-dark rounded mb-4"
            />
            <input
              type="text"
              name="location"
              value={editingPlace.location}
              onChange={handleInputChange}
              className="w-full text-dark py-2 px-4 border border-dark rounded mb-4"
            />
            <select
              name="type"
              value={editingPlace.type}
              onChange={handleInputChange}
              className="w-full text-dark py-2 px-4 border border-dark rounded mb-4"
            >
              <option value="hotel">Hotel</option>
              <option value="hostel">Hostel</option>
              <option value="campsite">Campsite</option>
            </select>
            <input
              type="number"
              name="price"
              value={editingPlace.price}
              onChange={handleInputChange}
              className="w-full text-dark py-2 px-4 border border-dark rounded mb-4"
            />
            <input
              type="number"
              name="total_rooms"
              value={editingPlace.total_rooms}
              onChange={handleInputChange}
              className="w-full text-dark py-2 px-4 border border-dark rounded mb-4"
            />
            <input
              type="number"
              name="available_rooms"
              value={editingPlace.available_rooms}
              onChange={handleInputChange}
              className="w-full text-dark py-2 px-4 border border-dark rounded mb-4"
            />
            <input
              type="text"
              name="amenities"
              value={Array.isArray(editingPlace.amenities) ? editingPlace.amenities.join(', ') : ''}
              onChange={(e) =>
                setEditingPlace((prev) => ({
                  ...prev,
                  amenities: e.target.value.split(',').map((item) => item.trim()),
                }))
              }
              className="w-full text-dark py-2 px-4 border border-dark rounded mb-4"
            />
            <input
              type="text"
              name="image_URL"
              value={editingPlace.image_URL}
              onChange={handleInputChange}
              className="w-full text-dark py-2 px-4 border border-dark rounded mb-4"
            />
            <textarea
              name="description"
              value={editingPlace.description}
              onChange={handleInputChange}
              className="w-full text-dark py-2 px-4 border border-dark rounded mb-4"
            ></textarea>
            <div className="flex gap-2 mt-4">
              <button
                type="submit"
                className="bg-green-600 text-light px-4 py-2 rounded hover:bg-green-700 transition"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setEditingPlace(null)}
                className="bg-gray-500 text-light px-4 py-2 rounded hover:bg-gray-600 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

export default ManagePlacesSection;
