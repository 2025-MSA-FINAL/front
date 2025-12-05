import { useMemo } from "react";
import React from "react";

export default function useCustomTick({
  angle = -15,
  baseFontSize = 10,
  color = "#333",
  lineHeight = 12,
  mobileWidth = 480
} = {}) {
  return useMemo(
    () =>
      function TickRenderer({ x, y, payload }) {
        const text = payload.value;
        const words = text.split(" ");

        const isMobile = window.innerWidth < mobileWidth;
        const appliedAngle = isMobile ? 0 : angle;

        const totalLength = text.length;
        const wordCount = words.length;

        let dynamicFont = baseFontSize;

        if (totalLength > 14) dynamicFont -= 1;
        if (totalLength > 18) dynamicFont -= 2;
        if (wordCount >= 3) dynamicFont -= 1;
        if (dynamicFont < 7) dynamicFont = 7;

        let lines = [];
        if (wordCount <= 1) {
          lines = [text];
        } else if (wordCount === 2) {
          lines = [words[0], words[1]];
        } else {
          const mid = Math.ceil(words.length / 2);
          lines = [words.slice(0, mid).join(" "), words.slice(mid).join(" ")];
        }

        return React.createElement(
          "g",
          {
            transform: `translate(${x},${y}) rotate(${appliedAngle})`
          },
          React.createElement(
            "text",
            {
              textAnchor: "end",
              fontSize: dynamicFont,
              fill: color
            },
            lines.map((line, i) =>
              React.createElement(
                "tspan",
                {
                  key: i,
                  x: "0",
                  dy: i === 0 ? 0 : lineHeight
                },
                line
              )
            )
          )
        );
      },
    [angle, baseFontSize, color, lineHeight, mobileWidth]
  );
}
