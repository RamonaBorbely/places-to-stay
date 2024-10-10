// search component
// this sends data as props to its parent, Home page

// import icons
import { FaHotel } from 'react-icons/fa';
import { RiHotelBedFill } from 'react-icons/ri';
import { FaCampground } from 'react-icons/fa6';
import { useState } from 'react';

const Search = ({ onResults}) => { // onResults passed passed up 
    const [location, setLocation] = useState('') // state for location
    const [error, setError] = useState(null) // for errors durring search
    const [type, setType] = useState('') // state to track selected type

    // toggle selected type
    const handleTypeSelect = (selectedType) => {
      setType( prevType => (prevType === selectedType ? '' : selectedType))
    }

    // clear filter function. sets type to empty string 
    const handleClearFilters = () => {
      setType('')
    }

    // handler function for search 
    const handleSearch = async (e) => {
        e.preventDefault() 
        setError(null) // clear previous errors if any
        try {
          // fetch results based on location and type
           const response = await fetch(`/api/search?location=${location}&type=${type}`, {
            method: 'GET'
           })

           // parsing results as json
           const results = await response.json()

           if(response.ok) {
            onResults(results) // if ok, is passing results back to parent thru onResults
           } else {
            setError('No results found') // if no success, set error with the string
           }
        } catch (error) {
          // catching the error
            console.log("error while fetching places", error) // log the error
            setError("Failed to fetch places") // set the error if fetch request failed
        }
    }

    
  return (
    <div className="w-full flex items-center justify-center py-8">
      {/* form with onSubmit event and handleSearch function reference pass to it */}
      <form 
        className="w-full max-w-lg bg-light p-6 rounded-lg shadow-md"
        onSubmit={handleSearch}
      >
        <h2 className="text-darkBlue text-xl font-semibold mb-4">Find Your Stay</h2>
        
        <input
          type="text"
          placeholder="Enter Location"
          className="w-full text-dark py-3 px-4 mb-4 border border-dark rounded focus:outline-none focus:border-darkBlue"
          onChange={(e) => setLocation(e.target.value)}
       />
        {/* <small>London, Woking, Guilford, Chertsey</small> */}
        <div className="flex items-center justify-center gap-4 mb-6">

          {/* filter icons with onClick event */}
          <div className='flex flex-col items-center hover:scale-110 hover:underline transition duration-300 transform'>
            <FaHotel 
              className={` h-6 w-6 cursor-pointer ${type === 'hotel' ? 'text-purple': 'text-darkBlue'}`}
              onClick={() => handleTypeSelect('hotel')}
            />     
            <small>Hotel</small>
          </div>

          <div className='flex flex-col items-center hover:scale-110 hover:underline transition duration-300 transform'>
            <RiHotelBedFill 
              className={` h-6 w-6 cursor-pointer ${type === 'hostel' ? 'text-purple': 'text-darkBlue'}`}
              onClick={() => handleTypeSelect('hostel')}
            />
            <small>Hostel</small>
          </div>

          <div className='flex flex-col items-center hover:scale-110 hover:underline transition duration-300 transform'>
            <FaCampground 
              className={` h-6 w-6 cursor-pointer ${type === 'campsite' ? 'text-purple': 'text-darkBlue'}`}
              onClick={() => handleTypeSelect('campsite')}
            />
            <small>Campsite</small>
          </div>
          
          {/* clear filters */}
            <span
              className="text-red-600 ml-4 cursor-pointer hover:underline"
              onClick={handleClearFilters}
            >
              Clear Filters <small>(Just Type)</small>
            </span>
        </div>
        
        {/* if error is true show text from p element */}
        {error && <p className='text-red-600 text-center mb-4'>{error}</p>}

        <button
          type="submit"
          className="w-full bg-darkBlue hover:bg-dark text-light font-bold py-3 rounded-lg transition duration-300"
        >
          Search
        </button>
      </form>
    </div>
  );
};

export default Search;
