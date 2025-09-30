"use client";
import { useState } from "react";
import { Share2, Copy } from "lucide-react";
import { toast } from "sonner";

export default function ShareButton({ url }: { url: string }) {
  const [isCopied, setIsCopied] = useState(false);

  const handleShare = async () => {
    if (navigator.share) {
      // Mobile: use native share
      try {
        await navigator.share({
          title: "Check this out!",
          url,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      // Desktop: copy link
      try {
        await navigator.clipboard.writeText(url);
        setIsCopied(true);
        toast.success("✅ Link copied to clipboard!");
        setTimeout(() => setIsCopied(false), 2000);
      } catch (err) {
        console.error("Clipboard error:", err);
        toast.error("❌ Failed to copy link");
      }
    }
  };

  return (
    <button
      onClick={handleShare}
      className="p-2 border border-gray-300 rounded-full hover:bg-gray-50 transition"
      title="Share"
    >
      {isCopied ? <Copy size={18} /> : <Share2 size={18} />}
    </button>
  );
}
