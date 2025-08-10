"use client";

import React from "react";
import Image from "next/image";
import { MdCropFree } from "react-icons/md";

const PrintItem = ({
  fotoUrl,
  config,
  position,
  isSelected,
  onClick,
  onCropClick,
  isBlock,
  blockData,
  selectedSlotId,
  setSelectedSlotId,
}) => {
  if (!config) return null;

  // --- RENDER BLOK KOMPOSIT (UNTUK TEMPLATE 3x2) ---
  if (isBlock) {
    const {
      blockWidthCm,
      blockHeightCm,
      bingkaiColorClass,
      FOTO_LEBAR_CM,
      FOTO_TINGGI_CM,
      LOGO_TINGGI_CM,
      logoSrc,
      BORDER_BINGKAI_CM,
    } = config;

    return (
      <div
        className="composite-block"
        style={{
          width: `${blockWidthCm}cm`,
          height: `${blockHeightCm}cm`,
          top: position.top,
          left: position.left,
          backgroundColor:
            bingkaiColorClass === "hitam"
              ? "#000"
              : bingkaiColorClass === "abu"
              ? "#aaa"
              : "transparent",
        }}
      >
        {/* Render semua slot foto di dalam blok */}
        {blockData.map((slot) => {
          const slotConfig = {
            ...config,
            fotoWidthCm: FOTO_LEBAR_CM,
            fotoHeightCm: FOTO_TINGGI_CM,
          };
          return (
            <PrintItem
              key={slot.slotId}
              fotoUrl={slot.selectedFotoUrl}
              config={slotConfig}
              position={{ top: "0", left: "0" }}
              isSelected={selectedSlotId === slot.slotId}
              onClick={() => setSelectedSlotId(slot.slotId)}
              onCropClick={() =>
                onCropClick({ ...slot, templateKey: config.templateKey })
              }
            />
          );
        })}

        {/* Render area logo di bagian bawah blok */}
        <div
          className="logo-item"
          style={{
            height: `${LOGO_TINGGI_CM}cm`,
            width: `${FOTO_LEBAR_CM}cm`,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            position: "relative",
          }}
        >
          <div
            style={{
              width: `${FOTO_LEBAR_CM - 2 * BORDER_BINGKAI_CM}cm`,
              height: `${LOGO_TINGGI_CM - 2 * BORDER_BINGKAI_CM}cm`,
              position: "relative",
            }}
          >
            {logoSrc && (
              <Image
                src={logoSrc}
                alt="Logo Studio"
                fill
                style={{ objectFit: "contain" }}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER ITEM FOTO UNTUK PAS FOTO ATAU SLOTS 4X4 ---
  const {
    fotoWidthCm,
    fotoHeightCm,
    borderThicknessCm,
    paddingFotoCm,
    logoHeightCm,
    dashBorderThicknessCm,
    dashBorderColor,
    bingkaiColorClass,
    logoSrc,
  } = config;

  const imageWidth = fotoWidthCm - 2 * borderThicknessCm - 2 * paddingFotoCm;
  const imageHeight =
    fotoHeightCm -
    2 * borderThicknessCm -
    2 * paddingFotoCm -
    (logoHeightCm || 0);

  return (
    <div
      className={`foto-bingkai-item ${bingkaiColorClass} ${
        isSelected ? "selected-slot" : ""
      }`}
      style={{
        width: `${fotoWidthCm}cm`,
        height: `${fotoHeightCm}cm`,
        top: position.top,
        left: position.left,
        border: `${borderThicknessCm}cm solid ${
          bingkaiColorClass === "hitam"
            ? "#000"
            : bingkaiColorClass === "abu"
            ? "#aaa"
            : "transparent"
        }`,
        backgroundColor:
          bingkaiColorClass === "hitam"
            ? "#000"
            : bingkaiColorClass === "abu"
            ? "#aaa"
            : "transparent",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        position: isBlock ? "relative" : "absolute",
      }}
      onClick={onClick}
    >
      {/* Garis putus-putus HANYA untuk template yang memilikinya */}
      {config.dashBorderThicknessCm > 0 && (
        <div
          className="cut-line"
          style={{
            border: `${dashBorderThicknessCm}cm dashed ${dashBorderColor}`,
          }}
        ></div>
      )}
      <div
        className="image-wrapper"
        style={{
          width: `${imageWidth}cm`,
          height: `${imageHeight}cm`,
          position: "relative",
        }}
      >
        {fotoUrl ? (
          <Image
            src={fotoUrl}
            alt="Foto terpilih"
            fill
            style={{ objectFit: "cover" }}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <>
            {logoSrc === null && (
              <span className="text-gray-500 text-xs">Pilih Foto</span>
            )}
          </>
        )}
      </div>
      {fotoUrl && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onCropClick();
          }}
          className="no-print absolute z-50 top-5 right-5 p-1 bg-white rounded-full shadow-md hover:bg-gray-200 transition-colors"
          title="Crop Foto"
        >
          <MdCropFree className="text-emerald-600 text-md" />
        </button>
      )}
      {/* LOGO per foto hanya untuk template 4x4 */}
      {logoSrc && logoHeightCm > 0 && (
        <div
          className="logo-wrapper"
          style={{
            width: 100,
            height: 50,
            bottom: 0,
            left: `${borderThicknessCm}cm`,
            position: "relative",
          }}
        >
          <Image
            src={logoSrc}
            alt="Logo Studio"
            fill
            style={{ objectFit: "contain" }}
          />
        </div>
      )}
      {isSelected && (
        <div className="no-print absolute inset-0 flex items-center justify-center bg-emerald-700 bg-opacity-50 text-white font-bold text-lg pointer-events-none">
          SLOT TERPILIH
        </div>
      )}
    </div>
  );
};

export default PrintItem;
