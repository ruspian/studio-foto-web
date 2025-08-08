// components/PrintItem.js
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
  isLogo,
}) => {
  if (!config) return null;

  // --- Render item logo terpisah (KHUSUS UNTUK 3x2) ---
  if (isLogo) {
    const { logoSrc, logoHeightCm, fotoWidthCm, bingkaiColorClass } = config;
    return (
      <div
        className={`logo-item ${bingkaiColorClass}`}
        style={{
          width: `${fotoWidthCm}cm`,
          height: `${logoHeightCm}cm`,
          top: position.top,
          left: position.left,
          position: "absolute",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor:
            bingkaiColorClass === "hitam"
              ? "#000"
              : bingkaiColorClass === "abu"
              ? "#aaa"
              : "transparent",
        }}
      >
        {logoSrc && (
          <Image
            src={logoSrc}
            alt="Logo Studio"
            width={100}
            height={50}
            style={{ objectFit: "contain" }}
          />
        )}
      </div>
    );
  }

  // --- Render item foto normal (Untuk 4x4 dan 3x2) ---
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
          top: `${borderThicknessCm + paddingFotoCm}cm`,
          left: `${borderThicknessCm + paddingFotoCm}cm`,
          width: `${imageWidth}cm`,
          height: `${imageHeight}cm`,
        }}
      >
        {fotoUrl ? (
          <Image
            src={fotoUrl}
            alt="Foto terpilih"
            fill
            style={{ objectFit: "cover" }}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <span className="text-gray-500 text-xs">Pilih Foto</span>
        )}

        <Image
          src={logoSrc}
          alt="Logo Studio"
          width={100}
          height={50}
          style={{ objectFit: "contain" }}
        />
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
      {logoSrc && logoHeightCm > 0 && !isLogo && (
        <div
          className="logo-wrapper"
          style={{
            width: `${fotoWidthCm - 2 * borderThicknessCm}cm`,
            height: `${logoHeightCm}cm`,
            bottom: `${borderThicknessCm}cm`,
            left: `${borderThicknessCm}cm`,
          }}
        >
          <Image
            src={logoSrc}
            alt="Logo Studio"
            width={100}
            height={50}
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
