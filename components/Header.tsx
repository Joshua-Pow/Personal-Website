import React from "react";
import { SocialIcon } from "react-social-icons";
import { easeIn, easeOut, motion } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import Blob from "./Blob";
type Props = {};

function Header({}: Props) {
  return (
    <header className="sticky top-0 z-20 mx-auto flex max-w-7xl justify-between p-5 xl:items-center">
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
        className="h-[110px] w-[110px] bg-center"
        onClick={() => (window.location.href = "/")}
        initial={{ x: 500, opacity: 0, scale: 0.5 }}
        animate={{ x: 0, opacity: 1, scale: 1 }}
        // transition={{ duration: 1.5 }} TODO FIX THIS
      >
        <Canvas camera={{ position: [0.0, 0.0, 8.0] }}>
          <Blob />
        </Canvas>
      </motion.div>
    </header>
  );
}

export default Header;
