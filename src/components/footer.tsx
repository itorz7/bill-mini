"use client";

import { ExternalLink } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-800 bg-black/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-center md:text-left">
            <p className="text-gray-400">
              © {currentYear} | TOR EIEI
            </p>
          </div>
          
          <div className="text-center md:text-right">
            <p className="text-gray-400 text-sm mb-2">
              ให้เรื่องสลิป เป็นเรื่อง Easy
            </p>
            <p className="text-gray-400 text-sm">
              Powered By{" "}
              <a
                href="https://easyslip.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 inline-flex items-center gap-1 transition-colors"
              >
                EasySlip
                <ExternalLink className="h-3 w-3" />
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}