"use client";

import { useEffect, useRef } from "react";
import createGlobe from "cobe";
import { useSpring } from "@react-spring/web";
import { VisitorData } from "./LastVisitor";

interface GlobeProps {
  visitorData: VisitorData;
}

export default function Globe({ visitorData }: GlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerInteracting = useRef<number | null>(null);
  const pointerInteractionMovement = useRef(0);

  // Create a spring for smooth rotation
  const [{ r }, api] = useSpring(() => ({
    r: 0,
    config: {
      mass: 1,
      tension: 280,
      friction: 40,
    },
  }));

  // Convert the visitor's coordinates to numbers
  const markerLatitude = parseFloat(visitorData.latitude) || 0;
  const markerLongitude = parseFloat(visitorData.longitude) || 0;

  useEffect(() => {
    let phi = 0;
    let width = 300;
    let height = 300;

    const onResize = () => {
      if (canvasRef.current) {
        // Use fixed size to match the container
        width = 300;
        height = 300;
        canvasRef.current.width = width * 2; // For higher resolution
        canvasRef.current.height = height * 2; // For higher resolution
      }
    };

    window.addEventListener("resize", onResize);
    onResize();

    // Initialize COBE
    const globe = createGlobe(canvasRef.current!, {
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
      offset: [0, 0], // Center the globe in the canvas
      scale: 0.9, // Slightly scale down to ensure it fits
      markers: [{ location: [markerLatitude, markerLongitude], size: 0.06 }],
      onRender: (state) => {
        // This is called on each animation frame
        // Add slight automatic rotation
        state.phi = phi + r.get();

        // Adjust phi based on pointer interaction
        phi += 0.005;

        state.width = width * 2;
        state.height = height * 2;
      },
    });

    const onPointerDown = (e: PointerEvent) => {
      pointerInteracting.current =
        e.clientX - pointerInteractionMovement.current;
      canvasRef.current!.style.cursor = "grabbing";
    };

    const onPointerUp = () => {
      pointerInteracting.current = null;
      canvasRef.current!.style.cursor = "grab";
    };

    const onPointerOut = () => {
      pointerInteracting.current = null;
      canvasRef.current!.style.cursor = "grab";
    };

    const onMouseMove = (e: MouseEvent) => {
      if (pointerInteracting.current !== null) {
        const delta = e.clientX - pointerInteracting.current;
        pointerInteractionMovement.current = delta;
        api.start({ r: delta / 100 });
      }
    };

    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointerout", onPointerOut);
    window.addEventListener("mousemove", onMouseMove);

    return () => {
      globe.destroy();
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointerout", onPointerOut);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
    };
  }, [api, r, markerLatitude, markerLongitude]);

  return (
    <div className="flex h-full w-full items-center justify-center">
      <canvas
        ref={canvasRef}
        style={{
          width: "300px",
          height: "300px",
          cursor: "grab",
        }}
      />
    </div>
  );
}
