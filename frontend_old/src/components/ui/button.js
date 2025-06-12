import React from "react";

export function Button({ children, onClick, className = "" }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 bg-[#c1a47e] text-white rounded hover:opacity-90 ${className}`}
    >
      {children}
    </button>
  );
}
