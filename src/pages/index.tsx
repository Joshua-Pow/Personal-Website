import Head from "next/head";
import { Inter } from "@next/font/google";
import Header from "components/Header";
import Hero from "components/Hero";
import About from "components/About";
import Experience from "components/Experience";

//TODO: fix emojis on hero page
//TODO: add playground to website
//TODO: citi progrmaming languages on mobile dont fit
//TODO: Resizing on mobile for carosel doesnt work
//Add ids for components in experience section (https://github.com/framer/motion/issues/905)

const inter = Inter({ subsets: ["latin"] });
//--color-1: #02010a;
// --color-2: #140152;
// --color-3: #22007c;
// --color-4: #33108f;
export default function Home() {
  return (
    <div
      className="min-h-screen bg-[rgb(36,36,36)] text-white h-screen snap-y snap-mandatory overflow-y-scroll
     overflow-x-hidden z-0 scrollbar-track-gray-400/20 scrollbar-thumb-[#683ED8]/80"
    >
      <Head>
        <title>Joshua&apos;s Website</title>
      </Head>

      <Header />

      <section id="hero" className="snap-start">
        <Hero />
      </section>

      <section id="about" className="snap-center">
        <About />
      </section>

      <section id="experience" className="snap-center">
        <Experience />
      </section>
    </div>
  );
}
