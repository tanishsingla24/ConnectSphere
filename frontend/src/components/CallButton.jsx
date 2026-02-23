import React from 'react';

/**
 * CallButton Component
 * Reusable button for call actions
 * @param {Object} props
 * @param {Function} props.onClick - Click handler
 * @param {string} props.label - Button text
 * @param {string} props.variant - Button style variant (primary, secondary, danger)
 * @param {boolean} props.disabled - Whether button is disabled
 */
export default function CallButton({
  onClick,
  label,
  variant = 'primary',
  disabled = false,
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`call-button call-button-${variant}`}
    >
      {label}
    </button>
  );
}
