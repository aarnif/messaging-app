import { useState, useEffect } from "react";

// Based on this article: https://www.dhiwise.com/post/react-get-screen-width-everything-you-need-to-know
const useResponsiveWidth = () => {
  const [width, setWidth] = useState<number>(window.innerWidth); // Default based on tailwind css xl breakpoint

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    setWidth(window.innerWidth); // Set width on mount
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return width;
};

export default useResponsiveWidth;
