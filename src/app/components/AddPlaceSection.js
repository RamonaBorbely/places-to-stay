// i havent decalred this compoment 'use client' and works


import { useState, useEffect } from "react";
import { auth } from '@/firebase/firebaseConfig';

const AddPlaceSection = () => {
    const [name, setName] = useState('') // state for place name
    const [location, setLocation] = useState('') //  // state for place location
    const [type, setType] = useState('hotel')  // state for place type
    const [price, setPrice] = useState(undefined)  // state for place price
    const [totalRooms, setTotalRooms] = useState(undefined)  // state for place total rooms
    const [availableRooms, setAvailableRooms] = useState(undefined)  // state for place available rooms
    const [amenities, setAmenities] = useState([])  // state for place amenities
    const [description, setDescription] = useState('')  // state for place description
    const [imageURL, setImageURL] = useState('')
    const [error, setError] = useState(null)  // error state for form submission
    const [success, setSuccess] = useState(null) //state for success
    const [isAdmin, setIsAdmin] = useState(false)
    const [loading, setLoading] = useState(true)

      // useEffect to check if the user is an admin when the component mounts
    useEffect(() => {
      const checkIfAdmin = async () => {
        try {
          // Fetch the admin check API endpoint with authorisation token
          const response = await fetch('/api/admin/checkRole', {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${await auth.currentUser.getIdToken()}`, // token for authorisation
            },
          })

        // If the response is not ok, set the error and stop further actions
        if (!response.ok) {
          const { error } = await response.json();
          setError(error || 'Access denied');
          setLoading(false);
          return;
        }

        // If the user is confirmed as an admin, update the state
        setIsAdmin(true);
      } catch (error) {
        console.error('Error checking admin role:', error)
        setError('Failed to verify admin status')
      } finally {
        setLoading(false) // Stop loading 
      }
    }

    checkIfAdmin() // Call the admin check function
  }, [])
  
    // handle add a new place
    const handleAddPlace = async (e) => {
      e.preventDefault() // prevent page reload 
      setError(null) // clear any errors
      setSuccess(null) // clear any success messages
  
      try {
        // send a POST request to api endpoint to add a new place
        const response = await fetch('/api/admin/addPlace', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${await auth.currentUser.getIdToken()}`, // add authorisation token for secure access
          },
          body: JSON.stringify({ // body containing data
            name,
            location,
            type,
            price: Number(price), // convert some inputs to Number
            total_rooms: Number(totalRooms),
            available_rooms: Number(availableRooms),
            amenities,
            description,
            image_URL: imageURL,
          }),
        })
  
        // if server response not ok
        if (!response.ok) {
          const { error } = await response.json()
          throw new Error(error || 'Failed to add place') // throw error 
        }
  
        setSuccess('Place added successfully') // set a text to indicate success
        // Reset form fields
        setName('');
        setLocation('');
        setType('hotel');
        setPrice('');
        setTotalRooms(0);
        setAvailableRooms(0);
        setAmenities([]);
        setDescription('');
        setImageURL('');
      } catch (error) {
        // handle any errors during request
        console.error('Error adding place:', error);
        setError(error.message || 'Failed to add place. Please try again.');
      }
    }

     // Render loading state while checking admin status
    if (loading) {
      return <p>Loading...</p>
    }

    // Render error message if the user is not an admin or if any other error occurs
    if (!isAdmin) {
      return <p className="text-red-600">{error}</p>
    }
  
    return (
      <div className="bg-lightSecondary p-6 rounded-md w-2/4 mx-auto">
        <h2 className="text-2xl font-bold text-dark mb-4">Add a New Place</h2>

        {/* if error or successis true display error or success mesage */}
        {error && <p className="text-red-600 text-center text-xl font-bold">{error}</p>}
        {success && <p className="text-green-600 text-center text-xl font-bold">{success}</p>}
  
        {/* form to add a new place */}
        <form onSubmit={handleAddPlace} className="space-y-4">
          {/* Form Fields */}
          <input
            type="text"
            placeholder="Place Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full text-dark py-2 px-4 border border-dark rounded"
            required
          />
  
          <input
            type="text"
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full text-dark py-2 px-4 border border-dark rounded"
            required
          />
  
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full text-dark py-2 px-4 border border-dark rounded"
            
          >
            <option value="hotel">Hotel</option>
            <option value="hostel">Hostel</option>
            <option value="campsite">Campsite</option>
          </select>
  
          <input
            type="number"
            placeholder="Price per night"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full text-dark py-2 px-4 border border-dark rounded"
            required
          />

          <input
            type="number"
            placeholder="Total Rooms"
            value={totalRooms}
            onChange={(e) => setTotalRooms(e.target.value)}
            className="w-full text-dark py-2 px-4 border border-dark rounded"
            required
          />

          <input
            type="number"
            placeholder="Available Rooms"
            value={availableRooms}
            onChange={(e) => setAvailableRooms(e.target.value)}
            className="w-full text-dark py-2 px-4 border border-dark rounded"
            required
          />
  
          <input
            type="text"
            placeholder="Amenities (comma-separated)"
            value={amenities.join(', ')}
            onChange={(e) => setAmenities(e.target.value.split(',').map((item) => item.trim()))}
            className="w-full text-dark py-2 px-4 border border-dark rounded"
          />
  
          <input
            type="text"
            placeholder="Image URL"
            value={imageURL}
            onChange={(e) => setImageURL(e.target.value)}
            className="w-full text-dark py-2 px-4 border border-dark rounded"
          />
  
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full text-dark py-2 px-4 border border-dark rounded"
          ></textarea>
  
          <button
            type="submit"
            className="w-full bg-purple hover:bg-darkBlue text-light py-3 rounded-lg transition duration-300"
          >
            Add Place
          </button>
        </form>
      </div>
    );
  };
  
  export default AddPlaceSection