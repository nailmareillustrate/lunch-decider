"use client";

import * as React from "react";
import { api } from "@/lib/client";

export function useMeta() {
  const [categories, setCategories] = React.useState<string[]>([]);
  const [tags, setTags] = React.useState<string[]>([]);

  const reload = React.useCallback(() => {
    api
      .meta()
      .then((m) => {
        setCategories(m.categories);
        setTags(m.tags);
      })
      .catch(() => {});
  }, []);

  React.useEffect(() => {
    reload();
  }, [reload]);

  return { categories, tags, reload };
}
