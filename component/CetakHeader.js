"use client";

import React from "react";

const CetakHeader = ({ onPrint }) => {
  return (
    <div className="fixed top-0 left-0 right-0 h-16 bg-white shadow-md z-50 flex items-center justify-between px-6 no-print">
      <div className="">
        <h1 className="text-2xl font-bold text-gray-800">Rana Kenangan</h1>
        <p className="text-gray-600 text-sm">Cetak Foto</p>
      </div>
      <button
        onClick={onPrint}
        className="bg-emerald-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
      >
        Print
      </button>
    </div>
  );
};

export default CetakHeader;
