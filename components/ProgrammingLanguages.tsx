import React from "react";
import Image from "next/image";

type Props = {
  languages: string[];
};

export default function ProgrammingLanguages({ languages }: Props) {
  //loop through all languages and return an image for each inside an img tag

  return (
    <div className="flex gap-2">
      {languages.map((language, index) => {
        return (
          <Image
            className="h-8 w-8 md:h-10 md:w-10"
            width={10}
            height={10}
            key={index}
            src={`./${language}.svg`}
            alt={""}
          />
        );
      })}
    </div>
  );
}
