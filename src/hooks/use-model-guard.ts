"use client";

import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useModelStore } from "@/stores/model-store";
import { toast } from "sonner";
import type { Capability } from "@/stores/model-store";

/**
 * Returns a guard() function for the given model capability.
 * Call guard() at the top of any AI generation handler.
 * Returns false (and shows a toast) if the model is not configured.
 * Returns true if the model is configured and the action can proceed.
 */
export function useModelGuard(capability: Capability): () => boolean {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("settings");
  // Use selector pattern (consistent with codebase; avoids re-renders on unrelated store changes)
  const getModelConfig = useModelStore((s) => s.getModelConfig);

  return function guard(): boolean {
    // If the store hasn't hydrated from localStorage yet, allow through.
    // The API will handle missing config server-side.
    if (!useModelStore.persist.hasHydrated()) {
      return true;
    }

    const config = getModelConfig();

    if (config[capability] === null) {
      const messageKey =
        capability === "text"
          ? "notConfiguredText"
          : capability === "image"
            ? "notConfiguredImage"
            : "notConfiguredVideo";

      toast.warning(t(messageKey), {
        action: {
          label: t("goSettings"),
          onClick: () => router.push(`/${locale}/settings`),
        },
      });
      return false;
    }

    return true;
  };
}
