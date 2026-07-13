"use client";

import { ReactSVG } from "react-svg";
import { STATE_CODE_MAP } from "@/lib/stateMap";
import { memo, useCallback, useState, useRef, useEffect } from "react";
import { getStatePreview } from "@/services/statePreviewService";
import { StatePreview } from "@/types/statePreview";
import StateTooltip from "./StateTooltip";

interface IndiaMapProps {
  onStateClick?: (stateId: string) => void;
  selectedState?: string;
}

function IndiaMap({
  onStateClick,
  selectedState,
}: IndiaMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lastHoveredState = useRef<string | null>(null);
  
  // Refs to prevent "stale closures" inside the one-time SVG injection
  const selectedStateRef = useRef<string | undefined>(selectedState);
  const onStateClickRef = useRef(onStateClick);

  const [tooltipData, setTooltipData] = useState<StatePreview | null>(null);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Keep refs up to date with the latest React props
  useEffect(() => {
    selectedStateRef.current = selectedState;
    onStateClickRef.current = onStateClick;
  }, [selectedState, onStateClick]);

  // Effect to manually update path colors when selectedState changes in React
  useEffect(() => {
    if (!containerRef.current) return;
    
    const paths = containerRef.current.querySelectorAll("path");
    paths.forEach((state) => {
      const rawId = state.getAttribute("id") || "";
      const svgId = rawId.split("-")[0];
      const stateCode = STATE_CODE_MAP[svgId];

      if (stateCode === selectedState) {
        state.setAttribute("fill", "#005BAC");
      } else {
        state.setAttribute("fill", "#D1D5DB");
      }
    });
  }, [selectedState]);

  const handleBeforeInjection = useCallback((svg: SVGSVGElement) => {
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
    
    svg.addEventListener("mouseleave", () => {
      setTooltipVisible(false);
      setTooltipData(null);
    });

    const states = svg.querySelectorAll("path");

    states.forEach((state) => {
      // -----------------------------
      // Scoped Variables (Available to all listeners)
      // -----------------------------
      const rawId = state.getAttribute("id") || "";
      const svgId = rawId.split("-")[0];
      const stateCode = STATE_CODE_MAP[svgId];
      const label = svgId.replace("IN", "");

      // Initial styling setup
      if (stateCode === selectedStateRef.current) {
        state.setAttribute("fill", "#005BAC");
      } else {
        state.setAttribute("fill", "#D1D5DB");
      }
      state.setAttribute("stroke", "#FFFFFF");
      state.setAttribute("stroke-width", "1");
      state.style.cursor = "pointer";
      state.style.transition = "all 0.2s ease";

      // -----------------------------
      // Create automatic abbreviation
      // -----------------------------
      try {
        const bbox = state.getBBox();
        const text = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "text"
        );

        text.setAttribute("x", String(bbox.x + bbox.width / 2));
        text.setAttribute("y", String(bbox.y + bbox.height / 2));
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("dominant-baseline", "middle");
        text.setAttribute("font-size", "10");
        text.setAttribute("font-weight", "700");
        text.setAttribute("fill", "#111827");
        text.style.pointerEvents = "none";
        text.textContent = label;

        svg.appendChild(text);
      } catch (err) {
        console.warn("Unable to place label:", svgId);
      }

      // -----------------------------
      // Hover
      // -----------------------------
      state.addEventListener("mouseenter", async (event) => {
        state.setAttribute("fill", "#005BAC");

        if (!stateCode) return;

        // Don't fetch again if we're still on the same state
        if (lastHoveredState.current === stateCode) {
          setTooltipVisible(true);
          return;
        }

        lastHoveredState.current = stateCode;

        try {
          const preview = await getStatePreview(stateCode);
          setTooltipData(preview);
          setTooltipVisible(true);

          setMousePosition({
            x: (event as MouseEvent).clientX,
            y: (event as MouseEvent).clientY,
          });
        } catch (error) {
          console.error(error);
          setTooltipData(null);
        }
      });

      state.addEventListener("mousemove", (event) => {
        setMousePosition({
          x: (event as MouseEvent).clientX,
          y: (event as MouseEvent).clientY,
        });
      });

      state.addEventListener("mouseleave", () => {
        // Read from the ref to get the absolute latest state
        if (stateCode === selectedStateRef.current) {
          state.setAttribute("fill", "#005BAC");
        } else {
          state.setAttribute("fill", "#D1D5DB");
        }

        setTooltipVisible(false);
        lastHoveredState.current = null;
      });

      // -----------------------------
      // Click
      // -----------------------------
      state.addEventListener("click", () => {
        console.log(rawId, svgId, stateCode);
        // Call using the ref so it executes the latest function passed to props
        onStateClickRef.current?.(stateCode || "");
      });
    });
  }, []);

  return (
    <div className="w-full flex justify-center" ref={containerRef}>
      <div className="w-[700px]">
        <ReactSVG
          src="/maps/india.svg"
          beforeInjection={handleBeforeInjection}
        />
        <StateTooltip
          data={tooltipData}
          visible={tooltipVisible}
          x={mousePosition.x}
          y={mousePosition.y}
        />
      </div>
    </div>
  );
}

export default memo(IndiaMap);
