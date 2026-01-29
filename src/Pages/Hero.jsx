import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

import hero8 from "../assets/hero8.jpg";
import hero9 from "../assets/hero9.jpg";
import hero10 from "../assets/hero10.jpg";
import hero11 from "../assets/hero11.jpg";
import hero12 from "../assets/hero12.jpg";
import hero13 from "../assets/hero13.jpg";
import { useNavigate } from "react-router-dom";
import ButtonComponent from "../Components/ButtonComponent";

function Hero() {
  const navigate = useNavigate();
  const slides = [hero8, hero9, hero10, hero11, hero12, hero13];

  return (
    <div className="relative w-full h-[35vh] sm:h-[45vh] md:h-[75vh] lg:h-[65vh] xl:h-[530px] m-0 p-0">
      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        slidesPerView={1}
        loop={true}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
        }}
        pagination={{ clickable: true }}
        navigation={true}
        className="w-full h-full"
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index}>
            <img
              src={slide}
              alt={`slide-${index}`}
              className="w-full h-full object-cover"
            />
          </SwiperSlide>
        ))}
      </Swiper>

      <div
  className="absolute top-1/2 left-6 md:left-12 lg:left-20 -translate-y-1/2 
  p-6 rounded-md max-w-md text-white flex flex-col gap-4 z-10"
>

        <h2 className="text-3xl md:text-5xl font-bold lg:mt-20">
          What's Going On Your City?
        </h2>
        <ButtonComponent
          handleClick={() => navigate("/bookevent")}
          label=" Explore Events"
           className="bg-purple-600 hover:bg-purple-700 px-5 py-2 lg:w-[200px] rounded-md font-semibold transition cursor-pointer"
        />
         
      </div>
    </div>
  );
}

export default Hero;
