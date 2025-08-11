import Image from "next/image";

export default function Home() {
    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 gap-8">
            <h1
                className="text-4xl sm:text-5xl font-extrabold text-center text-[#43e97b] drop-shadow-lg mb-2"
                style={{ fontFamily: "Comic Sans MS, Comic Sans, cursive" }}
            >
                33 things I have learned by the age of 33
            </h1>
            <div className="flex flex-col sm:flex-row items-center gap-6 w-full max-w-2xl justify-center">
                <Image
                    src="https://randomuser.me/api/portraits/men/33.jpg"
                    alt="Denis Shtabnoy, your life coach and guru"
                    width={128}
                    height={128}
                    className="w-32 h-32 rounded-full border-4 border-dashed border-[#43e97b] shadow-lg object-cover bg-gray-100"
                    style={{ filter: "grayscale(0.2) contrast(1.2)" }}
                    priority
                />
                <div className="flex flex-col items-center sm:items-start">
                    <p
                        className="text-lg font-semibold text-gray-700 text-center sm:text-left"
                        style={{
                            fontFamily: "Comic Sans MS, Comic Sans, cursive",
                        }}
                    >
                        Denis Shtabnoy,{" "}
                        <span className="line-through">
                            your life coach and guru
                        </span>{" "}
                        <span className="italic text-pink-500">
                            (self-proclaimed)
                        </span>
                    </p>
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
                <a
                    href="#"
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
                </a>
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
