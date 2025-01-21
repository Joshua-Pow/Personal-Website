"use client";

import React, { useEffect, useState, useRef } from "react";

interface Props {
  graduationDate: Date;
}

function playTickSequence(
  audioRef: React.RefObject<HTMLAudioElement | null>,
  count: number
) {
  let tickCount = 0;
  const interval = setInterval(() => {
    if (tickCount >= count) {
      clearInterval(interval);
      return;
    }
    audioRef.current?.play().catch(() => {});
    tickCount++;
  }, 50); // Play ticks quickly in succession
}

function AnimatedTime({ graduationDate }: Props) {
  const [timeElapsed, setTimeElapsed] = useState({
    years: 0,
    months: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const prevTimeRef = useRef(timeElapsed);

  useEffect(() => {
    audioRef.current = new Audio("./click.wav");
    audioRef.current.volume = 0.05; // Lower volume since we'll play multiple ticks

    const timer = setInterval(() => {
      const now = new Date();
      const diff = now.getTime() - graduationDate.getTime();

      const newTimeElapsed = {
        years: Math.floor(diff / (1000 * 60 * 60 * 24 * 365)),
        months: Math.floor(
          (diff % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30)
        ),
        days: Math.floor(
          (diff % (1000 * 60 * 60 * 24 * 30)) / (1000 * 60 * 60 * 24)
        ),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      };

      // Check which values changed and play appropriate tick sequences
      Object.entries(newTimeElapsed).forEach(([unit, value]) => {
        const prevValue = prevTimeRef.current[unit as keyof typeof timeElapsed];
        if (value !== prevValue) {
          const difference = Math.abs(value - prevValue);
          // Play more ticks for larger changes
          playTickSequence(audioRef, Math.min(difference + 2, 8));
        }
      });

      prevTimeRef.current = newTimeElapsed;
      setTimeElapsed(newTimeElapsed);
    }, 1000);

    return () => {
      clearInterval(timer);
      audioRef.current?.remove();
    };
  }, [graduationDate]);

  return (
    <span className="inline-flex gap-0.5 font-mono sm:gap-1">
      {Object.entries(timeElapsed).map(
        ([unit, value]) =>
          !(unit === "years" && value === 0) && (
            <span key={unit} className="flex flex-col items-center">
              <span className="relative flex items-center justify-center rounded-md bg-slate-50 px-1 shadow-sm">
                <span className="flex h-full items-center">
                  {value
                    .toString()
                    .padStart(2, "0")
                    .split("")
                    .map((digit, idx) => (
                      <span
                        key={`${unit}-${idx}`}
                        className="relative h-6 w-3 overflow-hidden sm:h-8 sm:w-4"
                      >
                        <span
                          className="absolute left-0 -translate-y-[calc(1.5rem*var(--digit))] transition-transform duration-500 ease-in-out sm:-translate-y-[calc(2rem*var(--digit))]"
                          style={
                            {
                              "--digit": parseInt(digit),
                            } as React.CSSProperties
                          }
                        >
                          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                            <span
                              key={num}
                              className="flex h-6 w-3 items-center justify-center text-xs sm:h-8 sm:w-4 sm:text-base"
                            >
                              {num}
                            </span>
                          ))}
                        </span>
                      </span>
                    ))}
                </span>
              </span>
              <span className="mt-1 text-[8px] sm:text-xs">{unit}</span>
            </span>
          )
      )}
    </span>
  );
}

export default AnimatedTime;
