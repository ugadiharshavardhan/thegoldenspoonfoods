import React from 'react'
import PopularItems from './PopularItems'
import Footer from './Footer'
import ReactSlick from './Carousel'

function HomePage() {

  return (
    <div>
      <ReactSlick />
      <PopularItems />
      <Footer />
    </div>
  )
}

export default HomePage
