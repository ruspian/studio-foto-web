// components/PrintArea.js
"use client";

import React from "react";
import PrintItem from "@/component/PrintItem";

const A4_WIDTH_CM = 21;
const A4_HEIGHT_CM = 29.7;

const PrintArea = ({
  allItems, // Prop baru yang berisi semua item (foto & logo)
  selectedSlotId,
  setSelectedSlotId,
  handleOpenCropModal,
}) => {
  return (
    <div className="a4-container-web">
      <div className="a4-paper-web">
        {/* Menggunakan Object.values untuk memetakan semua item di objek */}
        {Object.values(allItems).map((item) => {
          const { id, selectedFotoUrl, config, position, isLogo } = item;
          return (
            <PrintItem
              key={id}
              fotoUrl={selectedFotoUrl}
              config={config}
              position={position}
              isSelected={selectedSlotId === id}
              onClick={() => {
                // Hanya izinkan slot foto yang dipilih, bukan logo
                if (!isLogo) {
                  setSelectedSlotId(id);
                }
              }}
              onCropClick={() => handleOpenCropModal(item)}
              isLogo={isLogo}
            />
          );
        })}
      </div>
    </div>
  );
};

export default PrintArea;
