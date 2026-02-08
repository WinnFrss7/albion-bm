'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { X, Search } from 'lucide-react'

export default function FilterBar({
  slotTypes,
  names,
  selectedSlotType,
  selectedName,
  selectedTier,
  selectedEnchantment,
  tiers,
  enchantments,
  onSlotTypeChange,
  onNameChange,
  onTierChange,
  onEnchantmentChange,
  onClearFilters,
  itemCount,
}) {
  // Local state for immediate UI updates
  const [localSlotType, setLocalSlotType] = useState(selectedSlotType || 'ALL');
  const [localName, setLocalName] = useState(selectedName);
  const [localTier, setLocalTier] = useState(selectedTier || 'ALL');
  const [localEnchantment, setLocalEnchantment] = useState(selectedEnchantment || 'ALL');

  // Sync local state with props when they change externally (e.g., clear filters)
  useEffect(() => {
    setLocalSlotType(selectedSlotType || 'ALL');
  }, [selectedSlotType]);

  useEffect(() => {
    setLocalName(selectedName);
  }, [selectedName]);

  useEffect(() => {
    setLocalTier(selectedTier || 'ALL');
  }, [selectedTier]);

  useEffect(() => {
    setLocalEnchantment(selectedEnchantment || 'ALL');
  }, [selectedEnchantment]);

  // Debounce effect for slot type
  useEffect(() => {
    const timer = setTimeout(() => {
      const value = localSlotType === 'ALL' ? '' : localSlotType;
      if (value !== selectedSlotType) {
        onSlotTypeChange(value);
      }
    }, 3500);

    return () => clearTimeout(timer);
  }, [localSlotType]);

  // Debounce effect for name search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localName !== selectedName) {
        onNameChange(localName.toLowerCase());
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [localName]);

  // Debounce effect for tier
  useEffect(() => {
    const timer = setTimeout(() => {
      const value = localTier === 'ALL' ? '' : localTier;
      if (value !== selectedTier) {
        onTierChange(value);
      }
    }, 3500);

    return () => clearTimeout(timer);
  }, [localTier]);

  // Debounce effect for enchantment
  useEffect(() => {
    const timer = setTimeout(() => {
      const value = localEnchantment === 'ALL' ? '' : localEnchantment;
      if (value !== selectedEnchantment) {
        onEnchantmentChange(value);
      }
    }, 3500);

    return () => clearTimeout(timer);
  }, [localEnchantment]);

  const handleClearFilters = () => {
    setLocalSlotType('ALL');
    setLocalName('');
    setLocalTier('ALL');
    setLocalEnchantment('ALL');
    onClearFilters();
  };

  return (
    <div className="mb-8">
      {/* Main Filter Bar */}
      <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-6 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Slot Type Filter */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300 block">
              Slot Type
            </label>
            <Select
              value={localSlotType}
              onValueChange={setLocalSlotType}
            >
              <SelectTrigger className="bg-slate-800 border-slate-600 text-white hover:border-slate-500 transition-colors h-11">
                <SelectValue placeholder="Select Slot Type" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                <SelectItem value="ALL" className="text-white hover:bg-slate-700">
                  All Slot Types
                </SelectItem>
                {slotTypes.map((type) => (
                  <SelectItem 
                    key={type} 
                    value={type}
                    className="text-white hover:bg-slate-700 capitalize"
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tier Filter */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300 block">
              Tier
            </label>
            <Select
              value={localTier}
              onValueChange={setLocalTier}
            >
              <SelectTrigger className="bg-slate-800 border-slate-600 text-white hover:border-slate-500 transition-colors h-11">
                <SelectValue placeholder="All Tiers" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                <SelectItem value="ALL" className="text-white hover:bg-slate-700">
                  All Tiers
                </SelectItem>
                {tiers.map((tier) => (
                  <SelectItem 
                    key={tier} 
                    value={tier}
                    className="text-white hover:bg-slate-700"
                  >
                    {tier}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Enchantment Level Filter */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300 block">
              Enchantment
            </label>
            <Select
              value={localEnchantment}
              onValueChange={setLocalEnchantment}
            >
              <SelectTrigger className="bg-slate-800 border-slate-600 text-white hover:border-slate-500 transition-colors h-11">
                <SelectValue placeholder="All Enchantments" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                <SelectItem value="ALL" className="text-white hover:bg-slate-700">
                  All Enchantments
                </SelectItem>
                {enchantments.map((enchant) => (
                  <SelectItem 
                    key={enchant} 
                    value={enchant}
                    className="text-white hover:bg-slate-700"
                  >
                    @{enchant}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Item Name Search */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <Search className="w-4 h-4 text-slate-400" />
              Item Name
            </label>
            <div className="relative">
              <Input
                type="text"
                placeholder="Search items..."
                value={localName}
                onChange={(e) => setLocalName(e.target.value)}
                className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 hover:border-slate-500 focus:border-blue-500 transition-colors h-11 pr-10"
              />
              {localName && (
                <button
                  onClick={() => setLocalName('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Clear Filters Button - Bottom Right */}
        <div className="flex justify-end mt-4 pt-4 border-t border-slate-700">
          <Button
            onClick={handleClearFilters}
            variant="outline"
            size="sm"
            className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white hover:border-slate-500 bg-transparent transition-colors"
          >
            <X className="w-4 h-4 mr-2" />
            Reset to Default
          </Button>
        </div>
      </div>

      {/* Results Counter */}
      <div className="flex items-center justify-between px-2">
        <div className="text-sm text-slate-400">
          Found{' '}
          <span className="font-bold text-white text-base">
            {itemCount}
          </span>{' '}
          <span className="text-slate-500">items</span>
        </div>
        
        {/* Active Filters Display */}
        {(selectedSlotType || selectedName || selectedTier || selectedEnchantment) && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">Active filters:</span>
            <div className="flex gap-2 flex-wrap">
              {selectedSlotType && (
                <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded-md border border-blue-500/30 capitalize">
                  {selectedSlotType}
                </span>
              )}
              {selectedTier && (
                <span className="bg-amber-500/20 text-amber-400 px-2 py-1 rounded-md border border-amber-500/30">
                  {selectedTier}
                </span>
              )}
              {selectedEnchantment && (
                <span className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded-md border border-purple-500/30">
                  @{selectedEnchantment}
                </span>
              )}
              {selectedName && (
                <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded-md border border-green-500/30">
                  "{selectedName}"
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}