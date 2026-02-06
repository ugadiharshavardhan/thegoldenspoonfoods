import Slider from "react-slick";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useEffect, useState } from "react";
import Loading from "./Loading";

const ReactSlick = () => {
  const [loader,setLoader] = useState(true)

  const settings = {
    dots: true,
    infinite: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    speed: 700,
    arrows: false,
  };

  useEffect(()=> {
    const timer = setTimeout(()=> {
      setLoader(false)
    },1500)

    return ()=>clearInterval(timer)
  },[])


  return (
    <div>
      {loader ? 
      <div className="">
        <Loading height={"h-[427px]"} />
      </div>   :
      <div className="w-full max-w-6xl mx-auto mt-6">
      <Slider {...settings}>
        
        <div>
          <img
            src="https://res.cloudinary.com/dcttatiuj/image/upload/v1769795963/ChatGPT_Image_Jan_30_2026_11_28_15_PM_c4rqp7.png"
            alt="food"
            className="w-full h-[300px] md:h-[400px] object-cover rounded-xl"
          />
        </div>

        <div>
          <img
            src="https://res.cloudinary.com/dcttatiuj/image/upload/v1769796396/477_p2vluf.jpg"
            alt="food"
            className="w-full h-[300px] md:h-[400px] object-cover rounded-xl"
          />
        </div>

        <div>
          <img
            src="https://images.unsplash.com/photo-1499028344343-cd173ffc68a9"
            alt="food"
            className="w-full h-[300px] md:h-[400px] object-cover rounded-xl"
          />
        </div>

        <div>
          <img
            src="https://images.unsplash.com/photo-1550547660-d9450f859349"
            alt="food"
            className="w-full h-[300px] md:h-[400px] object-cover rounded-xl"
          />
        </div>

      </Slider>
      </div> }
    </div>  
  );
};

export default ReactSlick;

