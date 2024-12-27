"use client";

import React, { useEffect, useState } from "react";

type Props = {
  graduationDate: Date;
};

function AnimatedTime({ graduationDate }: Props) {
  const [timeElapsed, setTimeElapsed] = useState({
    years: 0,
    months: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const diff = now.getTime() - graduationDate.getTime();

      const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365));
      const months = Math.floor(
        (diff % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30)
      );
      const days = Math.floor(
        (diff % (1000 * 60 * 60 * 24 * 30)) / (1000 * 60 * 60 * 24)
      );
      const hours = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeElapsed({ years, months, days, hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(timer);
  }, [graduationDate]);

  return (
    <div className="inline-flex gap-2 font-mono">
      {Object.entries(timeElapsed).map(([unit, value]) => (
        <div key={unit} className="flex flex-col items-center">
          <div className="relative flex items-center justify-center rounded-md bg-slate-50 px-2 shadow-sm">
            <div className="flex h-full items-center">
              {value
                .toString()
                .padStart(2, "0")
                .split("")
                .map((digit, idx) => (
                  <div
                    key={`${unit}-${idx}`}
                    className="relative h-8 w-4 overflow-hidden"
                  >
                    <div
                      className="absolute left-0 transition-transform duration-500 ease-in-out"
                      style={{
                        transform: `translateY(${-parseInt(digit) * 2}rem)`,
                      }}
                    >
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                        <div
                          key={num}
                          className="flex h-8 w-4 items-center justify-center"
                        >
                          {num}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </div>
          <span className="mt-1 text-xs">{unit}</span>
        </div>
      ))}
    </div>
  );
}

export default AnimatedTime;
