// This is admin page. Here admin users are redirected

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/firebase/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

import AddPlaceSection from '../components/AddPlaceSection'
import ManageBookingsSection from '../components/ManageBookingsSection';
import ManagePlacesSection from '../components/ManagePlacesSection';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('addPlace') // state to track which tab is active
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [user, setUser] = useState(undefined) // state that holds current user

  const router = useRouter()

  // effect hook to check user authentication and role when the component mounts
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser) 

        try {
          // reference to user document from users collection
          const userRef = doc(db, 'users', currentUser.uid);
          
          // fetch user document
          const docSnap = await getDoc(userRef)

          if (docSnap.exists()) {
            const userData = docSnap.data() // get user data
            
            // check if user is admin
            if (userData.role !== 'admin') {
              // User is not an admin
              setError('Access denied. Admins only.')
            } else {
              // User is an admin
              setLoading(false)
            }
          } else {
            // User document does not exist
            setError('User data not found.')
          }
        } catch (error) {
          console.error('Error fetching user data:', error)
          setError('Failed to fetch user data')
        } finally {
          setLoading(false) // stop loading
        }
      } else {
        // User is not authenticated
        setUser(null)
        setLoading(false)
      }
    });

    return () => unsubscribe()
  }, [])

  // render loading text while user data is fetch
  if (loading) {
    return (
      <div className="flex items-center justify-center bg-light h-screen">
        <p className="text-lg text-gray-600">Loading...</p>
      </div>
    )
  }

  if (error) {
    // Redirect to login page if there's an error
    router.push('/login')
    return null // Prevent rendering
  }

  if (!user) {
    // Redirect to login if not authenticated
    router.push('/login')
    return null
  }

  return (
    <div className="bg-light min-h-screen p-6 ">
      <h1 className="text-3xl font-bold text-dark mb-6 text-center">Admin Dashboard</h1>

      {/* Button tabs to navigate between sections in admin page */}
      <div className="flex gap-8 justify-center mb-6 ">
        <button
          onClick={() => setActiveTab('addPlace')}
          className={`px-4 py-2 rounded-xl hover:scale-110 ${
            activeTab === 'addPlace' ? 'bg-purple text-light font-bold' : 'bg-neutral text-dark font-bold'
          }`}
        >
          Add New Place
        </button>
        <button
          onClick={() => setActiveTab('managePlaces')}
          className={`px-4 py-2 rounded-xl hover:scale-110 ${
            activeTab === 'managePlaces' ? 'bg-purple text-light font-bold' : 'bg-neutral text-dark font-bold'
          }`}
        >
          Manage Places
        </button>
        <button
          onClick={() => setActiveTab('manageBookings')}
          className={`px-4 py-2 rounded-xl hover:scale-110 ${
            activeTab === 'manageBookings' ? 'bg-purple text-light font-bold' : 'bg-neutral text-dark font-bold'
          }`}
        >
          Manage Bookings
        </button>
      </div>

      {/* render content based on active tab*/}
      <div>
        {activeTab === 'addPlace' && <AddPlaceSection />}
        {activeTab === 'managePlaces' && <ManagePlacesSection />}
        {activeTab === 'manageBookings' && <ManageBookingsSection />}
      </div>
    </div>
  );
};

export default AdminDashboard;
