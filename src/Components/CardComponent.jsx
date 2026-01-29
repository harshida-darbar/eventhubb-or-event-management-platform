import { collection, getDocs } from "firebase/firestore";
import React from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa6";
import { TiMinusOutline } from "react-icons/ti";
import { CiSliderHorizontal } from "react-icons/ci";
import { MdOutlinePriceChange, MdStarRate } from "react-icons/md";
import { IoLocationOutline } from "react-icons/io5";
import ButtonComponent from "./ButtonComponent";
import { useNavigate } from "react-router-dom";

function CardComponent({ event, toggleWishlist, isWishlisted, handleClick }) {
  const navigate = useNavigate();

  return (
    <div>
      <div
        key={event.id}
        className="bg-white shadow-lg p-5 rounded-xl flex flex-col hover:shadow-xl cursor-pointer w-full h-full"
        onClick={() => navigate(`/booklisting/${event.id}`, { state: event })}
      >
        <div className="flex justify-between">
          <p className="font-semibold">{event.eventName}</p>

          {isWishlisted(event.id) ? (
            <FaHeart
              className="text-red-500"
              onClick={(e) => {
                e.stopPropagation();
                toggleWishlist(event);
              }}
            />
          ) : (
            <FaRegHeart
              className="text-red-500"
              onClick={(e) => {
                e.stopPropagation();
                toggleWishlist(event);
              }}
            />
          )}
        </div>

        <p className="text-gray-600 text-sm flex items-center gap-2 mt-1">
          <TiMinusOutline /> {event.description}
        </p>

        <div className="text-gray-700 text-sm mt-1 flex gap-4">
          <p className="flex items-center gap-1">
            <CiSliderHorizontal /> {event.eventType}
          </p>
          <p className="flex items-center gap-1">
            <MdOutlinePriceChange /> ₹{event.price}
          </p>
        </div>

        <div className="mt-1 text-sm text-gray-600">
          <p>
            Start: {event.startdate} {event.starttime}
          </p>
          <p>
            End: {event.enddate} {event.endtime}
          </p>
        </div>

        <div className="flex text-sm text-gray-700 gap-3 mt-1">
          <p>Total: {event.ticket_config?.totalTickets}</p>
          <p>Sold: {event.ticket_config?.soldTickets}</p>
          <p>Available: {event.ticket_config?.availableTickets}</p>
        </div>

        <p className="flex items-center gap-2 mt-2 text-sm text-gray-700">
          <IoLocationOutline /> {event.location}
        </p>

        <div className="flex items-center gap-1 mt-1">
          <MdStarRate className="text-yellow-500" />
          <span>
            {event.ratings?.length
              ? (
                  event.ratings.reduce((s, r) => s + Number(r.rating), 0) /
                  event.ratings.length
                ).toFixed(1)
              : "0"}
          </span>
        </div>
        <ButtonComponent
          handleClick={handleClick}
          event={event}
          label="Book Now"
          className="bg-purple-600 hover:bg-purple-700"
        />
      </div>
    </div>
  );
}

export default CardComponent;
