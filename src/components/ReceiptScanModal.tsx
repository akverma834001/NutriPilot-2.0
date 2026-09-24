import React, { useState, useRef } from 'react';
import {
  BillScannerService,
  BillScanResult,
  ScannedItem
} from '../services/BillScannerService';
import { PantryItem } from '../types';
import {
  X,
  UploadCloud,
  Camera,
  CheckCircle2,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  ShoppingBag,
  Clock,
  ArrowRight,
  FileText,
  Trash2,
  Check,
  Info,
  Calendar,
  Layers,
  Store
} from 'lucide-react';
import { ProvenanceBadge } from './ProvenanceBadge';
import { APP_CONFIG } from '../config/apiConfig';

interface ReceiptScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPantryUpdated: (items: Omit<PantryItem, 'id'>[], storeName: string) => void;
}

export const ReceiptScanModal: React.FC<ReceiptScanModalProps> = ({
  isOpen,
  onClose,
  onPantryUpdated
}) => {
  const [selectedScanResult, setSelectedScanResult] = useState<BillScanResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStepText, setScanStepText] = useState('');
  const [activeTab, setActiveTab] = useState<'edible' | 'excluded'>('edible');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [receiptName, setReceiptName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Simulate realistic OCR scanning process
  const triggerScanningSequence = (result: BillScanResult, previewUrl?: string) => {
    setIsScanning(true);
    setImagePreview(previewUrl || result.receiptImageUrl || null);
    setReceiptName(result.storeName);

    setScanStepText('Reading receipt image & detecting receipt header...');
    setTimeout(() => {
      setScanStepText('Running OCR item line extraction...');
    }, 450);

    setTimeout(() => {
      setScanStepText('Applying STRICT Eatables-Only Food Filter (purging non-edibles)...');
    }, 900);

    setTimeout(() => {
      setSelectedScanResult(result);
      setIsScanning(false);
    }, 1350);
  };

  const handleSelectSample = (sampleKey: 'dmart' | 'blinkit' | 'kirana') => {
    let result: BillScanResult;
    if (sampleKey === 'dmart') {
      result = BillScannerService.getSampleReceipt('sample_dmart_supermarket');
    } else if (sampleKey === 'blinkit') {
      result = BillScannerService.getSampleReceipt('sample_blinkit_quick_commerce');
    } else {
      result = BillScannerService.getSampleReceipt('sample_kirana_mart');
    }
    triggerScanningSequence(result);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const parsed = BillScannerService.parseCustomReceipt(file.name, dataUrl);
      triggerScanningSequence(parsed, dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const toggleItemSelection = (itemId: string) => {
    if (!selectedScanResult) return;
    const updatedItems = selectedScanResult.items.map((item) =>
      item.id === itemId ? { ...item, selected: !item.selected } : item
    );
    setSelectedScanResult({
      ...selectedScanResult,
      items: updatedItems
    });
  };

  const updateItemQuantity = (itemId: string, newQty: string) => {
    if (!selectedScanResult) return;
    const updatedItems = selectedScanResult.items.map((item) =>
      item.id === itemId ? { ...item, quantity: newQty } : item
    );
    setSelectedScanResult({
      ...selectedScanResult,
      items: updatedItems
    });
  };

  const handleConfirmAddToPantry = () => {
    if (!selectedScanResult) return;
    const pantryItems = BillScannerService.toPantryItems(selectedScanResult.items);
    if (pantryItems.length === 0) return;

    onPantryUpdated(pantryItems, selectedScanResult.storeName);
    onClose();
  };

  const edibleItems = selectedScanResult?.items.filter((i) => i.isEatable) || [];
  const excludedItems = selectedScanResult?.items.filter((i) => !i.isEatable) || [];
  const selectedEdiblesCount = edibleItems.filter((i) => i.selected).length;

  const getCategoryBadgeColor = (category: ScannedItem['category']) => {
    switch (category) {
      case 'protein':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'dairy':
        return 'bg-sky-500/10 text-sky-400 border-sky-500/30';
      case 'grain':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'fruit':
        return 'bg-pink-500/10 text-pink-400 border-pink-500/30';
      case 'vegetable':
        return 'bg-green-500/10 text-green-400 border-green-500/30';
      case 'spice':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      default:
        return 'bg-slate-700 text-slate-300 border-slate-600';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-750 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Top Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-500 p-0.5 shadow-lg flex items-center justify-center text-slate-950 font-bold">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white font-heading">
                  Scan Grocery Store Bill
                </h3>
                <ProvenanceBadge infoType="MEASURED" source="OCR Receipt Extraction" confidence="high" />
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Automatically extracts groceries and <strong className="text-emerald-400">strictly filters for eatables only</strong>.
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-[10px] font-mono text-indigo-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>API/UPI Key Active: {APP_CONFIG.maskedKey}</span>
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {/* STEP 1: UPLOAD / CAMERA / SAMPLE BUTTONS */}
          {!selectedScanResult && !isScanning && (
            <div className="space-y-5">
              {/* Upload Drag & Drop Box */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-700 hover:border-sky-500/60 rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all bg-slate-850/50 hover:bg-slate-800/40 group"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*,.pdf"
                  className="hidden"
                />
                <div className="w-14 h-14 mx-auto rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 group-hover:scale-110 transition-transform mb-3">
                  <UploadCloud className="w-7 h-7" />
                </div>
                <h4 className="text-sm font-bold text-white mb-1">
                  Upload Grocery Store Bill / Receipt Photo
                </h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mb-3">
                  Take a photo of your supermarket, DMart, Blinkit, Zepto, or Kirana bill. PNG, JPG, or PDF supported.
                </p>
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500/15 border border-sky-500/30 text-sky-300 text-xs font-semibold">
                  <Camera className="w-3.5 h-3.5" />
                  <span>Choose Photo or Snap with Camera</span>
                </div>
              </div>

              {/* Instant Test Bills */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Or Test Immediately with Real Supermarket Bills:</span>
                  </span>
                  <span className="text-[11px] text-slate-500">1-click demo</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleSelectSample('dmart')}
                    className="p-3.5 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-750 hover:border-sky-500/40 text-left transition-all group"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-white group-hover:text-sky-400 flex items-center gap-1.5">
                        <Store className="w-3.5 h-3.5 text-sky-400" />
                        <span>D-Mart Supermarket</span>
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                        8 items
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Paneer, Curd, Eggs + Surf Excel Detergent & Harpic
                    </p>
                    <div className="mt-2 text-[10px] font-semibold text-emerald-400">
                      ✓ Auto-filters detergents
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectSample('blinkit')}
                    className="p-3.5 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-750 hover:border-amber-500/40 text-left transition-all group"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-white group-hover:text-amber-400 flex items-center gap-1.5">
                        <Store className="w-3.5 h-3.5 text-amber-400" />
                        <span>Blinkit 10-Min Delivery</span>
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                        7 items
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Greek Yogurt, Oats, Bread + Vim Dishwash & Dettol
                    </p>
                    <div className="mt-2 text-[10px] font-semibold text-emerald-400">
                      ✓ Auto-filters handwashes
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectSample('kirana')}
                    className="p-3.5 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-750 hover:border-emerald-500/40 text-left transition-all group"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-white group-hover:text-emerald-400 flex items-center gap-1.5">
                        <Store className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Shree Ganesh Kirana</span>
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                        7 items
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Basmati Rice, Dal, Haldi + Mosquito Refill & Batteries
                    </p>
                    <div className="mt-2 text-[10px] font-semibold text-emerald-400">
                      ✓ Auto-filters non-edibles
                    </div>
                  </button>
                </div>
              </div>

              {/* Safety notice */}
              <div className="p-3.5 rounded-xl bg-slate-850/80 border border-slate-800 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-300 leading-relaxed">
                  <strong className="text-emerald-400 font-bold block mb-0.5">Strict Eatables-Only Intelligent Filter</strong>
                  NutriPilot automatically detects and purges cleaning agents (detergents, floor cleaners, soaps, toilet paper, batteries, repellents) so your pantry inventory contains only genuine cooking & nutrition ingredients.
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: SCANNING ANIMATION */}
          {isScanning && (
            <div className="py-12 px-4 text-center space-y-6">
              <div className="relative w-24 h-24 mx-auto">
                <div className="w-24 h-24 rounded-2xl bg-sky-500/10 border-2 border-sky-400 flex items-center justify-center relative overflow-hidden">
                  <FileText className="w-10 h-10 text-sky-400" />
                  {/* Laser scan line animation */}
                  <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-sky-400 to-transparent animate-pulse shadow-lg shadow-sky-400/80 top-1/2 -translate-y-1/2" />
                </div>
                <div className="absolute -inset-1 rounded-2xl bg-sky-500/20 blur-md -z-10 animate-pulse" />
              </div>

              <div className="space-y-2">
                <h4 className="text-base font-bold text-white">Analyzing Receipt & Filtering Eatables</h4>
                <p className="text-xs text-sky-400 font-mono animate-pulse">{scanStepText}</p>
              </div>

              <div className="w-48 h-1.5 bg-slate-800 rounded-full mx-auto overflow-hidden">
                <div className="h-full bg-gradient-to-r from-sky-500 to-emerald-400 rounded-full animate-[progress_1.2s_ease-in-out_infinite]" style={{ width: '80%' }} />
              </div>
            </div>
          )}

          {/* STEP 3: RESULTS REVIEW & STRICT EATABLE VERIFICATION */}
          {selectedScanResult && !isScanning && (
            <div className="space-y-4">
              {/* Store & Bill Summary Card */}
              <div className="p-4 rounded-xl bg-slate-850 border border-slate-750 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200">
                    <Store className="w-5 h-5 text-sky-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{selectedScanResult.storeName}</h4>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span>Invoice: {selectedScanResult.invoiceNumber}</span>
                      <span>•</span>
                      <span>{selectedScanResult.detectedDate}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Total Bill</span>
                    <span className="font-mono font-bold text-slate-200">₹{selectedScanResult.totalBillAmount}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedScanResult(null)}
                    className="px-2.5 py-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-xs border border-slate-700"
                  >
                    Scan Another
                  </button>
                </div>
              </div>

              {/* FILTERING SAFETY STATS BAR */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-emerald-400">Approved Eatables</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                        {edibleItems.length}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400">Ready to ingest into pantry</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-red-400">Non-Food Excluded</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-red-500/20 text-red-300 font-mono">
                        {excludedItems.length}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400">Cleaners, detergents & soaps blocked</span>
                  </div>
                </div>
              </div>

              {/* TABS FOR INSPECTION */}
              <div className="flex gap-2 border-b border-slate-800 pb-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('edible')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === 'edible'
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                      : 'bg-slate-850 text-slate-400 hover:text-white border border-slate-750'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Approved Eatables ({edibleItems.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('excluded')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === 'excluded'
                      ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                      : 'bg-slate-850 text-slate-400 hover:text-white border border-slate-750'
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                  <span>Filtered Non-Food ({excludedItems.length})</span>
                </button>
              </div>

              {/* TAB CONTENT 1: APPROVED EATABLES */}
              {activeTab === 'edible' && (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {edibleItems.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400">
                      No edible food items detected in this bill.
                    </div>
                  ) : (
                    edibleItems.map((item) => (
                      <div
                        key={item.id}
                        className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                          item.selected
                            ? 'bg-slate-850 border-emerald-500/30'
                            : 'bg-slate-900/60 border-slate-800 opacity-60'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={item.selected}
                            onChange={() => toggleItemSelection(item.id)}
                            className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-400 bg-slate-800 border-slate-700 cursor-pointer"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white">{item.name}</span>
                              <span
                                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getCategoryBadgeColor(
                                  item.category
                                )}`}
                              >
                                {item.category}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                              <span>Raw line: "{item.rawText}"</span>
                              <span>•</span>
                              <span className="text-amber-400 flex items-center gap-0.5">
                                <Clock className="w-3 h-3" />
                                {item.expiryDays}d shelf life
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          {/* Editable Quantity */}
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-slate-500 hidden sm:inline">Qty:</span>
                            <input
                              type="text"
                              value={item.quantity}
                              onChange={(e) => updateItemQuantity(item.id, e.target.value)}
                              className="w-20 px-2 py-1 rounded bg-slate-800 border border-slate-700 text-xs text-white font-mono text-center focus:outline-none focus:border-sky-500"
                            />
                          </div>

                          <span className="text-xs font-mono font-bold text-emerald-400 w-14 text-right">
                            ₹{item.unitCostInr}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB CONTENT 2: FILTERED OUT NON-FOOD ITEMS */}
              {activeTab === 'excluded' && (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-300 flex items-center gap-2">
                    <Info className="w-4 h-4 text-red-400 shrink-0" />
                    <span>
                      These items were detected on the bill but <strong>permanently excluded</strong> to prevent non-edible items from contaminating your nutrition pantry.
                    </span>
                  </div>

                  {excludedItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl bg-slate-900 border border-red-900/30 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-md bg-red-500/10 text-red-400 flex items-center justify-center shrink-0">
                          <X className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="font-semibold text-slate-300 line-through">
                            {item.name}
                          </span>
                          <div className="text-[11px] text-red-400/90 font-medium">
                            {item.exclusionReason || 'Non-edible household product'}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 font-mono text-slate-400">
                        <span>₹{item.unitCostInr}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-red-950/60 text-red-300 border border-red-900/50">
                          Blocked
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-900/95 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-400">
            {selectedScanResult ? (
              <span>
                <strong className="text-emerald-400">{selectedEdiblesCount} eatable items</strong> selected for pantry ingestion.
              </span>
            ) : (
              <span>Upload or select a supermarket receipt to begin scanning.</span>
            )}
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-750 transition-colors"
            >
              Cancel
            </button>

            {selectedScanResult && (
              <button
                type="button"
                onClick={handleConfirmAddToPantry}
                disabled={selectedEdiblesCount === 0}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-600 hover:to-teal-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Add {selectedEdiblesCount} Eatables to Pantry</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
