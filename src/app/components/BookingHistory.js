'use client'; // indicates that is a client side component

// react hooks for state and side effects import statements
import { useState, useEffect } from 'react'; 
import { auth } from '@/firebase/firebaseConfig';

// component that show and manage bokkings for loged in users
const BookingHistory = ({ userId }) => {
  const [bookings, setBookings] = useState([])   // state for list of bookings NO MORE NEED FOR IT
  const [loading, setLoading] = useState(true) // loading state while fetching data
  const [error, setError] = useState(null) // error state for fetching, update or deleting 
  const [editingBooking, setEditingBooking] = useState(null)  // state to track which booking is edited

  // fetch bookings in useEffect hook
  useEffect(() => {
    // function that fetches data
    const fetchBookings = async () => {
      try {
        // fetch data from api endpoint with userId as query parameter
        const response = await fetch(`/api/bookings?userId=${userId}`)
        const data = await response.json()

        if (response.ok) {
          // if response is success, update bookings state
          setBookings(data)
        } else {
          // set error in case something went wrong
          setError(data.error || 'Failed to fetch bookings')
        }
      } catch (error) {
        // catches and set the error that happens during fetching
        setError('Error fetching bookings')
        // this should be removed. It logs errors in case of any
        console.error(error)
      } finally {
        // set loading false after the fetching is completed, even if it's success or failure
        setLoading(false)
      }
    }
// call the function
    fetchBookings()
  }, [userId]) // userId in dependency array if userId changes

  // handle function to delete booking
  const handleDelete = async (bookingId) => {
    try {
      // get current users token for authorisation so we dont have too much vulnerabilities
      const token = await auth.currentUser.getIdToken();

      // Send a DELETE request to "server" to delete the booking
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`, // add the current user token in headers
        }
      })

      // if success
      if (response.ok) {
        // remove the booking with bookingId from bookings state
        setBookings(bookings.filter((booking) => booking.id !== bookingId))
      } else {
        // set error state 
        const data = await response.json()
        setError(data.error || 'Failed to delete booking')
      }
    } catch (error) {
      // catch errors that happens while deleting booking
      console.error('Error deleting booking:', error) // just to log, usually is removed
      setError('Error deleting booking')
    }
  }

  // handle function when edit is clicked
  const handleEditClick = (booking) => {
    setEditingBooking(booking)
  }

  // handle function for edit aka Update
  const handleEditSubmit = async (e) => {
    e.preventDefault(); // preventing submiting and refreshing. its a browser behavior with forms

    // deconstruct from editingBooking state
    const { id, rooms, checkInDate, nights, people } = editingBooking;

    try {
      // get current users token for authorisation. 
      const token = await auth.currentUser.getIdToken()

      // send a PUT request with new data
      const response = await fetch(`/api/bookings/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // add the current user token in headers
        },
        body: JSON.stringify({ rooms, checkInDate, nights, people }), // send these updated booking details in request body
      })

      // if success do these
      if (response.ok) {
        // update the bookings state with the new details
        const updatedBooking = await response.json()
        setBookings( prev =>
          prev.map( booking =>
            booking.id === updatedBooking.id ? updatedBooking : booking
          )
        )
        // clear editing state
        setEditingBooking(null)
      } else {
        // otherview set the error state to with server error or string text
        const data = await response.json()
        setError(data.error || 'Failed to update booking')
      }
    } catch (error) {
      // catch and set error
      console.error('Error updating booking:', error) // this should be removed
      setError('Error updating booking')
    }
  }

  // handler for input chages in form inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target; // deconstruct name and val
    setEditingBooking((prev) => ({ ...prev, [name]: value })) // update the editingBooking state with new vals
  }

  // dwhile loading is true display text from p element
  if (loading) {
    return <p>Loading bookings...</p>
  }

  // if error is true, meaning an error occured, display it
  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="flex flex-col items-center justify-center w-2/4">
      <h2 className="underline tracking-wider">Your Bookings</h2>
      <ul className="flex gap-6">

        {/* maps thru bookings */}
        {bookings.map(booking => (
          <li key={booking.id} className="mt-4 border border-darkBlue p-6 rounded-lg shadow-md tracking-wide">
            <p className='font-bold text-darkBlue'>Place: <span className='font-semibold text-dark'>{booking.placeName}</span></p>
            <p className='font-bold text-darkBlue'>Rooms: <span className='font-semibold text-dark'>{booking.rooms}</span></p>
            <p className='font-bold text-darkBlue'>Checkin date: <span>{booking.checkInDate}</span></p>
            <p className='font-bold text-darkBlue'>People: <span className='font-semibold text-dark'>{booking.people}</span></p>
            <p className='font-bold text-darkBlue'>Nights: <span className='font-semibold text-dark'>{booking.nights}</span></p>
            <p className='font-bold text-darkBlue'>Total price: <span className='font-semibold text-dark'>£{booking.totalPrice}</span></p>
            <p className='font-bold text-darkBlue'>Status: <span className='font-semibold text-dark'>{booking.status}</span></p>

            {/* edit and delete buttons with onClick events and handlers function from above pass to events */}
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => handleEditClick(booking)}
                className="bg-darkBlue text-light px-4 py-2 rounded hover:scale-105 transition tracking-wider"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(booking.id)}
                className="bg-red-600 text-light px-4 py-2 rounded hover:scale-105 transition tracking-wider"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>

      {/* if editingBooking is true show div */}
      {editingBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <form
            className="bg-white p-6 rounded shadow-md"

            // function handleEditSubmit pass to on submit event inside form
            onSubmit={handleEditSubmit} 
          >
            <h2 className="text-xl mb-4">Edit Booking</h2>
            <label className="block mb-2">
              Rooms:
              <input
                type="number"
                name="rooms"
                value={editingBooking.rooms}
                onChange={handleInputChange}
                className="border border-gray-300 rounded p-2 w-full"
              />
            </label>
            <label className="block mb-2">
              Check-in Date:
              <input
                type="date"
                name="checkInDate"
                value={editingBooking.checkInDate}
                onChange={handleInputChange}
                className="border border-gray-300 rounded p-2 w-full"
              />
            </label>
            <label className="block mb-2">
              Nights:
              <input
                type="number"
                name="nights"
                value={editingBooking.nights}
                onChange={handleInputChange}
                className="border border-gray-300 rounded p-2 w-full"
              />
            </label>
            <label className="block mb-2">
              People:
              <input
                type="number"
                name="people"
                value={editingBooking.people}
                onChange={handleInputChange}
                className="border border-gray-300 rounded p-2 w-full"
              />
            </label>
            <div className="flex gap-2 mt-4">
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setEditingBooking(null)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default BookingHistory;
