"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  IoCheckmarkCircleSharp,
  IoCloseCircleOutline,
  IoTrashOutline,
} from "react-icons/io5";

const RightPanel = ({
  availableFotos,
  loading,
  error,
  printItems,
  selectedSlotId,
  handlePilihFotoToSlot,
  addPrintBlock,
  removePrintItem,
  TEMPLATE_DEFINITIONS,
}) => {
  const [selectedAddTemplateKey, setSelectedAddTemplateKey] = useState("");
  const [numToAdd, setNumToAdd] = useState(1);

  return (
    <div className="right-panel p-4 no-print">
      <h2 className="text-xl font-bold mb-4">Pengaturan Cetak</h2>

      <div className="mb-6 border-b pb-4">
        <h3 className="text-lg font-semibold mb-2">Pilih Template:</h3>
        <div className="flex flex-col gap-3">
          <select
            value={selectedAddTemplateKey}
            onChange={(e) => setSelectedAddTemplateKey(e.target.value)}
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="" disabled>
              Pilih Template Cetak
            </option>
            {Object.keys(TEMPLATE_DEFINITIONS).map((key) => (
              <option key={key} value={key}>
                {TEMPLATE_DEFINITIONS[key].name}
              </option>
            ))}
          </select>

          {TEMPLATE_DEFINITIONS[selectedAddTemplateKey]?.blockType ===
            "single_item" && (
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                value={numToAdd}
                onChange={(e) =>
                  setNumToAdd(Math.max(1, parseInt(e.target.value) || 1))
                }
                className="w-20 p-2 border border-gray-300 rounded-md text-center"
              />
              <span className="text-sm text-gray-600">slot</span>
            </div>
          )}

          <button
            onClick={() => addPrintBlock(selectedAddTemplateKey, numToAdd)}
            disabled={!selectedAddTemplateKey}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Tambah Slot
            {TEMPLATE_DEFINITIONS[selectedAddTemplateKey]?.blockType ===
            "composite"
              ? " Blok 4x4"
              : " Foto"}
          </button>
        </div>
      </div>

      <h3 className="text-lg font-semibold mt-8 mb-4 border-b pb-2">
        Pilih Fotonya Coy!
        {selectedSlotId && (
          <span className="ml-2 text-emerald-600 text-sm">
            (Slot :{" "}
            {printItems.findIndex((item) => item.id === selectedSlotId) + 1})
          </span>
        )}
      </h3>

      <div className="grid grid-cols-2 gap-3 mt-4">
        {loading && (
          <p className="text-center text-gray-500 py-4 col-span-2">
            Tunggu bentar coy!
          </p>
        )}
        {error && (
          <p className="text-center text-red-500 py-4 col-span-2">{error}</p>
        )}
        {!loading && !error && availableFotos.length === 0 && (
          <p className="text-center text-gray-500 py-4 col-span-2">
            Lo belum upload foto, Upload dulu.
          </p>
        )}
        {availableFotos.map((fotoUrl, index) => (
          <div
            key={index}
            className={`cursor-pointer border-2 rounded-md overflow-hidden transition-all duration-200 relative
              ${
                printItems.some((item) => item.selectedFotoUrl === fotoUrl)
                  ? "border-green-500 ring-2 ring-green-500"
                  : "border-gray-200 hover:border-gray-400"
              }
              ${
                selectedSlotId
                  ? "opacity-100"
                  : "opacity-50 pointer-events-none"
              }
            `}
            onClick={() => handlePilihFotoToSlot(fotoUrl)}
          >
            <Image
              src={fotoUrl}
              alt={`Foto tersedia ${index + 1}`}
              width={200}
              height={150}
              className="object-cover w-full h-24"
            />
            {printItems.some((item) => item.selectedFotoUrl === fotoUrl) && (
              <div className="absolute top-1 right-1  text-emerald-500 text-xs px-2 py-1 rounded-full">
                <IoCheckmarkCircleSharp className="size-5" />
              </div>
            )}
          </div>
        ))}
      </div>

      <h3 className="text-lg font-semibold mt-8 mb-4 border-b pb-2">Layers:</h3>
      <div className="flex flex-col gap-2">
        {printItems.length === 0 && (
          <p className="text-center text-gray-500">Layer kosong coy!.</p>
        )}
        {printItems.map((item, index) => {
          const templateDef = TEMPLATE_DEFINITIONS[item.templateKey];
          if (!templateDef) return null;

          let displayName = `Slot ${index + 1}`;
          if (templateDef.blockType === "composite") {
            if (item.templateKey === "4x4_full_layout") {
              const groupColor = item.slotIndex < 4 ? "Hitam" : "Abu";
              const slotNumberInGroup = (item.slotIndex % 4) + 1;
              displayName = `4x4 (${groupColor} Slot ${slotNumberInGroup})`;
            } else {
              displayName = `${templateDef.name} (Slot ${item.slotIndex + 1})`;
            }
          } else {
            displayName = `${templateDef.name} (Slot ${index + 1})`;
          }

          return (
            <div
              key={item.id}
              className={`flex items-center justify-between p-2 border rounded-md bg-gray-50
              ${
                selectedSlotId === item.id
                  ? "border-emerald-500 ring-1 ring-emerald-500"
                  : ""
              }`}
            >
              <span className="text-sm font-medium flex items-center gap-2">
                {index + 1}. {displayName}{" "}
                {item.selectedFotoUrl ? (
                  <IoCheckmarkCircleSharp className="size-4 text-emerald-500" />
                ) : (
                  <IoCloseCircleOutline className="size-4 text-red-500" />
                )}
              </span>
              <button
                onClick={() => removePrintItem(item.id)}
                className="bg-red-500 text-white px-2 py-1 rounded-md text-xs hover:bg-red-600"
              >
                <IoTrashOutline className="size-4" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RightPanel;
