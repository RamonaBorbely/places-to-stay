// This component displays a list of search results to user
// gets data as props from its parent, Home page
import { useRouter } from "next/navigation"; // use router hook (for client side components)


const ResultsList = ({ results, searchStarted }) => {
  const router = useRouter() 

  // function that redirects to more details about a place
  const handleRedirectToDetails = (id) => {
    // navigate to place with this id
    router.push(`/places/${id}`)
  }


// if search started display message from p element
  if (searchStarted && results.length === 0) {
    return <p className="text-center mt-4">No results Found. Try other locations</p>
  }

  return (
    <div className="w-full max-w-4xl mx-auto mt-8">
      <ul className="flex items-center justify-center gap-2 ">
        {results.map(place => (
          <li key={place.id} className="border border-b p-4 shadow-md flex flex-col gap-1 hover:scale-105 hover:bg-light rounded-sm">
            <h3>{place.name}</h3>
            <p>Location: {place.location}</p>
            <p>Type: {place.type}</p>
            <p>Price per night: £{place.price}</p>

            <button 
              className="bg-darkBlue text-light px-4 py-2 rounded font-semibold hover:scale-105"
              onClick={() => handleRedirectToDetails(place.id)}
            >
              View Details
            </button>

        
          </li>
        ))}
      </ul>
    </div>
  )
}

export default ResultsList;
