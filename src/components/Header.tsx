import React from "react";

type AppRoute = "profile" | "home";

interface HeaderProps {
  title: string;
  subtitle: string;
  buttonLabel: string;
  target: AppRoute;
  onNavigate?: (target: AppRoute) => void;
}

export function Header({ title, subtitle, buttonLabel, target, onNavigate }: HeaderProps) {
  const handleNavigation = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate(target);
    } else {
      window.location.hash = `/${target}`;
    }
  };

  return (
    <header className="app-header">
      <div className="header-brand-container">
        <div className="header-brand-lockup" aria-hidden="true">
          <svg
            className="brand-logo-icon"
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
          >
            {/* Outer sage ring */}
            <circle cx="12" cy="12" r="10" fill="#7fbf7f" opacity="0.9" />
            {/* Inner focal dot */}
            <circle cx="12" cy="12" r="4.2" fill="currentColor" />
          </svg>
          <span className="brand-name-text">Rhythma</span>
        </div>
      </div>

      <div className="header-row">
        <div className="header-spacer" aria-hidden="true" />
        <h1>{title}</h1>
        <a
          href={`#/${target}`}
          className="header-link"
          onClick={handleNavigation}
        >
          {buttonLabel}
        </a>
      </div>
      <p>{subtitle}</p>
    </header>
  );
}
