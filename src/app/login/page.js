'use client'

import { FcGoogle } from 'react-icons/fc';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { auth, db } from '@/firebase/firebaseConfig';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';


const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [userRole, setUserRole] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams();

  const redirect = searchParams.get('redirect') || '/'
  const placeId = searchParams.get('placeId')

  const handleLogin = async (e) => {
    e.preventDefault()
    setError(null)
    try {
      const userCredentials = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredentials.user

      console.log('User UID:', user.uid);

      // get role
      const userDoc = await getDoc(doc(db, 'users', user.uid))
      if(userDoc.exists()) {
        const role = userDoc.data().role
        setUserRole(role)

        if(role === 'admin') {
          router.push('/adminP')
          return
        }
      } else {
        setError('No user role')
        return
      }

     
      //await updateProfile(user, {displayName: name})

      const idToken = await user.getIdToken()
      console.log("ID Token: ", idToken)
      const redirectUrl = placeId ? `${redirect}?placeId=${placeId}` : redirect
      router.push(redirectUrl)
    } catch (error) {
      console.error('Login error', error)
      setError('Login failed. Please check your credentials.')
    }
  }

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const userCredentials = await signInWithPopup(auth, provider)
      const user = userCredentials.user

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const role = userDoc.data().role
        setUserRole(role);
        if(userRole === 'admin') {
          router.push('/adminP')
          return
        }
      } else {
        setError('User role not found.');
      }
      
      const redirectUrl = placeId ? `${redirect}?placeId=${placeId}` : redirect
      router.push(redirectUrl)
    } catch (error) {
      console.error('Google Sign-In error', error)
      setError('Google sign in failed')
    }
  }

  return (
    <div className="w-full mt-10 flex items-center justify-center">
      <form className="w-full max-w-sm bg-light p-6 rounded-lg shadow-md flex flex-col gap-2" onSubmit={handleLogin}>
        <h2 className="text-darkBlue text-xl font-semibold mb-6 text-center">Login</h2>

        {error && <p className="text-red-600 text-center mb-4">{error}</p>}

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
          Login
        </button>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="flex justify-center items-center gap-2 mt-4 w-full bg-neutral text-darkBlue hover:bg-dark hover:text-light font-semibold px-4 py-2 rounded-lg transition duration-300"
        >
          <FcGoogle />
          Login with Google
        </button>
        <h3 
          className='text-center text-darkBlue'
        >
          <span className='font-semibold'>New User ? </span>
      
          <Link href='/register' className='font-bold underline text-xl'>Register</Link>
        </h3>
      </form>
    </div>
  );
};

export default Login;
