import React from "react";
import { ProfileSettings } from "./ProfileSettings";

interface ProfilePageProps {
  onOpenOnboarding?: () => void;
}

export function ProfilePage({ onOpenOnboarding }: ProfilePageProps) {
  return (
    <>
      <ProfileSettings onOpenOnboarding={onOpenOnboarding} />
    </>
  );
}
