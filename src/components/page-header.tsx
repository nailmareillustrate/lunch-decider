import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function PageHeader({
  title,
  description,
  icon,
  backHref = "/",
}: {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  backHref?: string;
}) {
  return (
    <div className="mb-8">
      <Link
        href={backHref}
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        返回
      </Link>
      <div className="flex items-center gap-3">
        {icon && (
          <span className="grid size-11 place-items-center rounded-xl bg-gradient-to-br from-brand-from via-brand-via to-brand-to text-white shadow-md shadow-primary/30">
            {icon}
          </span>
        )}
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
    </div>
  );
}
