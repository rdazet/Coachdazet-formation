"use client";

import { useEffect, useRef } from "react";

interface Props {
  src: string;
  title: string;
}

export default function AutoResizeFrame({ src, title }: Props) {
  const ref = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (e.data?.type === "iframeHeight" && ref.current) {
        ref.current.style.height = e.data.height + "px";
      }
      if (e.data?.type === "scrollTop") {
        window.scrollTo({ top: 0, behavior: "instant" });
        const main = document.querySelector("main");
        if (main) main.scrollTo({ top: 0, behavior: "instant" });
      }
      if (e.data?.type === "scrollToBtn" && ref.current) {
        const iframe = ref.current;
        const main = document.querySelector("main");
        const currentScroll = main ? main.scrollTop : window.scrollY;
        const iframeTop = iframe.getBoundingClientRect().top + currentScroll;
        const btnBottom = iframeTop + e.data.btnTop + e.data.btnHeight;
        // Scroll so button sits at 85% from top of viewport
        const target = btnBottom - window.innerHeight * 0.85;
        if (main) {
          main.scrollTo({ top: target, behavior: "smooth" });
        } else {
          window.scrollTo({ top: target, behavior: "smooth" });
        }
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return (
    <iframe
      ref={ref}
      src={src}
      title={title}
      className="w-full border-0 block"
      style={{ height: "600px" }}
      scrolling="no"
    />
  );
}
