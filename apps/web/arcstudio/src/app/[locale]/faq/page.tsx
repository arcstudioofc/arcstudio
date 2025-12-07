"use client";

import { Accordion, AccordionItem, Avatar } from "@heroui/react";
import { useTranslations } from "next-intl";


export default function FAQ() {
    const t = useTranslations('Faq');

    const dynamicFaqs = Array.from({ length: 5 }, (_, index) => {
        const key = index.toString();
        const question = t(`items.${key}.question`);
        const subtitleKey = `items.${key}.subtitle`;
        const answerKey = `items.${key}.answer`;

        const renderSubtitle = () => {
            return t.rich(subtitleKey, {
                bold: (children) => <strong>{children}</strong>,
            });
        };

        const renderAnswer = () => {
            return t.rich(answerKey, {
                bold: (children) => <strong>{children}</strong>,
            });
        };

        const startContent = index === 0 ? (
            <Avatar
                isBordered
                color="primary"
                radius="lg"
                src="/favicon.ico"
            />
        ) : undefined;


        return (
             <AccordionItem
                key={key}
                aria-label={`Accordion ${index + 1}`}
                title={question}
                subtitle={renderSubtitle()}
                startContent={startContent}
            >
                <div className="text-lg">{renderAnswer()}</div>
            </AccordionItem>
        );
    });

    return (
        <div className="max-w-5xl mx-auto py-16 px-4">
            <h2 className="text-4xl font-extrabold text-center mb-12">{t('title')}</h2>
            <Accordion defaultExpandedKeys={["0"]} className="space-y-4">
                {dynamicFaqs}
            </Accordion>
        </div>
    );
}