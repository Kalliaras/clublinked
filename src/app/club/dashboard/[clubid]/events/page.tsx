import { Card } from "@/components/ui/card";

export default function ClubEventsPage() {
  return (
    <Card className="border-slate-200 p-6">
      <h2 className="text-lg font-semibold text-slate-900">Events</h2>
      <p className="mt-4 text-sm leading-6 text-slate-700">
        This club has no Events details yet.
      </p>
    </Card>
  );
}
