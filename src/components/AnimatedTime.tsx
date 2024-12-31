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
    <div className="inline-flex gap-1 font-mono">
      {Object.entries(timeElapsed).map(([unit, value]) => (
        <div key={unit} className="flex flex-col items-center">
          <div className="relative flex items-center justify-center rounded-md bg-slate-50 px-1 shadow-sm">
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
