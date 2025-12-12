import React from 'react';

/**
 * 기본 Skeleton 컴포넌트 (Tailwind CSS 기반)
 * @param {string} className - 추가할 Tailwind CSS 클래스
 */
export function Skeleton({ className, ...props }) {
  // animate-pulse로 깜빡이는 효과를 주고, bg-gray-200로 배경색을 지정합니다.
  return (
    <div
      className={`animate-pulse rounded-md bg-gray-200 ${className}`}
      {...props}
    />
  );
}