
import React, { useState, type ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';

interface CollapsibleSectionProps {
  id: string;
  title: string;
  icon: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ id, title, icon, children, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-gray-700 rounded-2xl bg-gray-800/40 shadow-md transition-all duration-300">
      <button
        onClick={() => setIsOpen(o => !o)}
        className="flex items-center gap-3 w-full text-left p-4 focus:outline-none focus:ring-2 focus:ring-cyan-500 rounded-t-2xl"
        aria-expanded={isOpen}
        aria-controls={`section-${id}`}
      >
        <ChevronRight className={`transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} size={20} />
        <div className="flex items-center gap-2 text-cyan-300">
          {icon}
          <h3 className="font-semibold text-lg text-white">{title}</h3>
        </div>
      </button>
      {isOpen && (
        <div id={`section-${id}`} className="p-4 pt-2 pl-12 border-t border-gray-700/50">
          <div className="space-y-3 text-gray-300">
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

export default CollapsibleSection;
