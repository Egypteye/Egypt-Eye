"use client";

import { buttonClass } from "@/components/os/ui";
import { Icon } from "@/components/os/icons";

export function PrintButton() {
  return (
    <button onClick={() => window.print()} className={buttonClass.primary}>
      <Icon.Print size={15} />Print or save as PDF
    </button>
  );
}
