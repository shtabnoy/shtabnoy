"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export default function Home() {
    const photoCount = 7;
    const [index, setIndex] = useState(0);
    const [fade, setFade] = useState(true);
    const [showRickroll, setShowRickroll] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const iframeRef = useRef<HTMLIFrameElement | null>(null);

    useEffect(() => {
        intervalRef.current = setInterval(() => {
            setFade(false);
            setTimeout(() => {
                setIndex((prev) => (prev + 1) % photoCount);
                setFade(true);
            }, 400); // fade out, then change, then fade in
        }, 5000);
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []);

    useEffect(() => {
        return () => {
            const interval = intervalRef.current;
            if (interval) clearInterval(interval);
        };
    }, [showRickroll]);

    useEffect(() => {
        if (showRickroll && iframeRef.current) {
            const iframe = iframeRef.current;
            setTimeout(() => {
                if (iframe.requestFullscreen) {
                    iframe.requestFullscreen();
                } else if (
                    (
                        iframe as unknown as {
                            webkitRequestFullscreen?: () => void;
                        }
                    ).webkitRequestFullscreen
                ) {
                    (
                        iframe as unknown as {
                            webkitRequestFullscreen: () => void;
                        }
                    ).webkitRequestFullscreen();
                } else if (
                    (iframe as unknown as { mozRequestFullScreen?: () => void })
                        .mozRequestFullScreen
                ) {
                    (
                        iframe as unknown as {
                            mozRequestFullScreen: () => void;
                        }
                    ).mozRequestFullScreen();
                } else if (
                    (iframe as unknown as { msRequestFullscreen?: () => void })
                        .msRequestFullscreen
                ) {
                    (
                        iframe as unknown as { msRequestFullscreen: () => void }
                    ).msRequestFullscreen();
                }
            }, 500);
        }
    }, [showRickroll]);

    if (showRickroll) {
        return (
            <div
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100vw",
                    height: "100vh",
                    zIndex: 9999,
                    background: "#000",
                }}
            >
                <iframe
                    ref={iframeRef}
                    width="100%"
                    height="100%"
                    src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&fs=1"
                    title="YouTube video player"
                    frameBorder="0"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                    style={{ width: "100vw", height: "100vh", border: 0 }}
                ></iframe>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 gap-8">
            <h1
                className="text-4xl sm:text-5xl font-extrabold text-center text-[#43e97b] drop-shadow-lg mb-2"
                style={{ fontFamily: "Comic Sans MS, Comic Sans, cursive" }}
            >
                <span className="text-red-500">33</span> things
                <br />I have learned
                <br />
                by the age of <span className="text-red-500">33</span>
            </h1>
            <div className="flex flex-col sm:flex-row items-center gap-6 w-full max-w-2xl justify-center">
                <div className="w-42 h-42 flex-shrink-0 border-4 border-dashed border-[#43e97b] rounded-full shadow-lg bg-gray-100">
                    <Image
                        src={`/photos/me${index}.JPG`}
                        alt={`Denis Shtabnoy, your life coach and guru, photo ${index}`}
                        width={160}
                        height={160}
                        className={`w-40 h-40 aspect-square rounded-full object-cover transition-opacity duration-400 ${
                            fade ? "opacity-100" : "opacity-0"
                        }`}
                        style={{ filter: "grayscale(0.2) contrast(1.2)" }}
                        priority
                    />
                </div>
                <div className="flex flex-col items-center sm:items-start">
                    <div
                        className="text-lg font-semibold text-gray-700 text-center sm:text-left"
                        style={{
                            fontFamily: "Comic Sans MS, Comic Sans, cursive",
                        }}
                    >
                        <div>Denis Shtabnoy,</div>
                        <div>
                            your life coach and guru{" "}
                            <span className="italic text-pink-500">
                                (self-proclaimed)
                            </span>
                        </div>
                    </div>
                    <p
                        className="text-base text-gray-500 mt-2 text-center sm:text-left"
                        style={{
                            fontFamily: "Comic Sans MS, Comic Sans, cursive",
                        }}
                    >
                        &quot;I have read at least 2.5 self-help books and
                        watched 100+ motivational TikToks, so you know you can
                        trust me.&quot;
                    </p>
                </div>
            </div>
            <div className="flex flex-col items-center mt-8">
                <button
                    onClick={() => {
                        // Initiate PDF download
                        // const link = document.createElement("a");
                        // link.href = encodeURI("/Denis_Shtabnoy__33_by_33.pdf");
                        // link.download = "Denis Shtabnoy | 33 by 33.pdf";
                        // document.body.appendChild(link);
                        // link.click();
                        // document.body.removeChild(link);
                        setShowRickroll(true);
                    }}
                    className="px-8 py-4 text-xl font-bold text-white border-2 border-dashed rounded-xl shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg animate-bounce"
                    style={{
                        background:
                            "linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)",
                        color: "#222",
                        borderColor: "#43e97b",
                        fontFamily: "Comic Sans MS, Comic Sans, cursive",
                        textShadow: "1px 1px 0 #fff8, 0 2px 8px #43e97b88",
                    }}
                >
                    Download PDF file here
                </button>
                <p
                    className="text-xs text-gray-400 mt-2"
                    style={{ fontFamily: "Comic Sans MS, Comic Sans, cursive" }}
                >
                    (Definitely not a virus. Probably.)
                </p>
            </div>
        </div>
    );
}
