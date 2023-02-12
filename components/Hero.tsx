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
    <div className="h-screen flex flex-col space-y-8 items-center justify-center text-center overflow-hidden">
      <BackgroundCircles />
      <Image
        className="relative rounded-full h-32 w-32 mx-auto object-cover"
        src={mypic}
        priority
        width={200}
        height={200}
        alt={""}
      />
      <div className="z-20">
        <h2 className="text-sm uppercase text-gray-500 pb-2 tracking-[15px] mr-[-15px]">
          Software Engineer
        </h2>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold px-10">
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

          <Link href={""}>
            <button className="heroButton animate-text bg-gradient-to-r from-teal-500 via-purple-500 to-orange-500 bg-clip-text text-transparent">
              Coming soon...
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
