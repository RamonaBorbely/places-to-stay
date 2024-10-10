
'use client' // indicates that is a CSC

import { useState, useEffect } from 'react'
import { auth } from '@/firebase/firebaseConfig'

const ManageBookingsSection = () => {
  const [users, setUsers] = useState([]) // state with list of users
  const [selectedUserId, setSelectedUserId] = useState(null) // state to track selected user id
  const [bookings, setBookings] = useState([]) // state to store a list of bookings of the selected user
  const [error, setError] = useState(null) // state for errors
  const [editingBooking, setEditingBooking] = useState(null) // state to manage the current booking that is being edited
  const [loading, setLoading] = useState(true) // manage loading state
  const [isAdmin, setIsAdmin] = useState(false) // state to track if user is admin

  useEffect(() => {
    // Function to check if the user is an admin
    const checkIfAdmin = async () => {
      try {
        // Fetch the admin check API 
        const response = await fetch('/api/admin/checkRole', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${await auth.currentUser.getIdToken()}`, // Add the user token
          },
        })

        // If the response is not ok, set the error and loadin state and return 
        if (!response.ok) {
          const { error } = await response.json()
          setError(error || 'Access denied')
          setLoading(false)
          return
        }

        // If the user is as admin, update the state
        setIsAdmin(true)
      } catch (error) {
        console.error('Error checking admin role:', error)
        setError('Failed to verify admin status')
      } finally {
        setLoading(false) // Stop loading regardless of the outcome
      }
    }

    checkIfAdmin()
  }, [])

  useEffect(() => {
    if (!isAdmin) return // Fetch users only if the user is admin

    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/admin/viewUsers', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${await auth.currentUser.getIdToken()}`,
          },
        })

        // handle errors 
        if (!response.ok) {
          const { error } = await response.json()
          throw new Error(error || 'Failed to fetch users')
        }

        const usersData = await response.json()
        // filter to get just normal users, not include admin users
        const normalUsers = usersData.filter((user) => user.role !== 'admin')
        setUsers(normalUsers) // update users state with normal users
      } catch (error) {
        console.error('Error fetching users:', error)
        setError('Failed to load users')
      }
    }

    fetchUsers()
  }, [isAdmin]) // run component again if isAdmin changes
  
       
// fetch bookings for selected user
  const fetchUserBookings = async (userId) => {
    try {
      setError(null) // clear any previous errors
      setBookings([]) // Reset bookings state

      // get request
      const response = await fetch(`/api/admin/viewUsers/${userId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${await auth.currentUser.getIdToken()}`, // add token
        },
      })

      // handle errors
      if (!response.ok) {
        const { error } = await response.json()
        throw new Error(error || 'Failed to fetch bookings')
      }

      const bookingsData = await response.json()
      setBookings(bookingsData) // update booking state
      setSelectedUserId(userId) // set the select user is
    } catch (error) {
      console.error('Error fetching bookings:', error)
      setError('Failed to load bookings')
    }
  }

  // handle click on edit button 
  const handleEditClick = (booking) => {
    setEditingBooking(booking) // set the selected booking to be edited
  }

  // handle submit
  const handleEditSubmit = async (e) => {
    e.preventDefault()

    // destructure fileds from editingBooking
    const { id, rooms, checkInDate, nights, people } = editingBooking;

    try {
      // send PUT request to update the booking with new edited data
      const response = await fetch(`/api/admin/viewUsers/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${await auth.currentUser.getIdToken()}`,
        },
        body: JSON.stringify({ rooms, checkInDate, nights, people }), // updated details in the request body
      })

      // handle success
      if (response.ok) {
        const updatedBooking = await response.json()
        setBookings((prev) =>
          prev.map((booking) =>
            booking.id === updatedBooking.id ? updatedBooking : booking // update bookings state with edited booking
          )
        )
        setEditingBooking(null) // clear edit state after success
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to update booking')
      }
      // handle error
    } catch (error) {
      console.error('Error updating booking:', error)
      setError('Error updating booking')
    }
  }

  // handle delete
  const handleDelete = async (bookingId) => {
    try {
      // send DELETE request to server 
      const response = await fetch(`/api/admin/viewUsers/${bookingId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${await auth.currentUser.getIdToken()}`,
        },
      })

      // handle success
      if (response.ok) {
        // remove the deleted booking usding filter method
        setBookings(bookings.filter((booking) => booking.id !== bookingId)) 
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to delete booking')
      }
    } catch (error) {
      console.error('Error deleting booking:', error)
      setError('Error deleting booking')
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditingBooking((prev) => ({ ...prev, [name]: value }))
  }

  // while checks status
  if (loading) {
    return <p>Loading...</p>
  }

  // Render error message if the user is not an admin or if any other error occurs
  if (error) {
    return <p className="text-red-600">{error}</p>
  }

  return (
    <div className="bg-lightSecondary p-6 rounded-md mt-8">
      <h2 className="text-2xl font-bold text-dark mb-8 text-center">Manage Bookings</h2>
      {error && <p className="text-red-600 mb-4">{error}</p>}

      {/* User Selection */}
      <div className="mb-6 flex flex-col items-center p-8 gap-4">
        <h3 className="text-xl font-bold text-dark text-center">Select a User</h3>
        <ul className="space-y-2">
          {users.map(user => (
            <li key={user.id} className="flex items-center justify-center">
              <span className="text-dark font-bold text-xl">{user.name}</span>
              <button
                onClick={() => fetchUserBookings(user.id)}
                className="ml-4 px-3 py-1 bg-purple text-light rounded hover:scale-105 transition font-bold"
              >
                View Bookings
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Bookings List */}
      {selectedUserId && (
        <div>
       
          {/* if there are booking map thru them and display */}
          {bookings.length > 0 ? (
            <ul className="flex flex-wrap justify-center items-center gap-4">
              {bookings.map(booking => (
                <li
                  key={booking.id}
                  className="p-4 border border-gray-300 rounded-md shadow-sm bg-light"
                >
                  <h4 className="font-semibold text-lg text-dark mb-2">
                    {booking.placeName}
                  </h4>
                  <p className="text-dark">Check-in Date: {booking.checkInDate}</p>
                  <p className="text-dark">Nights: {booking.nights}</p>
                  <p className="text-dark">People: {booking.people}</p>
                  <p className="text-dark">Rooms: {booking.rooms}</p>
                  <p className="text-dark">Total Price: £{booking.totalPrice}</p>
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => handleEditClick(booking)}
                      className="bg-purple text-light px-4 py-2 rounded hover:bg-darkBlue transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(booking.id)}
                      className="bg-red-600 text-light px-4 py-2 rounded hover:bg-red-700 transition"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            // if no bokings, meaning bokkings length < 0 
            <p className="text-dark">No bookings found for this user</p>
          )}
        </div>
      )}

      {/* Edit the selected booking  */}
      {editingBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <form
            className="bg-light p-6 rounded shadow-md w-full max-w-md"
            onSubmit={handleEditSubmit}
          >
            <h2 className="text-xl mb-4 text-dark font-semibold">Edit Booking</h2>
            {/* Form Fields */}
            <label className="block mb-2 text-dark">
              Rooms:
              <input
                type="number"
                name="rooms"
                value={editingBooking.rooms}
                onChange={handleInputChange}
                className="border border-gray-300 rounded p-2 w-full mt-1"
              />
            </label>
            <label className="block mb-2 text-dark">
              Check-in Date:
              <input
                type="date"
                name="checkInDate"
                value={editingBooking.checkInDate}
                onChange={handleInputChange}
                className="border border-gray-300 rounded p-2 w-full mt-1"
              />
            </label>
            <label className="block mb-2 text-dark">
              Nights:
              <input
                type="number"
                name="nights"
                value={editingBooking.nights}
                onChange={handleInputChange}
                className="border border-gray-300 rounded p-2 w-full mt-1"
              />
            </label>
            <label className="block mb-2 text-dark">
              People:
              <input
                type="number"
                name="people"
                value={editingBooking.people}
                onChange={handleInputChange}
                className="border border-gray-300 rounded p-2 w-full mt-1"
              />
            </label>
            <div className="flex gap-2 mt-4">
              <button
                type="submit"
                className="bg-green-600 text-light px-4 py-2 rounded hover:bg-green-700 transition"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setEditingBooking(null)}
                className="bg-gray-500 text-light px-4 py-2 rounded hover:bg-gray-600 transition"
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

export default ManageBookingsSection;
