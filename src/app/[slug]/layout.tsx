import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { UniversityProvider } from "@/lib/context/university-context";

export default async function UniversityLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: university, error } = await supabase
    .from("universities")
    .select("id, name, slug, email_domain")
    .eq("slug", slug)
    .single();

  if (error || !university) {
    notFound();
  }

  return (
    <UniversityProvider university={university}>
      {children}
    </UniversityProvider>
  );
}
