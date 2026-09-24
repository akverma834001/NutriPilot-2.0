import React, { useState } from 'react';
import { usePersonalState } from '../context/PersonalStateContext';
import { ProvenanceBadge } from '../components/ProvenanceBadge';
import { ReceiptScanModal } from '../components/ReceiptScanModal';
import { PantryItem } from '../types';
import {
  ShoppingBag,
  Plus,
  Trash2,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Check,
  X,
  Camera,
  ScanLine,
  ShieldCheck,
  UploadCloud
} from 'lucide-react';

interface PantryViewProps {
  onNavigateToRecommendations: () => void;
}

export const PantryView: React.FC<PantryViewProps> = ({ onNavigateToRecommendations }) => {
  const {
    state,
    togglePantryItemStock,
    addPantryItem,
    addMultiplePantryItems,
    deletePantryItem
  } = usePersonalState();

  const [showAddForm, setShowAddForm] = useState(false);
  const [showScanModal, setShowScanModal] = useState(false);
  const [recentScanNotification, setRecentScanNotification] = useState<string | null>(null);

  const [newName, setNewName] = useState('');
  const [newQuantity, setNewQuantity] = useState('');
  const [newCategory, setNewCategory] = useState<PantryItem['category']>('protein');
  const [newUnitCost, setNewUnitCost] = useState(40);

  const pantry = state.pantry;
  const inStockCount = pantry.filter((p) => p.inStock).length;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    addPantryItem({
      name: newName,
      quantity: newQuantity || '1 portion',
      category: newCategory,
      expiryDays: 7,
      inStock: true,
      unitCostInr: newUnitCost
    });
    setNewName('');
    setNewQuantity('');
    setShowAddForm(false);
  };

  const handlePantryUpdatedFromBill = (
    scannedEatables: Omit<PantryItem, 'id'>[],
    storeName: string
  ) => {
    addMultiplePantryItems(scannedEatables);
    setRecentScanNotification(
      `🎉 Successfully added ${scannedEatables.length} eatable items from "${storeName}" to your pantry! Non-edible household items (detergents, cleaners, soaps) were safely filtered out.`
    );
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider text-brand-400 font-bold font-mono">
              Kitchen Pantry
            </span>
            <span className="text-slate-500">•</span>
            <ProvenanceBadge infoType="MEASURED" source="Your Kitchen" confidence="high" />
          </div>
          <h1 className="text-2xl font-extrabold text-white font-heading mt-1">
            My Kitchen Pantry
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            NutriPilot prioritizes what is already in your kitchen to save money, avoid food waste, and minimize prep time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowScanModal(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-600 hover:to-indigo-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-sky-500/20 active:scale-95 transition-all"
          >
            <Camera className="w-4 h-4" />
            <span>Scan Receipt</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateToRecommendations()}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-500 to-emerald-400 hover:from-brand-600 hover:to-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-brand-500/20 active:scale-95 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Recipe Ideas</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-750 text-xs font-semibold flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {/* RECENT SCAN CONFIRMATION TOAST / BANNER */}
      {recentScanNotification && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-200 flex items-center justify-between gap-3 text-xs shadow-lg animate-slide-up">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="leading-relaxed">{recentScanNotification}</span>
          </div>
          <button
            type="button"
            onClick={() => setRecentScanNotification(null)}
            className="text-emerald-400 hover:text-white p-1 rounded hover:bg-emerald-500/20 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* SMART RECEIPT SCANNER CALLOUT CARD */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-sky-950/40 via-slate-900 to-indigo-950/40 border border-sky-500/30 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
            <ScanLine className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-bold text-white">
                Auto-Update Pantry from Grocery Store Bill
              </h3>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                <span>Eatables-Only Filter Active</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Upload any supermarket, D-Mart, Blinkit, or Kirana bill. NutriPilot's intelligent classifier extracts grocery items and <strong className="text-slate-200">strictly discards cleaning products, soaps, detergents, paper towels, and toiletries</strong> so only genuine nutrition ingredients enter your pantry.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowScanModal(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 text-slate-950 font-extrabold text-xs flex items-center gap-2 shrink-0 transition-all shadow-md shadow-sky-500/20 active:scale-95"
        >
          <Camera className="w-4 h-4" />
          <span>Upload Receipt Photo</span>
        </button>
      </div>

      {/* Add Item Form Drawer */}
      {showAddForm && (
        <form
          onSubmit={handleAdd}
          className="p-5 rounded-2xl bg-slate-900 border border-brand-500/30 space-y-4 animate-slide-up shadow-xl"
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h4 className="text-sm font-bold text-white">Add Pantry Ingredient</h4>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Item Name</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Soya Chunks"
                className="w-full bg-slate-850 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Quantity</label>
              <input
                type="text"
                value={newQuantity}
                onChange={(e) => setNewQuantity(e.target.value)}
                placeholder="e.g. 500g, 6 eggs"
                className="w-full bg-slate-850 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Category</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as any)}
                className="w-full bg-slate-850 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-500"
              >
                <option value="protein">Protein</option>
                <option value="dairy">Dairy</option>
                <option value="grain">Grain</option>
                <option value="fruit">Fruit</option>
                <option value="vegetable">Vegetable</option>
                <option value="staple">Staple</option>
                <option value="spice">Spice</option>
              </select>
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Unit Cost (₹)</label>
              <input
                type="number"
                value={newUnitCost}
                onChange={(e) => setNewUnitCost(Number(e.target.value))}
                className="w-full bg-slate-850 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-slate-950 font-bold text-xs"
            >
              Save Item
            </button>
          </div>
        </form>
      )}

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-slate-400 block">Total Tracked Items</span>
          <span className="text-xl font-bold text-white font-mono mt-1">{pantry.length} items</span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-slate-400 block">Currently In Stock</span>
          <span className="text-xl font-bold text-brand-400 font-mono mt-1">{inStockCount} items</span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-slate-400 block">High Protein Staples</span>
          <span className="text-xl font-bold text-emerald-400 font-mono mt-1">Paneer, Eggs, Dal</span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-slate-400 block">Waste Prevention</span>
          <span className="text-xl font-bold text-blue-400 font-mono mt-1">Active</span>
        </div>
      </div>

      {/* Pantry Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {pantry.map((item) => (
          <div
            key={item.id}
            className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
              item.inStock
                ? 'bg-slate-900/90 border-slate-800'
                : 'bg-slate-900/40 border-slate-800/50 opacity-60'
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-extrabold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  {item.category}
                </span>
                <span className="text-sm font-bold text-white">{item.name}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span>Qty: {item.quantity}</span>
                <span>Est: ₹{item.unitCostInr}</span>
                <span className={item.expiryDays <= 3 ? 'text-amber-400' : 'text-slate-400'}>
                  {item.expiryDays <= 3 ? `Expires in ${item.expiryDays}d` : `${item.expiryDays}d freshness`}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => togglePantryItemStock(item.id)}
                className={`p-2 rounded-xl text-xs font-semibold transition-colors ${
                  item.inStock
                    ? 'bg-brand-500/15 text-brand-300 border border-brand-500/30'
                    : 'bg-slate-850 text-slate-400 border border-slate-750'
                }`}
                title={item.inStock ? 'Mark out of stock' : 'Mark in stock'}
              >
                {item.inStock ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={() => deletePantryItem(item.id)}
                className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                title="Remove item"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Bill Scanner Modal */}
      <ReceiptScanModal
        isOpen={showScanModal}
        onClose={() => setShowScanModal(false)}
        onPantryUpdated={handlePantryUpdatedFromBill}
      />
    </div>
  );
};
