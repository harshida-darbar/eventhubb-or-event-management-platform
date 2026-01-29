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

function Banner() {
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
    </div>
  );
}

export default Banner;
