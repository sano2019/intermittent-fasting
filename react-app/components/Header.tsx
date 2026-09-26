type AppRoute = "profile" | "home";

interface HeaderProps {
  title: string;
  subtitle: string;
  buttonLabel: string;
  target: AppRoute;
}
export function Header({ title, subtitle, buttonLabel, target }: HeaderProps) {
  const handleNavigation = (e: React.MouseEvent) => {
    e.preventDefault();
    window.location.hash = `/${target}`;
  };
  return (
    <header>
      <div className="header-row">
        <h1>{title}</h1>
        <a
          href={`#${target}`}
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
