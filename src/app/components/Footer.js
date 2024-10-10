'use client'

import { useEffect, useState } from 'react'

const Footer = () => {
  // state to track scroll direction and footer visibility 
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0) // track last scroll position

  // effect to add a scroll event listener
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY // get current scroll position

      // if the user scrolls up or down
      if (currentScrollY > lastScrollY) {
        setIsVisible(false) // hide footer on scroll down
      } else {
        setIsVisible(true) // show footer on scroll up
      }
      setLastScrollY(currentScrollY) // update last scroll position
    }

    // add event listener for scroll
    window.addEventListener('scroll', handleScroll)

    // cleanup to remove the event listener
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [lastScrollY])

  // get current year
  const currentYear = new Date().getFullYear()

  return (
    <div
      className={`bg-dark h-20 text-light flex items-center justify-center fixed bottom-0 w-full transition-transform duration-300 ${
        isVisible ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      {/* Display the current year */}
      <p>&copy; {currentYear} Places To Stay</p>
    </div>
  )
}

export default Footer;
