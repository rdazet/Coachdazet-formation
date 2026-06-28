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
