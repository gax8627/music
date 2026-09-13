import React from 'react';

export interface IconProps {
  className?: string;
  size?: number;
}

/**
 * Premium Audiophile Shuffle Icon
 * Sleek dual-path crossing vectors with aerodynamic arrowheads
 */
export const PremiumShuffleIcon: React.FC<IconProps> = ({ className = '', size = 15 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`shrink-0 ${className}`}
    aria-hidden="true"
  >
    <path
      d="M16 3H21V8"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M4 20L9.5 14.5M21 3L14.5 9.5"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M21 16V21H16"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M4 4L21 21"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="4" cy="4" r="1.5" fill="currentColor" opacity="0.6" />
    <circle cx="4" cy="20" r="1.5" fill="currentColor" opacity="0.6" />
  </svg>
);

/**
 * Premium Audiophile Loop Forever Icon
 * Precision infinity orbit with directional arrows and high-fidelity accents
 */
export const PremiumLoopIcon: React.FC<IconProps> = ({ className = '', size = 15 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`shrink-0 ${className}`}
    aria-hidden="true"
  >
    {/* Continuous Infinity Wave */}
    <path
      d="M18.178 8C19.736 9.171 21 10.742 21 12C21 14.761 18.761 17 16 17C13.568 17 11.534 15.264 10.158 13.5C8.782 11.736 6.748 10 4.316 10C2.568 10 1 11.239 1 12.5C1 14.261 2.5 16 5 16.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M5.822 16C4.264 14.829 3 13.258 3 12C3 9.239 5.239 7 8 7C10.432 7 12.466 8.736 13.842 10.5C15.218 12.264 17.252 14 19.684 14C21.432 14 23 12.761 23 11.5C23 9.739 21.5 8 19 7.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    {/* Arrowhead terminal top-right */}
    <path
      d="M20 5L23.5 7.8L20 10.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Arrowhead terminal bottom-left */}
    <path
      d="M4 19L0.5 16.2L4 13.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * Premium Share Icon
 * Luxury broadcast / share beam icon
 */
export const PremiumShareIcon: React.FC<IconProps> = ({ className = '', size = 14 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`shrink-0 ${className}`}
    aria-hidden="true"
  >
    <path
      d="M18 8C19.6569 8 21 6.65685 21 5C21 3.34315 19.6569 2 18 2C16.3431 2 15 3.34315 15 5C15 5.34241 15.0573 5.67138 15.1631 5.97645L8.85584 9.63897C8.28318 9.24151 7.58784 9 6 9C4.34315 9 3 10.3431 3 12C3 13.6569 4.34315 15 6 15C7.58784 15 8.28318 14.7585 8.85584 14.361L15.1631 18.0235C15.0573 18.3286 15 18.6576 15 19C15 20.6569 16.3431 22 18 22C19.6569 22 21 20.6569 21 19C21 17.3431 19.6569 16 18 16C16.4122 16 15.7168 16.2415 15.1442 16.639L8.83688 12.9765C8.94272 12.6714 9 12.3424 9 12C9 11.6576 8.94272 11.3286 8.83688 11.0235L15.1442 7.36103C15.7168 7.75849 16.4122 8 18 8Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
