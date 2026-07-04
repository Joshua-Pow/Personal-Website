"use client";

import { useEffect, useRef } from "react";
import createGlobe from "cobe";
import { useSpring } from "motion/react";
import { VisitorData } from "./LastVisitor";

interface GlobeProps {
  visitorData?: VisitorData;
}

export default function Globe({ visitorData }: GlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerInteracting = useRef<number | null>(null);
  const pointerInteractionMovement = useRef(0);
  const latitude = visitorData?.latitude;
  const longitude = visitorData?.longitude;

  const r = useSpring(0, { stiffness: 280, damping: 40 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let isDestroyed = false;
    let phi = 0;
    let width = 300;
    let height = 300;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const onResize = () => {
      if (isDestroyed) return;
      width = 300;
      height = 300;
      canvas.width = width * 2;
      canvas.height = height * 2;
    };

    window.addEventListener("resize", onResize);
    onResize();

    const globe = createGlobe(canvas, {
      devicePixelRatio: 2,
      width: width * 2,
      height: height * 2,
      phi: 0,
      theta: 0.3,
      dark: 1,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 6,
      opacity: 0.8,
      baseColor: [0.3, 0.3, 0.3],
      markerColor: [0.918, 0.345, 0.047],
      glowColor: [0.8, 0.8, 0.8],
      offset: [0, 0],
      scale: 0.9,
      markers: latitude && longitude
        ? [
            {
              location: [parseFloat(latitude), parseFloat(longitude)],
              size: 0.1,
            },
          ]
        : [],
      onRender: (state) => {
        if (isDestroyed) return;

        state.phi = phi + r.get();

        if (!prefersReducedMotion) {
          phi += 0.005;
        }

        state.width = width * 2;
        state.height = height * 2;
      },
    });

    const onPointerDown = (e: PointerEvent) => {
      if (isDestroyed) return;
      pointerInteracting.current =
        e.clientX - pointerInteractionMovement.current;
      canvas.style.cursor = "grabbing";
      canvas.setPointerCapture(e.pointerId);
    };

    const onPointerUp = (e: PointerEvent) => {
      if (isDestroyed) return;
      pointerInteracting.current = null;
      if (canvas.hasPointerCapture(e.pointerId)) {
        canvas.releasePointerCapture(e.pointerId);
      }
      canvas.style.cursor = "grab";
    };

    const onPointerMove = (e: PointerEvent) => {
      if (isDestroyed || pointerInteracting.current === null) return;
      const delta = e.clientX - pointerInteracting.current;
      pointerInteractionMovement.current = delta;
      r.set(delta / 100);
    };

    const onPointerLeave = () => {
      if (isDestroyed) return;
      pointerInteracting.current = null;
      canvas.style.cursor = "grab";
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerUp);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerleave", onPointerLeave);

    return () => {
      isDestroyed = true;
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerUp);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("resize", onResize);
      globe.destroy();
    };
  }, [r, latitude, longitude]);

  return (
    <div className="flex h-full w-full items-center justify-center">
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="Interactive globe showing last visitor location"
        style={{
          width: "300px",
          height: "300px",
          cursor: "grab",
        }}
      />
    </div>
  );
}
