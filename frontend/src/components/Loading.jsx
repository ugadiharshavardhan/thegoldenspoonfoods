import React from "react";
import { OrbitProgress } from "react-loading-indicators";

function Loading({height}) {
  return (
    <div className={`flex justify-center items-center ${height}`}>
      <OrbitProgress variant="split-disc" color="orange" size="medium" text="" textColor="" />
    </div>
  );
}

export default Loading;
