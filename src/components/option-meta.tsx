import { Flame, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SOURCE_LABELS, type FoodOption } from "@/lib/types";
import { priceLabel } from "@/lib/utils";

export function OptionMeta({
  option,
  showTags = true,
}: {
  option: FoodOption;
  showTags?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Badge variant="secondary">{option.category}</Badge>
      <Badge variant="outline">{priceLabel(option.price)}</Badge>
      <Badge variant="outline" className="gap-1">
        <MapPin className="size-3" />
        {SOURCE_LABELS[option.source]}
      </Badge>
      {option.spicy > 0 && (
        <Badge variant="spicy" className="gap-0.5">
          {Array.from({ length: option.spicy }).map((_, i) => (
            <Flame key={i} className="size-3" />
          ))}
        </Badge>
      )}
      {showTags &&
        option.tags.slice(0, 4).map((t) => (
          <Badge key={t} variant="accent">
            #{t}
          </Badge>
        ))}
    </div>
  );
}
