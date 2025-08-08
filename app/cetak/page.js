// app/cetak/page.js
"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";

import CetakHeader from "@/component/CetakHeader";
import PrintArea from "@/component/PrintArea";
import RightPanel from "@/component/RightPanel";
import CropperModal from "@/component/CropImageComponent";

const SUPABASE_BUCKET_NAME = "ruspian";

const PAGE_INTERNAL_PADDING_CM = 0.2;
const A4_WIDTH_CM = 21;
const A4_HEIGHT_CM = 29.7;

const TEMPLATE_DEFINITIONS = {
  // --- TEMPLATE 4x4 (TIDAK DIUBAH) ---
  "4x4_full_layout": {
    name: "Hitam dan Abu-Abu",
    blockType: "composite",
    maxSlots: 8,
    description:
      "Layout 4x4 khas dengan 4 bingkai hitam dan 4 bingkai abu-abu.",
    blockWidthCm: 20.5,
    blockHeightCm: 16.5,
    FOTO_LEBAR_CM: 5,
    FOTO_TINGGI_CM: 8,
    BORDER_BINGKAI_CM: 0,
    PADDING_FOTO_CM: 0.4,
    LOGO_TINGGI_CM: 1.5,
    DASH_BORDER_THICKNESS_CM: 0.01,
    DASH_BORDER_COLOR: "#ffffff",
    GAP_WITHIN_GROUP_HORIZONTAL_CM: 0,
    GAP_WITHIN_GROUP_VERTICAL_CM: 0,
    GAP_BETWEEN_TEMPLATES_CM: 0.5,
    getRelativeFotoPosition: (slotIndex) => {
      let x, y;
      const {
        FOTO_LEBAR_CM,
        FOTO_TINGGI_CM,
        BORDER_BINGKAI_CM,
        PADDING_FOTO_CM,
        LOGO_TINGGI_CM,
        GAP_WITHIN_GROUP_HORIZONTAL_CM,
        GAP_WITHIN_GROUP_VERTICAL_CM,
        GAP_BETWEEN_TEMPLATES_CM,
      } = TEMPLATE_DEFINITIONS["4x4_full_layout"];

      let fotoGroupIndex;
      const GAMBAR_LEBAR_CM =
        FOTO_LEBAR_CM - 2 * BORDER_BINGKAI_CM - 2 * PADDING_FOTO_CM;
      const GAMBAR_TINGGI_CM =
        FOTO_TINGGI_CM -
        2 * BORDER_BINGKAI_CM -
        2 * PADDING_FOTO_CM -
        LOGO_TINGGI_CM;

      if (slotIndex < 4) {
        fotoGroupIndex = slotIndex;
        const col = fotoGroupIndex % 2;
        const row = Math.floor(fotoGroupIndex / 2);

        x = col * (FOTO_LEBAR_CM + GAP_WITHIN_GROUP_HORIZONTAL_CM);
        y = row * (FOTO_TINGGI_CM + GAP_WITHIN_GROUP_VERTICAL_CM);
        return {
          top: `${y}cm`,
          left: `${x}cm`,
          bingkaiColorClass: "hitam",
          logoSrc: "/logoPutih.png",
          logoHeightCm: TEMPLATE_DEFINITIONS["4x4_full_layout"].LOGO_TINGGI_CM,
          aspectRatio: GAMBAR_LEBAR_CM / GAMBAR_TINGGI_CM,
        };
      } else {
        fotoGroupIndex = slotIndex - 4;
        const col = fotoGroupIndex % 2;
        const row = Math.floor(fotoGroupIndex / 2);

        const offsetXTemplates =
          2 * FOTO_LEBAR_CM +
          1 * GAP_WITHIN_GROUP_HORIZONTAL_CM +
          GAP_BETWEEN_TEMPLATES_CM;

        x =
          offsetXTemplates +
          col * (FOTO_LEBAR_CM + GAP_WITHIN_GROUP_HORIZONTAL_CM);
        y = row * (FOTO_TINGGI_CM + GAP_WITHIN_GROUP_VERTICAL_CM);
        return {
          top: `${y}cm`,
          left: `${x}cm`,
          bingkaiColorClass: "abu",
          logoSrc: "/logoHitam.png",
          logoHeightCm: TEMPLATE_DEFINITIONS["4x4_full_layout"].LOGO_TINGGI_CM,
          aspectRatio: GAMBAR_LEBAR_CM / GAMBAR_TINGGI_CM,
        };
      }
    },
  },

  // --- TEMPLATE 3x2 Hitam (DIUBAH) ---
  "3x2_logo_hitam": {
    name: "3x2 Logo Hitam",
    blockType: "composite",
    maxSlots: 3,
    description: "Layout 3 foto vertikal dengan logo di bawah bingkai hitam.",
    blockWidthCm: 6.5,
    blockHeightCm: 18.5,
    FOTO_LEBAR_CM: 5.5,
    FOTO_TINGGI_CM: (18.5 - 0.5 - 2.1 - 0.5) / 3,
    BORDER_BINGKAI_CM: 0.5,
    PADDING_FOTO_CM: 0.4,
    LOGO_TINGGI_CM: 2.1,
    logoSrc: "/logoPutih.png",
    GAP_WITHIN_GROUP_HORIZONTAL_CM: 0,
    GAP_WITHIN_GROUP_VERTICAL_CM: 0,
    GAP_BETWEEN_TEMPLATES_CM: 0,
    getRelativeFotoPosition: (slotIndex) => {
      const { FOTO_LEBAR_CM, FOTO_TINGGI_CM, BORDER_BINGKAI_CM } =
        TEMPLATE_DEFINITIONS["3x2_logo_hitam"];

      const GAMBAR_LEBAR_CM = FOTO_LEBAR_CM - 2 * BORDER_BINGKAI_CM;
      const GAMBAR_TINGGI_CM = FOTO_TINGGI_CM - 2 * BORDER_BINGKAI_CM;

      const x = 0;
      const y = slotIndex * FOTO_TINGGI_CM;

      return {
        top: `${y}cm`,
        left: `${x}cm`,
        logoSrc: "/logoPutih.png",
        logoHeightCm: TEMPLATE_DEFINITIONS["3x2_logo_hitam"].LOGO_TINGGI_CM,
        bingkaiColorClass: "hitam",
        aspectRatio: GAMBAR_LEBAR_CM / GAMBAR_TINGGI_CM,
      };
    },
  },

  // --- TEMPLATE 3x2 Abu-Abu (DIUBAH) ---
  "3x2_logo_abu": {
    name: "3x2 Logo Abu-Abu",
    blockType: "composite",
    maxSlots: 3,
    description: "Layout 3 foto vertikal dengan logo di bawah bingkai abu-abu.",
    blockWidthCm: 6.5,
    blockHeightCm: 18.5,
    FOTO_LEBAR_CM: 5.5,
    FOTO_TINGGI_CM: (18.5 - 0.5 - 2.1 - 0.5) / 3,
    BORDER_BINGKAI_CM: 0.5,
    PADDING_FOTO_CM: 0.4,
    LOGO_TINGGI_CM: 2.1,
    logoSrc: "/logoHitam.png",
    GAP_WITHIN_GROUP_HORIZONTAL_CM: 0,
    GAP_WITHIN_GROUP_VERTICAL_CM: 0,
    GAP_BETWEEN_TEMPLATES_CM: 0,
    getRelativeFotoPosition: (slotIndex) => {
      const { FOTO_LEBAR_CM, FOTO_TINGGI_CM, BORDER_BINGKAI_CM } =
        TEMPLATE_DEFINITIONS["3x2_logo_abu"];

      const GAMBAR_LEBAR_CM = FOTO_LEBAR_CM - 2 * BORDER_BINGKAI_CM;
      const GAMBAR_TINGGI_CM = FOTO_TINGGI_CM - 2 * BORDER_BINGKAI_CM;

      const x = 0;
      const y = slotIndex * FOTO_TINGGI_CM;

      return {
        top: `${y}cm`,
        left: `${x}cm`,
        logoSrc: "/logoHitam.png",
        logoHeightCm: TEMPLATE_DEFINITIONS["3x2_logo_abu"].LOGO_TINGGI_CM,
        bingkaiColorClass: "abu",
        aspectRatio: GAMBAR_LEBAR_CM / GAMBAR_TINGGI_CM,
      };
    },
  },
  // --- TEMPLATE PAS FOTO ---
  pas_foto_3x2: {
    name: "Pas Foto 3x2",
    blockType: "single_item",
    maxSlots: 1,
    description: "Pas foto ukuran 3x2 cm.",
    fotoWidthCm: 2.2,
    fotoHeightCm: 3.2,
    borderThicknessCm: 0,
    paddingFotoCm: 0,
    logoHeightCm: 0,
    dashBorderThicknessCm: 0.01,
    dashBorderColor: "#aaaaaa",
    bingkaiColorClass: "tanpa-bingkai",
    logoSrc: null,
    aspectRatio: 2.2 / 3.2,
  },
  pas_foto_3x4: {
    name: "Pas Foto 3x4",
    blockType: "single_item",
    maxSlots: 1,
    description: "Pas foto ukuran 3x4 cm.",
    fotoWidthCm: 3.2,
    fotoHeightCm: 4.2,
    borderThicknessCm: 0,
    paddingFotoCm: 0,
    logoHeightCm: 0,
    dashBorderThicknessCm: 0.01,
    dashBorderColor: "#aaaaaa",
    bingkaiColorClass: "tanpa-bingkai",
    logoSrc: null,
    aspectRatio: 3.2 / 4.2,
  },
  pas_foto_4x6: {
    name: "Pas Foto 4x6",
    blockType: "single_item",
    maxSlots: 1,
    description: "Pas foto ukuran 4x6 cm.",
    fotoWidthCm: 4.2,
    fotoHeightCm: 6.2,
    borderThicknessCm: 0,
    paddingFotoCm: 0,
    logoHeightCm: 0,
    dashBorderThicknessCm: 0.01,
    dashBorderColor: "#aaaaaa",
    bingkaiColorClass: "tanpa-bingkai",
    logoSrc: null,
    aspectRatio: 4.2 / 6.2,
  },
};

export default function CetakPage() {
  const [availableFotos, setAvailableFotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [printItems, setPrintItems] = useState([]);
  const [selectedSlotId, setSelectedSlotId] = useState(null);
  const [isCroppingModalOpen, setIsCroppingModalOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState(null);
  const [aspectRatio, setAspectRatio] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const [slotIdForCrop, setSlotIdForCrop] = useState(null);

  const fetchFoto = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase.storage
        .from(SUPABASE_BUCKET_NAME)
        .list("", { sortBy: { column: "created_at", order: "desc" } });
      if (fetchError) throw fetchError;
      const fotosWithUrls = data.map((file) => {
        const { data: publicUrlData } = supabase.storage
          .from(SUPABASE_BUCKET_NAME)
          .getPublicUrl(file.name);
        return publicUrlData.publicUrl;
      });
      setAvailableFotos(fotosWithUrls);
    } catch (err) {
      console.error("Gagal memuat foto dari Supabase Storage:", err);
      setError("Gagal memuat foto dari Supabase Storage. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFoto();
  }, [fetchFoto]);

  const addPrintBlock = (templateKey, count = 1) => {
    const templateDef = TEMPLATE_DEFINITIONS?.[templateKey];
    if (!templateDef) return;

    const newItems = [];
    for (let i = 0; i < count; i++) {
      if (templateDef.blockType === "composite") {
        for (let j = 0; j < templateDef.maxSlots; j++) {
          newItems.push({
            id: uuidv4(),
            templateKey,
            slotIndex: j,
            selectedFotoUrl: null,
          });
        }
      } else {
        newItems.push({
          id: uuidv4(),
          templateKey,
          slotIndex: 0,
          selectedFotoUrl: null,
        });
      }
    }
    setPrintItems((prevItems) => [...prevItems, ...newItems]);
  };

  const removePrintItem = (idToRemove) => {
    setPrintItems((prevItems) =>
      prevItems.filter((item) => item.id !== idToRemove)
    );
    if (selectedSlotId === idToRemove) {
      setSelectedSlotId(null);
    }
  };

  const handlePilihFotoToSlot = useCallback(
    (fotoUrl) => {
      if (!selectedSlotId) {
        alert("Pilih slot foto di halaman A4 terlebih dahulu.");
        return;
      }
      setPrintItems((prevItems) => {
        const updatedItems = prevItems.map((item) => {
          if (item.selectedFotoUrl === fotoUrl && item.id !== selectedSlotId) {
            return { ...item, selectedFotoUrl: null };
          }
          return item;
        });

        return updatedItems.map((item) => {
          if (item.id === selectedSlotId) {
            if (item.selectedFotoUrl === fotoUrl) {
              return { ...item, selectedFotoUrl: null };
            }
            return { ...item, selectedFotoUrl: fotoUrl };
          }
          return item;
        });
      });
      setSelectedSlotId(null);
    },
    [selectedSlotId]
  );

  const handleOpenCropModal = useCallback((slotItem) => {
    const slotTemplate = TEMPLATE_DEFINITIONS?.[slotItem.templateKey];
    let aspect;
    if (slotTemplate.blockType === "composite") {
      const relativePos = slotTemplate.getRelativeFotoPosition(
        slotItem.slotIndex
      );
      aspect = relativePos.aspectRatio;
    } else {
      aspect = slotTemplate.aspectRatio;
    }

    setSlotIdForCrop(slotItem.id);
    setAspectRatio(aspect);
    setImageToCrop(slotItem.selectedFotoUrl);
    setIsCroppingModalOpen(true);
  }, []);

  const handleCropAndUpload = async (croppedBlob) => {
    setIsCroppingModalOpen(false);

    const originalUrl = printItems.find(
      (item) => item.id === slotIdForCrop
    )?.selectedFotoUrl;
    if (!originalUrl) return;

    const originalFileExtension = originalUrl.split(".").pop().split("?")[0];
    const fileName = `${uuidv4()}_cropped.${originalFileExtension}`;

    setIsUploading(true);
    try {
      const { error: uploadError } = await supabase.storage
        .from(SUPABASE_BUCKET_NAME)
        .upload(fileName, croppedBlob, {
          contentType: croppedBlob.type,
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from(SUPABASE_BUCKET_NAME)
        .getPublicUrl(fileName);

      const croppedFotoUrl = publicUrlData.publicUrl;

      setPrintItems((prevItems) =>
        prevItems.map((item) =>
          item.id === slotIdForCrop
            ? { ...item, selectedFotoUrl: croppedFotoUrl }
            : item
        )
      );
    } catch (error) {
      console.error("Gagal mengunggah foto yang di-crop:", error);
      alert("Gagal mengunggah foto yang di-crop. Silakan coba lagi.");
    } finally {
      setSlotIdForCrop(null);
      setImageToCrop(null);
      setIsUploading(false);
    }
  };

  const handlePrint = () => {
    const totalFotosSelected = printItems.filter(
      (item) => item.selectedFotoUrl
    ).length;
    if (totalFotosSelected === 0) {
      alert("Pilih setidaknya satu foto untuk dicetak.");
      return;
    }
    window.print();
  };

  const calculateItemPositions = useCallback(() => {
    const positions = {};
    let currentY = PAGE_INTERNAL_PADDING_CM;
    let currentX = PAGE_INTERNAL_PADDING_CM;
    const GAP_BETWEEN_COMPOSITE_BLOCKS_CM = 0.5;
    const GAP_BETWEEN_SINGLE_ITEMS_CM = 0;
    const VERTICAL_GAP_BETWEEN_BLOCKS_CM = 0.5;

    const groupedItems = [];
    let currentGroup = [];

    printItems.forEach((item, index) => {
      const templateDef = TEMPLATE_DEFINITIONS?.[item.templateKey];
      if (!templateDef) return;

      if (templateDef.blockType === "composite") {
        currentGroup.push(item);
        const nextItem = printItems?.[index + 1];

        if (
          currentGroup.length === templateDef.maxSlots ||
          !nextItem ||
          nextItem.templateKey !== item.templateKey ||
          (nextItem.templateKey === item.templateKey &&
            (index + 1) % templateDef.maxSlots === 0)
        ) {
          groupedItems.push({
            type: "composite",
            templateKey: item.templateKey,
            items: [...currentGroup],
          });
          currentGroup = [];
        }
      } else {
        if (currentGroup.length > 0) {
          const prevTemplateDef =
            TEMPLATE_DEFINITIONS?.[currentGroup?.[0]?.templateKey];
          if (prevTemplateDef && prevTemplateDef.blockType === "composite") {
            groupedItems.push({
              type: "composite",
              templateKey: currentGroup?.[0]?.templateKey,
              items: [...currentGroup],
            });
            currentGroup = [];
          }
        }
        groupedItems.push({
          type: "single_item",
          templateKey: item.templateKey,
          item: item,
        });
      }
    });

    if (currentGroup.length > 0) {
      const prevTemplateDef =
        TEMPLATE_DEFINITIONS?.[currentGroup?.[0]?.templateKey];
      if (prevTemplateDef && prevTemplateDef.blockType === "composite") {
        groupedItems.push({
          type: "composite",
          templateKey: currentGroup?.[0]?.templateKey,
          items: [...currentGroup],
        });
      }
    }

    let currentRowMaxHeight = 0;
    let prevGroup = null;

    groupedItems.forEach((group) => {
      let blockWidth, blockHeight;
      const groupTemplateDef = TEMPLATE_DEFINITIONS?.[group.templateKey];
      if (!groupTemplateDef) return;

      if (group.type === "composite") {
        blockWidth = groupTemplateDef.blockWidthCm;
        blockHeight = groupTemplateDef.blockHeightCm;
      } else {
        blockWidth = groupTemplateDef.fotoWidthCm;
        blockHeight = groupTemplateDef.fotoHeightCm;
      }

      let currentGap = 0;
      if (prevGroup) {
        if (prevGroup.type === "single_item" && group.type === "single_item") {
          currentGap = GAP_BETWEEN_SINGLE_ITEMS_CM;
        } else {
          currentGap = GAP_BETWEEN_COMPOSITE_BLOCKS_CM;
        }
      }

      if (
        currentX + blockWidth + currentGap + PAGE_INTERNAL_PADDING_CM >
        A4_WIDTH_CM + 0.001
      ) {
        currentX = PAGE_INTERNAL_PADDING_CM;
        currentY += currentRowMaxHeight + VERTICAL_GAP_BETWEEN_BLOCKS_CM;
        currentRowMaxHeight = 0;
        currentGap = 0;
      }

      currentRowMaxHeight = Math.max(currentRowMaxHeight, blockHeight);

      const blockAbsoluteStartX = currentX;
      const blockAbsoluteStartY = currentY;

      if (group.type === "composite") {
        group.items.forEach((itemInGroup) => {
          const relativePos = groupTemplateDef.getRelativeFotoPosition(
            itemInGroup.slotIndex
          );

          let itemConfig;

          if (group.templateKey.startsWith("4x4")) {
            itemConfig = {
              ...groupTemplateDef,
              ...relativePos,
              fotoWidthCm: groupTemplateDef.FOTO_LEBAR_CM,
              fotoHeightCm: groupTemplateDef.FOTO_TINGGI_CM,
              borderThicknessCm: groupTemplateDef.BORDER_BINGKAI_CM,
              paddingFotoCm: groupTemplateDef.PADDING_FOTO_CM,
              logoHeightCm: relativePos.logoHeightCm,
              logoSrc: relativePos.logoSrc,
              dashBorderThicknessCm: groupTemplateDef.DASH_BORDER_THICKNESS_CM,
              dashBorderColor: groupTemplateDef.DASH_BORDER_COLOR,
            };
          } else if (group.templateKey.startsWith("3x2")) {
            const { LOGO_TINGGI_CM, logoSrc, ...restOfTemplateDef } =
              groupTemplateDef;
            itemConfig = {
              ...restOfTemplateDef,
              ...relativePos,
              fotoWidthCm: groupTemplateDef.FOTO_LEBAR_CM,
              fotoHeightCm: groupTemplateDef.FOTO_TINGGI_CM,
              borderThicknessCm: groupTemplateDef.BORDER_BINGKAI_CM,
              paddingFotoCm: groupTemplateDef.PADDING_FOTO_CM,
              logoHeightCm: 0,
              logoSrc: null,
            };
          }

          positions[`${itemInGroup.id}`] = {
            top: `${blockAbsoluteStartY + parseFloat(relativePos.top)}cm`,
            left: `${blockAbsoluteStartX + parseFloat(relativePos.left)}cm`,
            config: itemConfig,
            isLogo: false,
          };
        });

        // HANYA UNTUK 3x2: Tambahkan LOGO di bawah bingkai
        if (group.templateKey.startsWith("3x2")) {
          const logoTemplateDef = TEMPLATE_DEFINITIONS?.[group.templateKey];
          if (logoTemplateDef?.logoSrc && logoTemplateDef?.LOGO_TINGGI_CM > 0) {
            const logoId = `${group.items?.[group.items.length - 1]?.id}-logo`;

            // Perbaikan di sini: Menghitung posisi logo dari bawah blockHeightCm
            const logoTop =
              blockAbsoluteStartY +
              groupTemplateDef.blockHeightCm -
              logoTemplateDef.LOGO_TINGGI_CM -
              groupTemplateDef.BORDER_BINGKAI_CM;

            // Perbaikan di sini: Menghitung posisi kiri logo dari blockAbsoluteStartX
            const logoLeft =
              blockAbsoluteStartX + groupTemplateDef.BORDER_BINGKAI_CM;

            positions[`${logoId}`] = {
              top: `${logoTop}cm`,
              left: `${logoLeft}cm`,
              config: {
                logoSrc: logoTemplateDef.logoSrc,
                logoHeightCm: logoTemplateDef.LOGO_TINGGI_CM,
                fotoWidthCm:
                  groupTemplateDef.blockWidthCm -
                  2 * groupTemplateDef.BORDER_BINGKAI_CM,
                fotoHeightCm: logoTemplateDef.LOGO_TINGGI_CM,
                bingkaiColorClass: groupTemplateDef.bingkaiColorClass,
              },
              isLogo: true,
            };
          }
        }
      } else {
        positions[`${group.item.id}`] = {
          top: `${blockAbsoluteStartY}cm`,
          left: `${blockAbsoluteStartX}cm`,
          config: groupTemplateDef,
          isLogo: false,
        };
      }

      currentX += blockWidth + currentGap;
      prevGroup = group;
    });
    return positions;
  }, [printItems]);

  const itemPositions = calculateItemPositions();

  return (
    <>
      <CetakHeader onPrint={handlePrint} />
      <div id="print-root">
        <PrintArea
          printItems={printItems}
          itemPositions={itemPositions}
          selectedSlotId={selectedSlotId}
          setSelectedSlotId={setSelectedSlotId}
          handleOpenCropModal={handleOpenCropModal}
          TEMPLATE_DEFINITIONS={TEMPLATE_DEFINITIONS}
        />
        <RightPanel
          availableFotos={availableFotos}
          loading={loading}
          error={error}
          printItems={printItems}
          selectedSlotId={selectedSlotId}
          handlePilihFotoToSlot={handlePilihFotoToSlot}
          addPrintBlock={addPrintBlock}
          removePrintItem={removePrintItem}
          TEMPLATE_DEFINITIONS={TEMPLATE_DEFINITIONS}
        />

        {isCroppingModalOpen && (
          <CropperModal
            imageSrc={imageToCrop}
            aspectRatio={aspectRatio}
            onClose={() => {
              setIsCroppingModalOpen(false);
              setImageToCrop(null);
              setSlotIdForCrop(null);
            }}
            onCropComplete={handleCropAndUpload}
          />
        )}
      </div>
    </>
  );
}
