import { Landing } from "@/components/landing/landing";
import { listOptions, listCategories } from "@/lib/repo";

export const dynamic = "force-dynamic";

export default function Home() {
  const options = listOptions(false);
  const categories = listCategories();
  const emojis = options.map((o) => o.emoji).filter(Boolean);

  return (
    <Landing
      optionCount={options.length}
      categoryCount={categories.length}
      emojis={emojis}
    />
  );
}
