// components/ItemBrowser.jsx
'use client'
import { useState, useMemo } from 'react'
import ItemGrid from '@/components/ItemGrid'
import FilterBar from '@/components/FilterBar'
import ItemModal from '@/components/ItemModal'

export default function ItemBrowser({ itemsData }) {
  const [selectedSlotType, setSelectedSlotType] = useState('armor')
  const [selectedName, setSelectedName] = useState('')
  const [selectedTier, setSelectedTier] = useState('')
  const [selectedEnchantment, setSelectedEnchantment] = useState('')
  const [selectedItem, setSelectedItem] = useState(null)

  // Extract unique values for filters
  const uniqueSlotTypes = useMemo(
    () => [...new Set(itemsData.map((item) => item.SlotType))].sort(),
    [itemsData]
  )

  const availableNames = useMemo(
    () => [
      ...new Set(
        itemsData
          .filter((item) => !selectedSlotType || item.SlotType === selectedSlotType)
          .map((item) => item['EN-US'])
      ),
    ],
    [itemsData, selectedSlotType]
  )

  const uniqueTiers = useMemo(() => {
    const tiers = itemsData
      .filter(
        (item) =>
          (!selectedSlotType || item.SlotType === selectedSlotType) &&
          (!selectedName || item['EN-US'].toLowerCase().includes(selectedName)) &&
          (!selectedEnchantment || item['@enchantmentlevel'] === selectedEnchantment)
      )
      .map((item) => {
        const match = item.UniqueName.match(/^(T\d+)/)
        return match ? match[1] : null
      })
      .filter(Boolean)
    return [...new Set(tiers)].sort((a, b) => {
      const numA = parseInt(a.substring(1))
      const numB = parseInt(b.substring(1))
      return numA - numB
    })
  }, [itemsData, selectedSlotType, selectedName, selectedEnchantment])

  const uniqueEnchantments = useMemo(() => {
    const enchantments = itemsData
      .filter(
        (item) =>
          (!selectedSlotType || item.SlotType === selectedSlotType) &&
          (!selectedName || item['EN-US'].toLowerCase().includes(selectedName)) &&
          (!selectedTier || item.UniqueName.startsWith(selectedTier))
      )
      .map((item) => item['@enchantmentlevel'])
      .filter((level) => level !== undefined && level !== null)
    return [...new Set(enchantments)].sort((a, b) => parseInt(a) - parseInt(b))
  }, [itemsData, selectedSlotType, selectedName, selectedTier])

  const filteredItems = useMemo(() => {
    return itemsData.filter(
      (item) =>
        (!selectedSlotType || item.SlotType === selectedSlotType) &&
        (!selectedName || item['EN-US'].toLowerCase().includes(selectedName)) &&
        (!selectedTier || item.UniqueName.startsWith(selectedTier)) &&
        (!selectedEnchantment || item['@enchantmentlevel'] === selectedEnchantment)
    )
  }, [itemsData, selectedSlotType, selectedName, selectedTier, selectedEnchantment])

  const handleClearFilters = () => {
    setSelectedSlotType('armor')
    setSelectedName('')
    setSelectedTier('')
    setSelectedEnchantment('')
  }

  console.log(filteredItems)
  
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Albion Black Market</h1>
          <p className="text-slate-400">Find and compare items by tier, slot, and enchantment</p>
        </div>

        <FilterBar
          slotTypes={uniqueSlotTypes}
          names={availableNames}
          tiers={uniqueTiers}
          enchantments={uniqueEnchantments}
          selectedSlotType={selectedSlotType}
          selectedName={selectedName}
          selectedTier={selectedTier}
          selectedEnchantment={selectedEnchantment}
          onSlotTypeChange={setSelectedSlotType}
          onNameChange={setSelectedName}
          onTierChange={setSelectedTier}
          onEnchantmentChange={setSelectedEnchantment}
          onClearFilters={handleClearFilters}
          itemCount={filteredItems.length}
        />

        <ItemGrid
          items={filteredItems}
          onSelectItem={setSelectedItem}
        />
      </div>

      {selectedItem && (
        <ItemModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </main>
  )
}