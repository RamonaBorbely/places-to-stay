// This component gallow users to book a place

'use client'

// import hooks and firebase auth from config
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { auth } from "@/firebase/firebaseConfig"


const BookPlace = ({ params }) => {
  const [rooms, setRooms] = useState(1) // state for no of rooms to book. default=1
  const [checkInDate, setCheckInDate] = useState('2024-08-01') // state for check in date. default 1st Aug
  const [nights, setNights] = useState(1) // state for no of nights to book. 
  const [people, setPeople] = useState(1) // // state for no of people to book. 
  const [message, setMessage] = useState('') // state to display mesages to users
  const router = useRouter() // hook for natigation

  // if users are not authenticated redirect them to login page
  useEffect(() => {
    if (!auth.currentUser) {
      router.push('/login')
    }
  }, [router])

  // handle booking
  const handleBooking = async (e) => {
    e.preventDefault()
    if (!params.id) return // if no place id, return

    try {
      // get the current user id token for authorisation
      const currentUser = auth.currentUser
      const idToken = await currentUser.getIdToken()

      // send post request 
      const response = await fetch(`/api/book/${params.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`, // pass token id
        },
        body: JSON.stringify({ rooms, checkInDate, nights, people }), // send booking details in req body
      })

      const result = await response.json() // parse respons as json

      if (response.ok) {
        // if success show this message
        setMessage({ type: 'success', text: 'Booking confirmed' });

        // redirect to userP after 2 seconds so users get the chance to read message
        setTimeout(() => {
          router.push('/userP')
        }, 2000)
      } else {
        setMessage({ type: 'error', text: `Booking failed: ${result.error}` })
      }
    } catch (error) {
      console.error('Booking error', error)
      setMessage({ type: 'error', text: 'Booking failed' })
    }
  }

  return (
    <div className="w-full max-w-lg mx-auto mt-8 p-4 bg-light rounded-lg shadow-md tracking-wider">
      <h2 className="text-2xl font-semibold mb-4">Book Your Stay</h2>
      {/* display error or success message */}
      {message && (
        <p className={`mb-4 ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
          {message.text}
        </p>
      )}
      <form onSubmit={handleBooking}>
        <div className="mb-4">
          <label className="block mb-2">Select Check-in Date:</label>
          <select
            value={checkInDate}
            onChange={(e) => setCheckInDate(e.target.value)}
            className="w-full p-2 border rounded"
            required
          >
            <option value="2024-08-01">1 August 2024</option>
            <option value="2024-08-02">2 August 2024</option>
            <option value="2024-08-03">3 August 2024</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block mb-2">Number of Nights:</label>
          <input
            type="number"
            value={nights}
            onChange={(e) => setNights(e.target.value)}
            className="w-full p-2 border rounded"
            min="1"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2">Number of Rooms:</label>
          <input
            type="number"
            value={rooms}
            onChange={(e) => setRooms(e.target.value)}
            className="w-full p-2 border rounded"
            min="1"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2">Number of People:</label>
          <input
            type="number"
            value={people}
            onChange={(e) => setPeople(e.target.value)}
            className="w-full p-2 border rounded"
            min="1"
            required
          />
        </div>

        <button 
          type="submit" 
          className="mt-4 bg-darkBlue hover:bg-dark hover:scale-110 text-light py-2 px-6 rounded-lg font-bold transition duration-300"
        >
          Confirm Booking
        </button>
      </form>
    </div>
  );
};

export default BookPlace;
