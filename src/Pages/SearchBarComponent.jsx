import React from "react";
import { IoArrowBack, IoSearch } from "react-icons/io5";

function SearchBarComponent({ value, onChange, placeholder = "Search...." }) {
   return (
    <div className="bg-white border border-purple-300 max-w-5xl w-full px-4 flex items-center gap-2 rounded-lg py-2">
      <IoSearch size={25} className="text-purple-700" />
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="text-purple-700 outline-none w-full"
      />
    </div>
  );
}

export default SearchBarComponent;
