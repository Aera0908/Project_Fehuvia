import React from 'react';
import { Landmark } from 'lucide-react';

export function BankLogo({ bankId, className = "w-8 h-8" }) {
  const id = bankId?.toLowerCase();

  // Map each bankId directly to its official actual horizontal brand logo PNG downloaded locally in the public folder
  const logoUrls = {
    gcash: '/bank-logo/gcash-seeklogo.png',
    bdo: '/bank-logo/BDO_Unibank_idSAwwVGmk_1.png',
    ubp: '/bank-logo/UnionBank_of_the_Philippines_idYcVv14C1_1.png',
    unionbank: '/bank-logo/UnionBank_of_the_Philippines_idYcVv14C1_1.png',
    bpi: '/bank-logo/bpi.png',
    maya: '/bank-logo/maya-seeklogo.png'
  };
  const logoUrl = logoUrls[id];

  if (logoUrl) {
    return (
      <img 
        src={logoUrl} 
        alt={bankId} 
        className={`${className} object-contain bg-white p-1 rounded-xl border border-[#D4AF37]/30 shadow-lg`}
      />
    );
  }

  return (
    <div className={`rounded-full bg-gold-metallic/10 border border-gold-metallic/30 flex items-center justify-center text-gold-metallic shrink-0 ${className}`}>
      <Landmark className="w-1/2 h-1/2" />
    </div>
  );
}

