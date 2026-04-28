"use client";

import { useState, useCallback } from "react";
import { WelcomeBanner } from "./WelcomeBanner";
import { RehberProfilForm } from "./RehberProfilForm";
import type { RehberProfile, Tour, RehberLicense, RehberDil } from "@prisma/client";

type Profile = (RehberProfile & { tours: Tour[]; licenses: RehberLicense[]; languages: RehberDil[] }) | null;

function hesaplaCompletion(form: {
  name: string;
  bio: string;
  city: string;
  diller: { dil: string }[];
  specialties: string[];
  experienceYears: number;
  operatingCountries: string[];
}) {
  const puanlar = [
    !!form.name,
    !!form.bio,
    !!form.city,
    form.diller.length > 0,
    form.specialties.length > 0,
    form.experienceYears > 0,
    form.operatingCountries.length > 0,
  ];
  const dolu = puanlar.filter(Boolean).length;
  return Math.round((dolu / puanlar.length) * 100);
}

export function RehberProfilSayfasi({
  profile,
  isYeni,
}: {
  profile: Profile;
  isYeni: boolean;
}) {
  const [completion, setCompletion] = useState(() =>
    hesaplaCompletion({
      name: profile?.name ?? "",
      bio: profile?.bio ?? "",
      city: profile?.city ?? "",
      diller: profile?.languages ?? [],
      specialties: profile?.specialties ?? [],
      experienceYears: profile?.experienceYears ?? 0,
      operatingCountries: profile?.operatingCountries ?? [],
    })
  );

  const handleFormChange = useCallback(
    (form: {
      name: string;
      bio: string;
      city: string;
      diller: { dil: string }[];
      specialties: string[];
      experienceYears: number;
      operatingCountries: string[];
    }) => {
      setCompletion(hesaplaCompletion(form));
    },
    []
  );

  return (
    <>
      {isYeni && (
        <WelcomeBanner
          name={profile?.name ?? ""}
          dashboardHref="/dashboard/rehber"
          completion={completion}
        />
      )}
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {isYeni ? "Profilini Tamamla" : "Profilimi Düzenle"}
      </h1>
      <RehberProfilForm profile={profile} onFormChange={handleFormChange} />
    </>
  );
}
