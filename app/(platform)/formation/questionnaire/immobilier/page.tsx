import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import QuestionnaireImmo from "./QuestionnaireImmo";

export default async function QuestionnaireImmobilierPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/connexion");

  // If user already submitted, redirect to en-attente
  const { data: existing } = await supabase
    .from("questionnaire_submissions")
    .select("id")
    .eq("user_id", user.id)
    .eq("module_number", 2)
    .maybeSingle();

  if (existing) redirect("/formation/questionnaire/en-attente");

  return <QuestionnaireImmo />;
}
