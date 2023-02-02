import { React, use, useEffect, useRef } from "react";
import { SocialIcon } from "react-social-icons";
import { circIn, circOut, easeIn, easeOut, motion } from "framer-motion";

type Props = {};

function Header({}: Props) {
  const spotify = useRef(null);

  useEffect(() => {
    console.log("spotify ref: ", spotify);
    var btn = document.querySelector('[data-testid="play-pause-button"]');
    btn?.click();
    console.log(
      "sptf: ",
      document.querySelector('[data-testid="play-pause-button"]')
    );
  });

  return (
    <header className="sticky top-0 p-5 flex flex-items-start justify-between max-w-7xl mx-auto z-20 xl:items-center">
      <motion.div
        initial={{ x: -500, opacity: 0, scale: 0.5 }}
        animate={{ x: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, easings: [easeIn, easeOut] }}
        className="flex flex-row items-center"
      >
        <SocialIcon
          url="https://www.linkedin.com/in/joshuapow/"
          fgColor="gray"
          bgColor="transparent"
        />
        <SocialIcon
          url="https://twitter.com/JoshPow_"
          fgColor="gray"
          bgColor="transparent"
        />
        <SocialIcon
          url="https://github.com/Joshua-Pow"
          fgColor="gray"
          bgColor="transparent"
        />
      </motion.div>

      <motion.div
        initial={{ x: 500, opacity: 0, scale: 0.5 }}
        animate={{ x: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, easings: [easeIn, easeOut] }}
        className="flex flex-row items-center text-gray-300 cursor-pointer"
      ></motion.div>
    </header>
  );
}

export default Header;
