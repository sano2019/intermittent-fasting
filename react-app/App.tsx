import React from "react";
import "./styles/components.css";
import "./styles/timer.css";
import { ProfilePage } from "./components/ProfilePage";
import { TimerRing } from "./components/TimerRing";
import { Header } from "./components/Header"; // Import your Header

export default function App() {
  const [currentPage, setCurrentPage] = React.useState<"home" | "profile">(
    "home",
  );

  React.useEffect(() => {
    const onHashChange = () => {
      const h = window.location.hash;

      // Matches the exact hashes your header will generate
      if (h === "#/profile") {
        setCurrentPage("profile");
      } else {
        setCurrentPage("home");
      }
    };

    // 1. Listen specifically for hash changes
    window.addEventListener("hashchange", onHashChange);

    // 2. Check the hash immediately on first mount/page load
    onHashChange();

    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return (
    <main>
      {/* 3. Render the Header globally, modifying its props based on active view */}
      {currentPage === "home" ? (
        <>
          <Header
            title="Fast Tracker"
            subtitle="A calm tracker for your rhythm"
            buttonLabel="View Profile"
            target="profile"
          />
          <TimerRing fastMinutes={600} />
        </>
      ) : (
        <>
          <Header
            title="Profile"
            subtitle="Local settings — future cloud sync."
            buttonLabel="Back to Timer"
            target="home"
          />
          <ProfilePage />
        </>
      )}
    </main>
  );
}
