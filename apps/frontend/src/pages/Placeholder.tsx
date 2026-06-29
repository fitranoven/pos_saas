import React from 'react';
import { Construction } from 'lucide-react';
import { motion } from 'framer-motion';

interface PlaceholderProps {
  title: string;
  description: string;
}

const Placeholder: React.FC<PlaceholderProps> = ({ title, description }) => (
  <div className="p-6 h-full flex items-center justify-center">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center max-w-md"
    >
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#1E3A8A]/10 to-[#1E3A8A]/5 flex items-center justify-center mx-auto mb-5">
        <Construction size={36} className="text-[#1E3A8A]" />
      </div>
      <h2 className="text-2xl font-bold text-[#0F172A] mb-2">{title}</h2>
      <p className="text-[#64748B] text-sm leading-relaxed">{description}</p>
      <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#64748B] font-medium">
        <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse"></span>
        Akan hadir di Phase 2
      </div>
    </motion.div>
  </div>
);

export default Placeholder;
