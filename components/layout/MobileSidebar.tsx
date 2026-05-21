"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import Sidebar from "./Sidebar";
import type { Module } from "@/types";

interface MobileSidebarProps {
  modules: Module[];
  completedVideoIds: string[];
  totalVideos: number;
  currentVideoId?: string;
  profileName: string;
}

export default function MobileSidebar(props: MobileSidebarProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-navy px-4 py-3 flex items-center justify-between">
        <div>
          <Image
            src="/logo-coachdazet.png"
            alt="Coachdazet Formation"
            width={160}
            height={31}
            priority
            className="h-8 w-auto"
          />
        </div>
        <button
          onClick={() => setOpen(true)}
          className="text-white p-1"
          aria-label="Ouvrir le menu"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Backdrop */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 z-50"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`lg:hidden fixed top-0 left-0 bottom-0 z-50 transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="relative h-full">
          <button
            onClick={() => setOpen(false)}
            className="absolute top-4 right-[-40px] text-white bg-navy/80 p-1.5 rounded-r-lg"
            aria-label="Fermer le menu"
          >
            <X size={18} />
          </button>
          <Sideb