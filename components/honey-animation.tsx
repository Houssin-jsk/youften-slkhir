"use client";

import { useEffect, useRef } from "react";
import { createBeeFlight } from "@/lib/bee-flight";

export function HoneyAnimation() {
  const jarRef = useRef<HTMLDivElement>(null);
  const beeRef = useRef<HTMLDivElement>(null);
  const directionRef = useRef<HTMLDivElement>(null);
  const levelRef = useRef<SVGGElement>(null);
  const dropRef = useRef<SVGGElement>(null);
  const rippleRef = useRef<SVGEllipseElement>(null);
  const controllerRef = useRef<ReturnType<typeof createBeeFlight> | null>(null);

  useEffect(() => {
    let cancelled = false;
    const logo = document.querySelector<HTMLImageElement>(".brand-logo");
    Promise.all([document.fonts.ready, logo?.decode().catch(() => undefined)]).then(() => {
      if (cancelled) return;
      controllerRef.current = createBeeFlight({
        jar: jarRef.current!, bee: beeRef.current!, direction: directionRef.current!,
        level: levelRef.current!, drop: dropRef.current!, ripple: rippleRef.current!,
      });
    });
    return () => { cancelled = true; controllerRef.current?.destroy(); };
  }, []);

  return (
    <div className="bee-experience">
      <div ref={jarRef} className="honey-illustration entrance" aria-hidden="true">
        <svg viewBox="0 0 360 250" fill="none" xmlns="http://www.w3.org/2000/svg" focusable="false">
          <defs>
          <linearGradient id="honey" x1="145" y1="0" x2="220" y2="90" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F4C65E" />
            <stop offset=".55" stopColor="#DFA329" />
            <stop offset="1" stopColor="#BD7E18" />
          </linearGradient>
          <linearGradient id="glass" x1="143" y1="150" x2="220" y2="170" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFFFFF" stopOpacity=".65" />
            <stop offset=".35" stopColor="#FFFFFF" stopOpacity=".08" />
            <stop offset="1" stopColor="#FFFFFF" stopOpacity=".5" />
          </linearGradient>
          
          <clipPath id="jar-interior">
            <path d="M151 121H209V129C209 135 218 136 218 145V199Q218 211 206 211H154Q142 211 142 199V145C142 136 151 135 151 129Z" />
          </clipPath>
          
        </defs>
          <ellipse cx="180" cy="224" rx="51" ry="5" fill="#746145" opacity=".08" />
        <g className="jar-glass">
          <path d="M149 119H211V129C211 134 221 136 221 145V200Q221 215 206 215H154Q139 215 139 200V145C139 136 149 134 149 129Z" fill="url(#glass)" />
          <g clipPath="url(#jar-interior)">
            <g ref={levelRef} className="honey-level" data-fill="0.15" data-deliveries="0">
              <path d="M130 0H230V100H130Z" fill="url(#honey)" />
              <path className="honey-wave" d="M125 2.5Q145 4 165 2.5T205 2.5T245 2.5" stroke="#F9DB86" strokeWidth="1.5" />
              <ellipse ref={rippleRef} className="honey-ripple" cx="180" cy="2.5" rx="5" ry="1" stroke="#FFF0B1" strokeWidth="1" />
            </g>
          </g>
          <path d="M149 119V129C149 134 139 136 139 145V200Q139 215 154 215H206Q221 215 221 200V145C221 136 211 134 211 129V119" stroke="#9B956D" strokeOpacity=".65" strokeWidth="1.5" />
          <path d="M147 147V198Q147 206 155 207" stroke="white" strokeOpacity=".8" strokeWidth="3" strokeLinecap="round" />
          <path d="M214 150V189" stroke="white" strokeOpacity=".55" strokeWidth="2" strokeLinecap="round" />
          <rect x="146" y="112" width="68" height="9" rx="3" fill="#F6F2DF" stroke="#9B956D" strokeOpacity=".7" strokeWidth="1.5" />
          <path d="M153 116.5H207" stroke="#BEB69A" strokeOpacity=".6" strokeLinecap="round" />
          <path d="M155 211H205" stroke="#927F48" strokeOpacity=".3" strokeLinecap="round" />
        </g>


          <g ref={dropRef} className="honey-drop">
            <path d="M180 82C178 86 175.5 88 175.5 91A4.5 4.5 0 0 0 184.5 91C184.5 88 182 86 180 82Z" fill="#DDA128" />
            <path d="M178 90Q177 92 179 93" stroke="#FFE7A4" strokeWidth="1.2" strokeLinecap="round" />
          </g>
        </svg>
      </div>
      <div className="flight-layer" aria-hidden="true">
        <div ref={beeRef} className="free-bee">
          <div ref={directionRef} className="bee-orientation">
            <svg viewBox="-32 -36 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" focusable="false">
              <defs>
                <linearGradient id="flight-bee-gold" x1="-17" y1="-7" x2="16" y2="9" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#F6D17B" /><stop offset="1" stopColor="#D49B2D" />
                </linearGradient>
                <clipPath id="flight-bee-body"><ellipse rx="18" ry="11" /></clipPath>
              </defs>
              <path d="M-9 8L-14 15M0 10L-2 17M8 8L11 14" stroke="#52452E" strokeWidth="1.5" strokeLinecap="round" />
            <g className="wing wing-back">
              <path d="M-2 -6C-23 -32 -28 -15 -18 -8Q-10 -2 -2 -6Z" fill="#FBFDFC" fillOpacity=".85" stroke="#AAC8BF" strokeWidth="1" />
              <path d="M-4 -7L-20 -17" stroke="#C5D9D1" strokeWidth=".8" />
            </g>
            <g className="wing wing-front">
              <path d="M-2 -6C-5 -35 -22 -30 -19 -16Q-17 -7 -2 -6Z" fill="#FBFDFC" fillOpacity=".95" stroke="#AAC8BF" strokeWidth="1" />
              <path d="M-4 -9L-14 -23" stroke="#C5D9D1" strokeWidth=".8" />
            </g>
            <path d="M-17 -3L-24 0L-17 3" fill="#51452F" />
            <ellipse rx="18" ry="11" fill="url(#flight-bee-gold)" />
            <g clipPath="url(#flight-bee-body)" stroke="#51452F" strokeWidth="5">
              <path d="M-10 -12Q-6 0 -10 12M0 -12Q4 0 0 12M10 -12Q14 0 10 12" />
            </g>
            <path d="M-13 -5Q-4 -11 4 -7" stroke="#FFE6A6" strokeOpacity=".6" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="19" cy="-1" r="8" fill="#51452F" />
            <path d="M21 -7Q23 -16 28 -14M16 -8Q16 -17 12 -18" stroke="#51452F" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="22" cy="-3" r="1.8" fill="#FFF8E9" />
            <circle cx="22.5" cy="-3" r=".8" fill="#263E32" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
