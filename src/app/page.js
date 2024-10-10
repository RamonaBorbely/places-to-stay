'use client'; // indicates that is a client side components

// import useState hook from react, components, hooks from next js for navigation and bookplace page
import { useState } from 'react';
import Search from './components/Search';
import ResultsList from './components/ResultsList';
import BookPLace from './places/[id]/book/page'; 
import { useRouter, useSearchParams } from 'next/navigation';

export default function Home() {
  const [results, setResults] = useState([]) // state to store results
  const [searchStarted, setSearchStarted] = useState(false) // state to track if a search started
  const router = useRouter() // router hook initialisation to manage navigation
  const searchParams = useSearchParams() // hoot to access search parameters from URL
  
  // get the placeid from URL
  const placeId = searchParams.get('placeId')

  // handler function to update results when a serach is completed
  const handleResults = (newResults) => {
    setResults(newResults) // update results state with new results from search component
    setSearchStarted(true) // search started to true
  }



  return (
    <div className="w-full h-full">
      {/* if no placeId, its not in booking mode, reder search and result list  */}
      {!placeId && (
        <>
          <Search onResults={handleResults} />
          <ResultsList results={results} searchStarted={searchStarted} />
        </>
      )}

      {/* reder BookPlace if user is booking a place, we have placeId */}
      {placeId && (
        <BookPLace
          params={{ id: placeId }} 
          // onBookingComplete={() => router.push('/')} // no more nedd for onBookingComplete
        />
      )}
    </div>
  )
}
