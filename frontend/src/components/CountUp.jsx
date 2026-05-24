import React, { useEffect, useState } from 'react';

function formatNumber(value, decimals) {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export default function CountUp({
  value,
  active,
  duration = 1400,
  decimals = 0,
  prefix = '',
  suffix = '',
  className = '',
}) {
  const [displayValue, setDisplayValue] = useState(() => `${prefix}${formatNumber(0, decimals)}${suffix}`);

  useEffect(() => {
    if (!active) {
      setDisplayValue(`${prefix}${formatNumber(0, decimals)}${suffix}`);
      return undefined;
    }

    const targetValue = Number(value);

    if (Number.isNaN(targetValue)) {
      setDisplayValue(`${prefix}${value}${suffix}`);
      return undefined;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      setDisplayValue(`${prefix}${formatNumber(targetValue, decimals)}${suffix}`);
      return undefined;
    }

    let animationFrameId = 0;
    const startTime = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const currentValue = targetValue * easedProgress;

      setDisplayValue(`${prefix}${formatNumber(currentValue, decimals)}${suffix}`);

      if (progress < 1) {
        animationFrameId = window.requestAnimationFrame(tick);
      }
    };

    animationFrameId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [active, decimals, duration, prefix, suffix, value]);

  return <span className={className}>{displayValue}</span>;
}