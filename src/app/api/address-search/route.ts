import type { NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";

const PHOTON_ENDPOINT = "https://photon.komoot.io/api/";
const MAX_QUERY_LENGTH = 120;
const MAX_RESULTS = 5;
const UPSTREAM_TIMEOUT_MS = 4_000;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type PhotonProperties = {
  osm_id?: number;
  osm_type?: string;
  name?: string;
  street?: string;
  housenumber?: string;
  postcode?: string;
  city?: string;
  district?: string;
  county?: string;
  state?: string;
  country?: string;
};

type PhotonFeature = {
  properties?: PhotonProperties;
};

type PhotonResponse = {
  features?: PhotonFeature[];
};

function cleanPart(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function formatAddress(properties: PhotonProperties) {
  const name = cleanPart(properties.name);
  const street = cleanPart(properties.street);
  const houseNumber = cleanPart(properties.housenumber);
  const streetAddress = [street, houseNumber].filter(Boolean).join(" ");
  const locality = cleanPart(properties.city) || cleanPart(properties.district);
  const region = cleanPart(properties.state) || cleanPart(properties.county);
  const postcode = cleanPart(properties.postcode);
  const country = cleanPart(properties.country);

  return [...new Set([name, streetAddress, locality, region, postcode, country].filter(Boolean))].join(", ");
}

function json(body: unknown, status = 200) {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "private, no-store",
    },
  });
}

export async function GET(request: NextRequest) {
  const rawQuery = request.nextUrl.searchParams.get("q") ?? "";
  const clubId = request.nextUrl.searchParams.get("clubId") ?? "";
  const query = rawQuery.trim().replace(/\s+/g, " ");

  if (
    !UUID_PATTERN.test(clubId)
    || query.length < 3
    || query.length > MAX_QUERY_LENGTH
    || /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(rawQuery)
  ) {
    return json({ suggestions: [] }, 400);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return json({ suggestions: [] }, 401);

  const { data: role } = await supabase
    .from("user_roles")
    .select("is_owner, is_admin")
    .eq("club_id", clubId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!role || (!role.is_owner && !role.is_admin)) {
    return json({ suggestions: [] }, 403);
  }

  const canonicalQuery = query.normalize("NFKC").toLowerCase();

  const upstreamUrl = new URL(PHOTON_ENDPOINT);
  upstreamUrl.searchParams.set("q", canonicalQuery);
  upstreamUrl.searchParams.set("limit", String(MAX_RESULTS));
  upstreamUrl.searchParams.set("lang", "en");

  try {
    const response = await fetch(upstreamUrl, {
      headers: {
        Accept: "application/geo+json, application/json",
        "User-Agent": "Clublinked/1.0 (event address autocomplete)",
      },
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
      next: { revalidate: 300 },
    });

    if (!response.ok) return json({ suggestions: [] }, 503);

    const data = (await response.json()) as PhotonResponse;
    const seenLabels = new Set<string>();
    const suggestions = (Array.isArray(data.features) ? data.features : [])
      .map((feature, index) => {
        const properties = feature?.properties;
        if (!properties || typeof properties !== "object") return null;

        const label = formatAddress(properties);
        if (!label || seenLabels.has(label)) return null;
        seenLabels.add(label);

        const osmId = typeof properties.osm_id === "number" ? properties.osm_id : index;
        const osmType = cleanPart(properties.osm_type) || "place";
        return { id: `${osmType}-${osmId}`, label };
      })
      .filter((suggestion): suggestion is { id: string; label: string } => suggestion !== null)
      .slice(0, MAX_RESULTS);

    return json({ suggestions });
  } catch {
    return json({ suggestions: [] }, 503);
  }
}
