import { HelpCircle } from "lucide-react";

import styles from "./BottomNavigation.module.css";

function FAQIcon() {
  return (
    <div className={styles.faqIcon} data-name="faq">
      <HelpCircle size={18} />
    </div>
  );
}

export function FAQButton() {
  const faqUrl =
    process.env.NEXT_PUBLIC_FAQ_URL || "https://www.nitcelcius.me/r/github";

  const handleFAQClick = () => {
    // Open external link for FAQ
    window.open(faqUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className={styles.faqButton} onClick={handleFAQClick} title="製作者">
      <FAQIcon />
    </div>
  );
}
