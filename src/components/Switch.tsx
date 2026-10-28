import React from 'react';

interface SwitchProps {
  id: string;
  checked: boolean;
  label: string;
  description?: string;
  badge?: string;
  badgeTooltip?: string;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export const Switch: React.FC<SwitchProps> = ({
  id,
  checked,
  label,
  description,
  badge,
  badgeTooltip,
  onChange,
  disabled = false,
}) => {
  return (
    <div className={`cf-rule-item ${disabled ? 'cf-rule-disabled' : ''}`}>
      <div className="cf-rule-info">
        <div className="cf-rule-title-row">
          <label htmlFor={id} className="cf-rule-label">
            {label}
          </label>
          {badge && (
            <span className="cf-scope-badge" title={badgeTooltip || badge}>
              {badge}
            </span>
          )}
        </div>
        {description && <p className="cf-rule-desc">{description}</p>}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`cf-switch ${checked ? 'cf-switch-checked' : ''}`}
      >
        <span className="cf-switch-thumb" />
      </button>
    </div>
  );
};
