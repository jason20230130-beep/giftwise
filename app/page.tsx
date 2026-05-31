import { GiftFinder } from "@/components/GiftFinder";

export default function Home() {
  return (
    <>
      <header className="topbar">
        <a className="brand" href="#finder" aria-label="Giftwise home">
          <span className="brand-mark">G</span>
          <span>Giftwise</span>
        </a>
        <span className="header-note">AI gift finder</span>
      </header>

      <main>
        <GiftFinder />
      </main>

      <footer className="footer">
        <p>
          Giftwise may earn a commission from qualifying purchases. Prices and availability can change, so use retailer pages for current details.
        </p>
      </footer>
    </>
  );
}
