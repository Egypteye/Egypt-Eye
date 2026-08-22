import type { Host } from "@/content/types";
import { SmartImage } from "./SmartImage";

export function HostCard({ host }: { host: Host }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-3xl bg-cream shadow-sm shadow-black/5">
      <SmartImage
        image={host.photo}
        tone="desert"
        alt={host.name}
        className="aspect-[4/5] w-full"
      />
      <div className="flex flex-1 flex-col gap-2 p-6">
        <h3 className="font-display text-xl font-semibold text-ink">{host.name}</h3>
        {host.role && <p className="text-sm font-medium text-gold-dark">{host.role}</p>}
        <p className="mt-2 text-sm leading-relaxed text-ink-soft/75">{host.bio}</p>
        {host.personality && (
          <p className="text-sm leading-relaxed text-ink-soft/75">{host.personality}</p>
        )}
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t border-black/5 pt-3 text-xs text-ink-soft/60">
          {host.experience && <span>{host.experience}</span>}
          {host.languages && host.languages.length > 0 && (
            <span>Speaks {host.languages.join(", ")}</span>
          )}
        </div>
      </div>
    </div>
  );
}
