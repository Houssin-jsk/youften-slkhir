import Image from "next/image";
import { HoneyAnimation } from "@/components/honey-animation";

export default function Home() {
  return (
    <main className="landing-page flex min-h-svh items-center justify-center px-6 py-10 sm:px-8">
      <div className="coming-soon flex w-full flex-col items-center text-center">
        <Image
          className="brand-logo entrance"
          src="/logo.png"
          alt="Logo officiel Youften Slkhir"
          width={660}
          height={660}
          sizes="(max-width: 640px) 220px, 260px"
          preload
        />
        <h1 className="brand-message entrance">
          <span className="brand-name">Youften Slkhir</span>
          <span className="message-status">Site officiel en préparation</span>
        </h1>
        <HoneyAnimation />
      </div>
    </main>
  );
}
