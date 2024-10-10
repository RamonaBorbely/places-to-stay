'use client'; // indicates that this is a client side component

import Link from 'next/link'; // Link component for navigation
import { usePathname } from 'next/navigation'; // hook to get current path name
import { useState, useEffect } from 'react'; 
import { onAuthStateChanged, signOut } from 'firebase/auth'; // firebase auth
import { auth, db } from '@/firebase/firebaseConfig'; // firebase auth and config
import { getDoc, doc } from 'firebase/firestore'; // firestore functions to het user data

const Header = () => {
  const [user, setUser] = useState(undefined); // to track authenticated user
  const [name, setName] = useState(''); // state for user name
  const [role, setRole] = useState(''); // state for user role: user or admin
  const pathname = usePathname(); // to get current pathname from URL

  // useEffect that listen for changes in authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser) // update user state wjen loged in

        // reference to the user document in firestore
        const userRef = doc(db, 'users', currentUser.uid)

        //fetch user data
        const docSnap = await getDoc(userRef)

        if (docSnap.exists()) {
          const userData = docSnap.data()
          setName(userData.name || '')  // set user's name if is available 
          setRole(userData.role || '')  // if user role is available set user's role ifis available 
        } else {
          setRole('') // otherwise set user role to empty string
        }
      } else {
        // if user loges aut reset state
        setUser(null);
        setName('');
        setRole('');
      }
    })
    // the clean up function
    return () => unsubscribe();
  }, []);

  // handles user logout
  const handleLogout = async () => {
    try {
      await signOut(auth) // sings out user from firebase
      setUser(null) // reset user state
      setName('') // reset name
      setRole('') // resert user's role
    } catch (error) {
      console.log('Error logging out:', error) // logs errors
    }
  };

  // if user state stil loading dont render anything
  if (user === undefined) {
    return null;
  }

  return (
    <div className="bg-darkBlue w-full h-16 flex justify-between items-center px-6">
      {/* link to homepage */}
      <Link href="/">
        <h1 className="text-light text-2xl font-semibold">Places To Stay</h1>
      </Link>

      {/* display user related things if loged in and Logout button*/}
      {user ? (
        <div className="flex items-center gap-4">

          {/* if role is not admin redirect to user page */}
          {role !== 'admin' && (
            <Link href="/userP">
              {/* // link to user things */}
              <p className="text-light text-sm">Your stuff</p> 
            </Link>
          )}
          <p className="text-light text-sm">Welcome, {name}</p>

          {/* logout button */}
          <button
            className="text-light text-sm bg-dark hover:bg-neutral hover:text-dark py-2 px-4 rounded transition duration-300"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      ) : (
        // dont display the Login button link, if user is on Login page and if not already loged in
        pathname !== '/login' && (
          <Link href="/login">
            <button className="text-light text-sm bg-dark hover:bg-neutral hover:text-dark py-2 px-4 rounded transition duration-300">
              Login
            </button>
          </Link>
        )
      )}
    </div>
  );
};

export default Header;
