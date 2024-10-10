'use client';

import { FcGoogle } from 'react-icons/fc' 
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { auth, db } from '@/firebase/firebaseConfig'
import { createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import Link from 'next/link';

const Register = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState(null)
  const router = useRouter()

  const handleRegister = async (e) => {
    e.preventDefault()
    setError(null)

    try {
      // Register the user with Firebase Authentication
      const userCredentials = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredentials.user

      // Update the user's display name in Authentication
      await updateProfile(user, { displayName: name })

      // Create a new user document in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        name: name,
        role: 'user', // Default role, adjust if needed
        username: user.email.split('@')[0], // Create a username from email
      })

      // Redirect to user dedicated page
      router.push('/userP')
    } catch (error) {
      console.error('Registration error:', error)
      setError('Registration failed. Please try again.')
    }
  }

  // if users use singin with google
  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider()
    try {
      const userCredentials = await signInWithPopup(auth, provider)
      const user = userCredentials.user

      // Reference to the user document in Firestore
      const userRef = doc(db, 'users', user.uid)

      // Check if user document exists
      const userDoc = await getDoc(userRef)
      if (!userDoc.exists()) {
        // Create a new user document in Firestore
        await setDoc(userRef, {
          email: user.email,
          name: user.displayName || '',
          role: 'user', // Just normal users accounts can be created
          username: user.email.split('@')[0], // Create a username from email, this was here before i fixed something
        })
      }

      // Redirect to user page
      router.push('/userP')
    } catch (error) {
      console.error('Google Sign-In error:', error)
      setError('Google sign-in failed. Please try again')
    }
  }

  return (
    <div className="w-full mt-10 flex items-center justify-center">
      <form className="w-full max-w-sm bg-light p-6 rounded-lg shadow-md flex flex-col gap-2" onSubmit={handleRegister}>
        <h2 className="text-darkBlue text-xl font-semibold mb-6 text-center">Register</h2>
        
        {error && <p className="text-red-600 text-center mb-4">{error}</p>}

        <input
          type="text"
          placeholder="Name"
          className="w-full text-dark py-3 px-4 mb-4 border border-dark rounded"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          className="w-full text-dark py-3 px-4 mb-4 border border-dark rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full text-dark py-3 px-4 mb-6 border border-dark rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit" className="w-full bg-darkBlue hover:bg-dark text-light py-3 rounded-lg transition duration-300">
          Register
        </button>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="mt-4 w-full bg-neutral hover:bg-dark text-darkBlue font-semibold px-4 py-2 rounded-lg transition duration-300 flex items-center justify-center"
        >
          <FcGoogle className="mr-2" />
          Register with Google
        </button>

        <h3 className='text-center text-darkBlue font-semibold'>Already have an account ?
          <Link href="/login" className=' text-bold text-xl'> Login</Link>
        </h3>
      </form>
    </div>
  );
};

export default Register;
