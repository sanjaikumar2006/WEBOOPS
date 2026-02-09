'use client';

import {
  MapPin,
  Mail,
  Phone,
  Smartphone,
  Youtube,
  Linkedin,
  Instagram
} from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-blue-950 via-blue-700 to-blue-950 text-white">

      <div className="max-w-7xl mx-auto px-6 py-2">
        <div className="grid grid-cols-1 md:grid-cols-3 items-center text-sm gap-4">

          {/* LEFT – GET IN TOUCH (REDUCED) */}
          <div className="space-y-1 text-xs">
            <h3 className="font-semibold text-sm mb-1">Get in touch</h3>

            <div className="flex gap-2">
              <MapPin size={14} />
              <p>#60, Avadi – Vel Tech Road, Chennai – 600062</p>
            </div>

            <div className="flex gap-2">
              <Mail size={14} />
              <p>admission@velhightech.com</p>
            </div>

            <div className="flex gap-2">
              <Phone size={14} />
              <p>1800 212 7669</p>
            </div>
          </div>

          {/* CENTER – COLLEGE NAME */}
          <div className="text-center">
            <h1 className="text-base md:text-lg font-bold leading-tight">
              Vel Tech High Tech 
            </h1>
            <h2 className="text-base md:text-lg font-bold leading-tight">
              Dr. Rangarajan Dr. Sakunthala 
            </h2>
            <p className="text-xs text-gray-300">
              Engineering College (Autonomous)
            </p>
          </div>

          {/* RIGHT – FOLLOW US */}
          <div className="text-center md:text-right">
            <h3 className="font-semibold text-sm mb-1">Follow Us</h3>
            <div className="flex justify-center md:justify-end gap-3">
              <a href="#"><Youtube size={18} /></a>
              <a href="#"><Linkedin size={18} /></a>
              <a href="#"><Instagram size={18} /></a>
            </div>
          </div>

        </div>
      </div>

      {/* BOTTOM BAR */}
      <div className="border-t border-white/20 py-1 text-center text-xs text-gray-300">
        © 2026 Vel Tech High Tech. All Rights Reserved.
      </div>

    </footer>
  );
}