"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";

interface LoadingStep<T = unknown> {
    name: string;
    loader: () => Promise<T>;
}

interface LoadingProps {
    steps: LoadingStep[];
    onFinish: () => void;
}

export function Loading({ steps, onFinish }: LoadingProps) {
    const [progress, setProgress] = useState(0);
    const [log, setLog] = useState<string>("");

    const progressRef = useRef(0);

    useEffect(() => {
        let isMounted = true;

        const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

        const animateProgress = (start: number, end: number, duration: number) => {
            return new Promise<void>((resolve) => {
                const startTime = performance.now();
                const step = (time: number) => {
                    const elapsed = time - startTime;
                    const t = Math.min(elapsed / duration, 1);
                    const nextProgress = Math.round(start + (end - start) * t);
                    setProgress(nextProgress);
                    progressRef.current = nextProgress;
                    if (t < 1) requestAnimationFrame(step);
                    else resolve();
                };
                requestAnimationFrame(step);
            });
        };

        const runSteps = async () => {
            for (let i = 0; i < steps.length; i++) {
                const step = steps[i];
                setLog(`Starting ${step.name}`);

                try {
                    await step.loader();

                    const start = progressRef.current;
                    const end = Math.round(((i + 1) / steps.length) * 100);
                    await animateProgress(start, end, 1500);
                } catch (err) {
                    await delay(500);
                    setLog(`Error loading ${step.name}`);
                    console.error(err);
                }
            }
            if (isMounted) onFinish();
        };

        runSteps();

        return () => {
            isMounted = false;
        };
    }, [steps, onFinish]);

    return (
        <div className="fixed inset-0 w-full h-full flex flex-col justify-end z-50">
            <div className="w-full p-2">
                <div className="fixed inset-0 w-full h-full flex items-center justify-center z-50">
                    <Image
                        src="/favicon.ico"
                        alt="Loading"
                        width={128}
                        height={128}
                        priority
                    />
                </div>
                <div className="relative w-full h-6 rounded overflow-hidden">
                    <div
                        className="absolute left-0 top-0 h-full bg-primary transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center font-mono text-sm pointer-events-none">
                        {log}
                    </div>
                </div>
            </div>
        </div>
    );
}
