"use client";

import React from "react";
import PrintItem from "@/component/PrintItem";

const A4_WIDTH_CM = 21;
const A4_HEIGHT_CM = 29.7;

const PrintArea = ({
  printItems,
  itemPositions,
  selectedSlotId,
  setSelectedSlotId,
  handleOpenCropModal,
}) => {
  return (
    <div className="a4-container-web">
      <div className="a4-paper-web">
        {printItems.map((item) => {
          const itemPositionInfo = itemPositions[item.id];
          if (!itemPositionInfo) return null;

          const { top, left, config } = itemPositionInfo;

          return (
            <PrintItem
              key={item.id}
              fotoUrl={item.selectedFotoUrl}
              config={config}
              position={{ top, left }}
              isSelected={selectedSlotId === item.id}
              onClick={() => setSelectedSlotId(item.id)}
              onCropClick={() => handleOpenCropModal(item)}
            />
          );
        })}
      </div>
    </div>
  );
};

export default PrintArea;
