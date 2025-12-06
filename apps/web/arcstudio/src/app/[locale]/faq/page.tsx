"use client";

import { ReactNode } from "react";
import { Accordion, AccordionItem, Avatar } from "@heroui/react";

interface FAQItem {
    question: ReactNode;
    startContent?: ReactNode;
    subtitle?: ReactNode;
    answer: ReactNode;
}

const faqs: FAQItem[] = [
    {
        question: "O que a ARC Studio faz?",
        startContent: (
            <Avatar
                isBordered
                color="primary"
                radius="lg"
                src="/favicon.ico"
            />
        ),
        subtitle: "Clique para expandir",
        answer: (
            <>
                A ARC Studio transforma ideias em experiências digitais memoráveis. Oferecemos serviços de design, desenvolvimento de aplicações, experiências interativas e conteúdo digital que conecta marcas e pessoas.
            </>
        ),
    },
    {
        question: "Quais são os diferenciais da ARC Studio?",
        subtitle: (
            <>
                Nosso diferencial está na <strong>criatividade e tecnologia</strong>
            </>
        ),
        answer: (
            <>
                Cada projeto é personalizado, inovador e entregue com atenção aos detalhes e excelência.
            </>
        ),
    },
    {
        question: "Como posso solicitar um orçamento?",
        subtitle: "Entre em contato conosco",
        answer: (
            <>
                Você pode entrar em contato através do nosso <strong>formulário de contato</strong> ou pelo e-mail oficial. Nossa equipe vai entender sua necessidade e apresentar uma proposta personalizada.
            </>
        ),
    },
    {
        question: "Vocês trabalham com empresas de qualquer tamanho?",
        subtitle: "Para todos os tamanhos de empresa",
        answer: (
            <>
                Sim! Atuamos com startups, PMEs e grandes empresas, adaptando nossa abordagem para oferecer soluções de acordo com cada cliente.
            </>
        ),
    },
    {
        question: "Qual é o tempo médio de entrega de um projeto?",
        subtitle: "Depende do projeto",
        answer: (
            <>
                O prazo varia de acordo com a complexidade do projeto, mas sempre buscamos entregar resultados de alta qualidade dentro de um cronograma realista, mantendo comunicação constante com o cliente.
            </>
        ),
    },
];

export default function FAQ() {
    return (
        <div className="max-w-5xl mx-auto py-16 px-4">
            <h2 className="text-4xl font-extrabold text-center mb-12">Perguntas Frequentes</h2>
            <Accordion defaultExpandedKeys={["0"]} className="space-y-4">
                {faqs.map((faq, index) => (
                    <AccordionItem
                        key={index}
                        aria-label={`Accordion ${index + 1}`}
                        title={faq.question}
                        subtitle={faq.subtitle}
                        startContent={faq.startContent}
                    >
                        <div className="text-lg">{faq.answer}</div>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    );
}
