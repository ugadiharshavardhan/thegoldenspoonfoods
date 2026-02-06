import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import Loading from "./Loading";

function PopularItems() {
  const categories = [
    {
      itemType: "lamb",
      imageUrl:
        "https://assets.epicurious.com/photos/58af7eae7c592624b115423e/16:9/w_2000,h_1125,c_limit/turkish-lamb-chops-022317.jpg",
    },
    {
      itemType: "seafood",
      imageUrl:
        "https://c.ndtvimg.com/2021-02/9e8j71q_grilled-fish_625x300_10_February_21.jpg",
    },
    {
      itemType: "vegan",
      imageUrl:
        "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop&auto=format&q=60",
    },
    {
      itemType: "vegetarian",
      imageUrl:
        "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=300&fit=crop&auto=format&q=60",
    },
    {
      itemType: "breakfast",
      imageUrl:
        "https://media.istockphoto.com/id/1292563627/photo/assorted-south-indian-breakfast-foods-on-wooden-background-ghee-dosa-uttappam-medhu-vada.jpg?s=612x612&w=0&k=20&c=HvuYT3RiWj5YsvP2_pJrSWIcZUXhnTKqjKhdN3j_SgY=",
    },
    {
      itemType: "starter",
      imageUrl:
        "https://media.istockphoto.com/id/1093396546/photo/chicken-hariyali-kakab-or-malai-malai-kebab-served-with-skewers-and-yogurt-dip-in-a-plate.jpg?s=612x612&w=0&k=20&c=1-tQTk0GIIdrll19APte_EjzYGiHeL1hbiCAw0ynn0g=",
    },
    {
      itemType: "side",
      imageUrl:
        "https://media.istockphoto.com/id/1348136577/photo/traditional-thanksgiving-sides.jpg?s=612x612&w=0&k=20&c=sSX1BKdkMn8J6lLDd_fgxmb9yT_8oHu8_cwmy_USMl8=",
    },
    {
      itemType: "miscellaneous",
      imageUrl:
        "https://media.istockphoto.com/id/1316145932/photo/table-top-view-of-spicy-food.jpg?s=612x612&w=0&k=20&c=eaKRSIAoRGHMibSfahMyQS6iFADyVy1pnPdy1O5rZ98=",
    },
    {
      itemType: "goat",
      imageUrl:
        "https://ogden_images.s3.amazonaws.com/www.iamcountryside.com/images/sites/2/2022/09/23075852/goat-curry-recipe.jpg",
    },
  ];

  const [loader,setLoader]  = useState(true)

  useEffect(()=> {
    const timer = setInterval(()=> {
      setLoader(false)
    },1500)

    return ()=>clearInterval(timer)
  },[])


  return (
    <div className="px-6 py-8">
      <h1 className="text-3xl font-bold mb-3 text-gray-800">
        Popular Categories
      </h1>
      <p className="mb-3">Select you favorite category</p>

      {loader ? <Loading height={"h-[500px]"} /> :

        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((each) => (
            <Link key={each.itemType} to={`/category/${each.itemType}`} >
              <li
                key={each.itemType}
                className="
                  bg-white rounded-xl overflow-hidden
                  shadow-sm
                  transition-transform duration-200 ease-out
                  hover:scale-[1.03]
                  will-change-transform
                  md:hover:shadow-md cursor-pointer
                "
              >
                {/* Image */}
                <div className="h-44 w-full bg-gray-100">
                  <img
                    src={each.imageUrl}
                    alt={each.itemType}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                </div>

                {/* Text */}
                <div className="bg-white p-4 text-center">
                  <h2 className="text-lg font-semibold capitalize text-gray-800">
                    {each.itemType.replace("-", " ")}
                  </h2>
                </div>
              </li>
            </Link>
          ))}
        </ul>
      }
    </div>
  );
}

export default PopularItems;
