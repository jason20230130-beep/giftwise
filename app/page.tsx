import { GiftFinder } from "@/components/GiftFinder";
import { SiteHeader } from "@/components/SiteHeader";

export default function Home() {
  return (
    <>
      <SiteHeader />

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
