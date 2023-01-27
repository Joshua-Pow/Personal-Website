import React from "react";
import Image from "next/image";

type Props = {
  languages: string[];
};

export default function ProgrammingLanguages({ languages }: Props) {
  //loop through all languages and return an image for each inside an img tag

  return (
    <>
      {languages.map((language, index) => {
        return (
          <Image
            className="h-10 w-10 rounded-full"
            width={10}
            height={10}
            key={index}
            src={`./${language}.svg`}
            alt={""}
          />
        );
      })}
    </>
  );
}
