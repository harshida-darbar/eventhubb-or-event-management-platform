import React from "react";
import concert from "../assets/concert.webp";
import conferenecee from "../assets/conferencee.jpg";
import dance from "../assets/dance.jpg";
import meetupp from "../assets/meetupp.png";
import sportsss from "../assets/sportsss.avif";
import workshop from "../assets/workshop.jpg";
import music from "../assets/music.jpg";
import health from "../assets/health.jpg";
import { useNavigate } from "react-router-dom";

const EventCard = ({ title, image }) => {
    const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate(`/category/${title.toLowerCase()}`)}
      className="bg-gray-100 w-[260px] h-[220px] rounded-lg shadow-md hover:shadow-xl 
    transition cursor-pointer flex flex-col items-center justify-center mt-6"
    >
      <img
        src={image}
        alt={title}
        className="w-[150px] h-[150px] object-cover rounded-md"
      />
      <h1 className="mt-3 font-semibold text-lg capitalize text-gray-800">
        {title}
      </h1>
    </div>
  );
};

const Section2 = () => {
  return (
    <div className="max-w-[1200px] mx-auto px-4 py-10">
      <h1 className="text-center text-3xl font-bold text-purple-800 mb-8">
        Event Collection
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 justify-items-center">
        <EventCard title="concert" image={concert} />
        <EventCard title="music" image={music} />
        <EventCard title="meetup" image={meetupp} />
        <EventCard title="dance" image={dance} />
        <EventCard title="conference" image={conferenecee} />
        <EventCard title="workshop" image={workshop} />
        <EventCard title="sports" image={sportsss} />
        <EventCard title="health" image={health} />
      </div>
    </div>
  );
};

export default Section2;
