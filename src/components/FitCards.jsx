import React, { useState, useMemo, useEffect } from 'react';
import { Plus, X, Pencil, Layers, Shirt, Footprints } from 'lucide-react';
import useStore from '../store';

const PIECE_FIELDS = [
  { key: 'over', label: 'Over', icon: Layers, optional: true },
  { key: 'top', label: 'Top', icon: Shirt, optional: false },
  { key: 'bottom', label: 'Bottom', icon: Shirt, optional: false },
  { key: 'shoes', label: 'Shoes', icon: Footprints, optional: false }
];

const WARDROBE_COLUMN_BY_FIELD = {
  over: 'over',
  top: 'tops',
  bottom: 'bottoms',
  shoes: 'shoes'
};

const emptyForm = { name: '', over: '', top: '', bottom: '', shoes: '', notes: '' };

const FitCards = () => {
  const categories = useStore((state) => state.categories);
  const wardrobeData = useStore((state) => state.wardrobeData);
  const fitCards = useStore((state) => state.fitCards);
  const updateFitCards = useStore((state) => state.updateFitCards);
  const reloadFromStorage = useStore((state) => state.reloadFromStorage);

  useEffect(() => {
    const handleSync = () => reloadFromStorage();
    window.addEventListener('supabase-sync-complete', handleSync);
    return () => window.removeEventListener('supabase-sync-complete', handleSync);
  }, [reloadFromStorage]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  // Build "categoryName — item" suggestions per column, pulled from the Wardrobe tab
  const optionsByField = useMemo(() => {
    const result = {};
    Object.entries(WARDROBE_COLUMN_BY_FIELD).forEach(([field, column]) => {
      const opts = [];
      categories.forEach((cat) => {
        (wardrobeData[cat.id]?.[column] || []).forEach((item) => {
          if (item && item.trim()) opts.push({ value: item, label: `${cat.name} — ${item}` });
        });
      });
      result[field] = opts;
    });
    return result;
  }, [categories, wardrobeData]);

  const openNewModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEditModal = (card) => {
    setEditingId(card.id);
    setForm({
      name: card.name || '',
      over: card.over || '',
      top: card.top || '',
      bottom: card.bottom || '',
      shoes: card.shoes || '',
      notes: card.notes || ''
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const saveCard = () => {
    if (!form.top.trim() || !form.bottom.trim() || !form.shoes.trim()) return;

    if (editingId) {
      updateFitCards(fitCards.map((c) => (c.id === editingId ? { ...c, ...form } : c)));
    } else {
      updateFitCards([
        ...fitCards,
        { id: Date.now(), ...form, createdAt: new Date().toISOString() }
      ]);
    }
    closeModal();
  };

  const deleteCard = (id) => {
    updateFitCards(fitCards.filter((c) => c.id !== id));
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl border border-slate-200 p-4 sm:p-6 md:p-8">
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Fit Cards</h2>
          <p className="text-slate-500 mt-1 text-xs sm:text-sm">
            Save complete outfits — over, top, bottom &amp; shoes that work together
          </p>
        </div>
        <button
          onClick={openNewModal}
          className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs sm:text-sm font-semibold transition-colors shadow-sm hover:shadow-md self-start sm:self-auto"
        >
          <Plus size={16} />
          New Fit Card
        </button>
      </div>

      {fitCards.length === 0 ? (
        <div className="text-center py-12 sm:py-16 text-slate-400 text-sm">
          No fit cards yet. Combine pieces from your wardrobe into a saved outfit.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {fitCards.map((card) => (
            <div
              key={card.id}
              className="group relative bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-3 sm:p-4 flex flex-col gap-2"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-slate-800 text-sm break-words">
                  {card.name || 'Untitled fit'}
                </h3>
                <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEditModal(card)}
                    className="text-slate-400 hover:text-indigo-600 transition-colors p-0.5"
                    title="Edit fit card"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => deleteCard(card.id)}
                    className="text-slate-400 hover:text-red-500 transition-colors p-0.5"
                    title="Delete fit card"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1.5 mt-1">
                {PIECE_FIELDS.map((field) => {
                  const value = card[field.key];
                  if (field.optional && !value) return null;
                  return (
                    <div key={field.key} className="flex items-center gap-2 text-xs sm:text-sm">
                      <field.icon size={13} className="text-indigo-400 flex-shrink-0" />
                      <span className="text-slate-400 uppercase text-[10px] font-semibold w-14 flex-shrink-0">{field.label}</span>
                      <span className="text-slate-700 break-words">{value || <span className="text-slate-300">—</span>}</span>
                    </div>
                  );
                })}
              </div>

              {card.notes && (
                <p className="text-xs text-slate-500 italic mt-1 border-t border-slate-100 pt-2 break-words">
                  {card.notes}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 flex flex-col gap-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-800">
                {editingId ? 'Edit Fit Card' : 'New Fit Card'}
              </h3>
              <button
                onClick={closeModal}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Fit name (optional) e.g. Sunday smart-casual"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />

            {PIECE_FIELDS.map(({ key, label, optional }) => (
              <div key={key}>
                <label className="text-xs font-semibold uppercase text-slate-500 tracking-wide">
                  {label} {optional && <span className="normal-case font-normal text-slate-400">(optional)</span>}
                </label>
                <input
                  type="text"
                  list={`fitcard-options-${key}`}
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  placeholder={`Pick from wardrobe or type your own...`}
                  className="mt-1 w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
                <datalist id={`fitcard-options-${key}`}>
                  {optionsByField[key].map((opt, i) => (
                    <option key={i} value={opt.value} label={opt.label} />
                  ))}
                </datalist>
              </div>
            ))}

            <div>
              <label className="text-xs font-semibold uppercase text-slate-500 tracking-wide">Notes</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Why this combo works, occasion, etc."
                className="mt-1 w-full h-20 px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-slate-600 text-sm rounded-xl hover:bg-slate-100 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={saveCard}
                disabled={!form.top.trim() || !form.bottom.trim() || !form.shoes.trim()}
                className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-xl hover:bg-indigo-700 transition-colors font-medium disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {editingId ? 'Save Changes' : 'Add Fit Card'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FitCards;
