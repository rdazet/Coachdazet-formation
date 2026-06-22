import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import QuestionnaireAdmin from "./QuestionnaireAdmin";

export default async function QuestionnairesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/connexion");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") redirect("/dashboard");

  const { data: submissions } = await supabase
    .from("questionnaire_submissions")
    .select("*, profiles(full_name, email)")
    .order("submitted_at", { ascending: false });

  return (
    <div className="px-8 py-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-navy">
          Questionnaires
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Validez ou refusez les demandes d&apos;accès aux modules suivants.
        </p>
      </div>
      <QuestionnaireAdmin submissions={submissions || []} />
    </div>
  );
}
