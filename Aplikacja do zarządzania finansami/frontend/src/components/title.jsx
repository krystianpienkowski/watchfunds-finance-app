import React from "react";

const Title = ({ text, className = "" }) => {
  return (
    <h2 className={`text-2xl font-bold mb-5  text-gray-600 ml-10 ${className}`}>
      {text}
    </h2>
  );
};

export default Title;
