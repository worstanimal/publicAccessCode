import React, { useState, useRef } from "react";

export default function RAG() {
  // Thresholds: [RedEnd, AmberEnd, GreenEnd]
  const [values, setValues] = useState([30, 60, 85]);
  const barRef = useRef(null);
  const draggingIndex = useRef(null);

  const updateFromClientX = (index, clientX) => {
    if (!barRef.current) return;

    const { left, width } = barRef.current.getBoundingClientRect();
    let percent = ((clientX - left) / width) * 100;

    percent = Math.max(0, Math.min(100, percent));

    // Prevent overlap (min gap = 2%)
    if (index > 0) {
      percent = Math.max(percent, values[index - 1] + 2);
    }
    if (index < values.length - 1) {
      percent = Math.min(percent, values[index + 1] - 2);
    }

    setValues((prev) => {
      const next = [...prev];
      next[index] = Math.round(percent);
      return next;
    });
  };

  const startDrag = (index) => (e) => {
    draggingIndex.current = index;
    updateFromClientX(index, e.clientX);

    window.addEventListener("mousemove", onDrag);
    window.addEventListener("mouseup", stopDrag);
  };

  const onDrag = (e) => {
    if (draggingIndex.current === null) return;
    updateFromClientX(draggingIndex.current, e.clientX);
  };

  const stopDrag = () => {
    draggingIndex.current = null;
    window.removeEventListener("mousemove", onDrag);
    window.removeEventListener("mouseup", stopDrag);
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-6 select-none">
      <div className="flex justify-between text-sm mb-2">
        <span className="font-medium">RAG Thresholds</span>
        <span className="text-gray-500">4-stage (R/A/G/Empty)</span>
      </div>

      {/* Bar */}
      <div
        ref={barRef}
        className="relative h-3 rounded-full bg-gray-200 overflow-hidden"
      >
        {/* Red */}
        <div
          className="absolute h-full bg-red-500"
          style={{ width: `${values[0]}%` }}
        />

        {/* Amber */}
        <div
          className="absolute h-full bg-amber-500"
          style={{
            left: `${values[0]}%`,
            width: `${values[1] - values[0]}%`,
          }}
        />

        {/* Green */}
        <div
          className="absolute h-full bg-green-500"
          style={{
            left: `${values[1]}%`,
            width: `${values[2] - values[1]}%`,
          }}
        />

        {/* Empty */}
        <div
          className="absolute h-full bg-gray-300"
          style={{
            left: `${values[2]}%`,
            width: `${100 - values[2]}%`,
          }}
        />

        {/* Handles */}
        {values.map((value, index) => (
          <div
            key={index}
            onMouseDown={startDrag(index)}
            className={`absolute -top-3 w-4 h-4 cursor-ew-resize rounded-sm shadow-md
              ${
                index === 0
                  ? "bg-red-500"
                  : index === 1
                  ? "bg-amber-500"
                  : "bg-green-500"
              }`}
            style={{ left: `calc(${value}% - 8px)` }}
          />
        ))}
      </div>

      {/* Labels */}
      <div className="flex justify-between mt-4 text-sm font-medium">
        <span className="text-red-600">Red ≤ {values[0]}%</span>
        <span className="text-amber-600">
          Amber ≤ {values[1]}%
        </span>
        <span className="text-green-600">
          Green ≤ {values[2]}%
        </span>
        <span className="text-gray-500">
          Empty &gt; {values[2]}%
        </span>
      </div>
    </div>
  );
}
