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
    <header>
      <div className="header-row">
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
