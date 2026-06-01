"use client";

import { Bookmark as BookmarkSimple } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="topbar">
      <a className="brand" href="#finder" aria-label="Giftwise home">
        <span className="brand-mark">G</span>
        <span>Giftwise</span>
      </a>
      <nav>
        <a href="#how-it-works">How it works</a>
        <button title="Saved gifts are coming soon" type="button">
          Saved gifts <BookmarkSimple size={18} />
        </button>
      </nav>
    </header>
  );
}
