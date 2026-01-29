import React from "react";

function ButtonComponent({
  handleClick,
  event,
  label = "Book Now",
  className = "",
}) {
  const defaultClass = "bg-purple-600 hover:bg-purple-700";

  const buttonClass = className ? className : defaultClass;

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        handleClick(event);
      }}
      className={`text-white font-semibold  outline-none h-10 cursor-pointer mt-3 p-2 rounded-xl w-full ${buttonClass}`}
    >
      {label}
    </button>
  );
}

export default ButtonComponent;
