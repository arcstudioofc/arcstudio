"use client";

import { useState, useEffect } from "react";
import { useLocale } from "./useLocale";

type MessagesObject = {
  [key: string]: string | MessagesObject;
};

function getNested(obj: MessagesObject, key: string): string | undefined {
  return key.split(".").reduce<string | MessagesObject | undefined>((res, k) => {
    if (res && typeof res === "object") return res[k];
    return undefined;
  }, obj) as string | undefined;
}

type Params = Record<string, string | number>;

export function useTranslations(namespace?: string) {
  const { locale } = useLocale();
  const [messages, setMessages] = useState<MessagesObject>({});

  useEffect(() => {
    let isMounted = true;

    const loadMessages = async () => {
      try {
        const data: { default: MessagesObject } = await import(`@/lib/i18n/messages/${locale}.json`);
        if (isMounted) setMessages(data.default);
      } catch (error) {
        console.error("Failed to load messages:", error);
        if (isMounted) setMessages({});
      }
    };

    loadMessages();

    return () => {
      isMounted = false;
    };
  }, [locale]);

  const t = (key: string, params?: Params): string => {
    const fullKey = namespace ? `${namespace}.${key}` : key;
    let value = getNested(messages, fullKey) ?? key;

    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        value = value.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
      });
    }

    return value;
  };

  return t;
}
