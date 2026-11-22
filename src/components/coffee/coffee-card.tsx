import Link from "next/link";
import { X } from "lucide-react";
import type { Bag, Coffee } from "@/types";
import { CoffeeBagArt } from "./coffee-bag-art";
import s from "./coffee-card.module.css";

export function CoffeeCard({
  coffee,
  bag,
  onRemove,
  hasFinishedBag = false,
}: {
  coffee: Coffee;
  bag?: Bag;
  onRemove: () => void;
  hasFinishedBag?: boolean;
}) {
  const level = bag ? Math.round((bag.remainingWeightG / bag.startingWeightG) * 100) : 0;
  return (
    <div className={`coffee-card relative ${s.card}`}>
      <button
        type="button"
        aria-label={`Remove ${coffee.name} from your coffee shelf`}
        title={`Remove ${coffee.name}`}
        onClick={onRemove}
        className="absolute right-4 top-4 z-10 grid size-8 place-items-center rounded-full border border-white/70 bg-white/75 text-[#3E2231] shadow-sm backdrop-blur-md transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        <X size={15} strokeWidth={2} aria-hidden="true" />
      </button>
      <Link
        href={`/app/coffees/${coffee.id}`}
        className="flex flex-col gap-5 text-inherit no-underline"
      >
        <div className={`coffee-card__art ${s.art}`}>
          <div className={s.bagArt}>
            <CoffeeBagArt coffee={coffee} className="h-56" />
          </div>
        </div>
        <div className="space-y-3">
          <div>
            <p className="meta">{coffee.roaster}</p>
            <h3 className="coffee-name text-2xl font-semibold tracking-[-0.03em]">
              {coffee.name}
            </h3>
          </div>
          <p className="text-sm text-muted">
            {coffee.origin} · {coffee.process}
          </p>
          {bag ? (
            <div>
              <div className="mb-1.5 flex justify-between text-xs">
                <span>{bag.remainingWeightG}g left</span>
                <span>{level}%</span>
              </div>
              <div className="inventory">
                <span style={{ width: `${level}%` }} />
              </div>
            </div>
          ) : (
            <p className="text-sm font-semibold">{hasFinishedBag ? "Bag finished" : "No active bag"}</p>
          )}
        </div>
      </Link>
    </div>
  );
}
