"use client";

import Image from "next/image";
import React, { useState, useRef, useCallback } from "react";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

// Helper function untuk mendapatkan gambar yang sudah di-crop dari canvas
async function getCroppedImage(image, crop, fileName) {
  const canvas = document.createElement("canvas");
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  canvas.width = crop.width;
  canvas.height = crop.height;
  const ctx = canvas.getContext("2d");

  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    crop.width,
    crop.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Canvas is empty"));
          return;
        }
        blob.name = fileName;
        resolve(blob);
      },
      "image/jpeg",
      1 // Kualitas gambar 100%
    );
  });
}

const CropperModal = ({ imageSrc, onClose, onCropComplete, aspectRatio }) => {
  const imgRef = useRef(null);
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const onImageLoad = useCallback(
    (e) => {
      imgRef.current = e.currentTarget;
      setCrop({
        unit: "%",
        width: 50,
        aspect: aspectRatio,
      });
    },
    [aspectRatio]
  );

  const handleSave = async () => {
    if (!completedCrop || !imgRef.current) return;

    setIsLoading(true);
    try {
      const croppedBlob = await getCroppedImage(
        imgRef.current,
        completedCrop,
        "cropped-image.jpg"
      );
      onCropComplete(croppedBlob);
    } catch (error) {
      console.error("Gagal saat cropping:", error);
      alert("Gagal memotong gambar. Silakan coba lagi.");
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
      <div className="bg-white p-6 rounded-lg max-w-xl max-h-[90vh] overflow-y-auto w-full">
        <h2 className="text-xl font-bold mb-4 text-center">Crop Foto</h2>
        <div className="relative flex justify-center items-center p-2 bg-gray-100 rounded-md">
          {imageSrc && (
            <ReactCrop
              crop={crop}
              onChange={(c) => setCrop(c)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={aspectRatio}
              ruleOfThirds
            >
              <Image
                ref={imgRef}
                src={imageSrc}
                alt="Source"
                onLoad={onImageLoad}
                width={350}
                height={500}
                style={{ maxHeight: "60vh", maxWidth: "100%" }}
              />
            </ReactCrop>
          )}
        </div>
        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={onClose}
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 font-medium transition"
            disabled={isLoading}
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            disabled={!completedCrop || isLoading}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Menyimpan..." : "Crop"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CropperModal;
