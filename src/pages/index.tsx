import Head from "next/head";
import { Inter } from "@next/font/google";
import Header from "components/Header";
import Hero from "components/Hero";

const inter = Inter({ subsets: ["latin"] });
//--color-1: #02010a;
// --color-2: #140152;
// --color-3: #22007c;
// --color-4: #33108f;
export default function Home() {
  return (
    <div className="bg-[rgb(36,36,36)] text-white h-screen snap-y snap-mandatory overflow-scroll z-0">
      <Head>
        <title>Joshua&apos;s Website</title>
      </Head>

      <Header />

      <section id="hero">
        <Hero />
      </section>
    </div>
  );
}
