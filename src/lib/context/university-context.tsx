"use client";

import { createContext, useContext } from "react";

export type University = {
  id: string;
  name: string;
  slug: string;
  email_domain: string | null;
};

const UniversityContext = createContext<University | null>(null);

export function UniversityProvider({
  university,
  children,
}: {
  university: University;
  children: React.ReactNode;
}) {
  return (
    <UniversityContext.Provider value={university}>
      {children}
    </UniversityContext.Provider>
  );
}

export function useUniversity() {
  const ctx = useContext(UniversityContext);
  if (!ctx) throw new Error("useUniversity must be used within [slug] layout");
  return ctx;
}
