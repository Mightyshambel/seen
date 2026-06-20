import { SettingsPanel } from "@/components/settings/SettingsPanel";

const history = [
  { date: "This week", title: "Matched with Maya", note: "Grief & loss · 94% understanding" },
  {
    date: "Two weeks ago",
    title: "Reflected on availability",
    note: "Switched from 'this week' to 'today'.",
  },
  {
    date: "Last month",
    title: "Matched with Noah",
    note: "Addiction recovery · 87% understanding",
  },
];

export function SupportHistorySettings() {
  return (
    <SettingsPanel
      title="Support history"
      description="A quiet record of your matches and the shifts in what you've needed."
    >
      <ol className="space-y-3">
        {history.map((entry) => (
          <li key={entry.title} className="rounded-2xl border border-border bg-card p-5">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">{entry.date}</p>
            <p className="mt-1 font-medium">{entry.title}</p>
            <p className="mt-0.5 text-sm text-muted-foreground">{entry.note}</p>
          </li>
        ))}
      </ol>
    </SettingsPanel>
  );
}
