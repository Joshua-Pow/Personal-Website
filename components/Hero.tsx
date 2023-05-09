import React from "react";
import { MouseEvent } from "react";
import { Cursor, useTypewriter } from "react-simple-typewriter";
import Image from "next/image";
import BackgroundCircles from "./BackgroundCircles";
import Link from "next/link";
import mypic from "../public/me2.png";

type Props = {};

//TODO: Fix emoji bug

export default function Hero({}: Props) {
  const [text, count] = useTypewriter({
    words: [
      "Full Stack Developer 💻",
      "Canadian 🍁",
      "Student 👨‍🎓",
      "Aboriginal 🌎",
    ],
    loop: true,
    delaySpeed: 2000,
  });

  const hackerEffect = (
    event: React.MouseEvent<HTMLButtonElement, globalThis.MouseEvent>
  ) => {
    const alphabet = "abcdefghijklmnopqrstuvwxyz";
    const original = (event.target as HTMLButtonElement).name;
    let iteration = 0;

    let interval = setInterval(() => {
      (event.target as HTMLButtonElement).innerText = (
        event.target as HTMLButtonElement
      ).innerText
        .split("")
        .map((letter, index) => {
          if (index < iteration) {
            return original[index];
          } else {
            return alphabet[Math.floor(Math.random() * alphabet.length)];
          }
        })
        .join("");

      if (iteration > original.length) {
        clearInterval(interval);
      }
      iteration += 1 / 3;
    }, 30);
  };

  return (
    <div className="flex h-screen flex-col items-center justify-center space-y-8 overflow-hidden text-center">
      <BackgroundCircles />
      <Image
        className="relative mx-auto h-32 w-32 rounded-full object-cover"
        src={mypic}
        priority
        width={200}
        height={200}
        alt={""}
      />
      <div className="z-20">
        <h2 className="mr-[-15px] pb-2 text-sm uppercase tracking-[15px] text-gray-500">
          Software Engineer
        </h2>
        <h1 className="px-10 text-4xl font-semibold md:text-5xl lg:text-6xl">
          <span className="mr-3">{text}</span>
          <Cursor cursorColor="#430ecf" />
        </h1>

        <div className="pt-5">
          <Link href={"#about"}>
            <button
              className="heroButton"
              onMouseOver={(event) => hackerEffect(event)}
              name="About"
            >
              About
            </button>
          </Link>

          <Link href={"#experience"}>
            <button
              className="heroButton"
              onMouseOver={(event) => hackerEffect(event)}
              name="Experience"
            >
              Experience
            </button>
          </Link>

          <Link href={"/playground"}>
            <button className="heroButton animate-text bg-gradient-to-r from-teal-500 via-purple-500 to-orange-500 bg-clip-text text-transparent">
              Coming soon...
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
