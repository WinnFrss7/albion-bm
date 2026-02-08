'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { X, Edit3 } from 'lucide-react'
import Image from 'next/image'
import ManualPriceModal from './ManualPriceModal'
import { calculateCraftingProfit } from '../utils/calculateCraftingProfit'


export default function ItemModal({ item, onClose }) {
  const [imageErrors, setImageErrors] = useState(new Set())
  const [showPriceModal, setShowPriceModal] = useState(false)
  const [manualPrices, setManualPrices] = useState(null)
  const [isManualCalculation, setIsManualCalculation] = useState(false)
  console.log(item)
  const handleImageError = (uniqueName) => {
    setImageErrors((prev) => new Set(prev).add(uniqueName))
  }

  const getTierColor = (uniqueName) => {
    const tier = parseInt(uniqueName.match(/T(\d+)/)?.[1] || 0)
    const colors = {
      4: 'bg-blue-600 text-white',
      5: 'bg-purple-600 text-white',
      6: 'bg-orange-600 text-white',
      7: 'bg-red-600 text-white',
      8: 'bg-amber-700 text-white',
    }
    return colors[tier] || 'bg-slate-600 text-white'
  }

  const getEnchantmentLevel = (uniqueName) => {
    const match = uniqueName.match(/@(\d+)/)
    return match ? match[1] : '0'
  }

  const handleManualPriceSubmit = (prices) => {
    setManualPrices(prices)
    setIsManualCalculation(true)
    setShowPriceModal(false)
  }

  // Calculate profit with manual prices if available
  const getDisplayItem = () => {
    if (!manualPrices) return item

    // Create a modified item with manual prices
    const modifiedItem = {
      ...item,
      price: manualPrices.itemPrice,
      CraftingRequirements: {
        ...item.CraftingRequirements,
        craftresource: item.CraftingRequirements.craftresource.map(res => ({
          ...res,
          price: manualPrices.resources[res["@uniquename"]] !== undefined 
            ? manualPrices.resources[res["@uniquename"]] 
            : res.price
        }))
      }
    }

    // Recalculate profit with manual prices
    const newProfit = calculateCraftingProfit(modifiedItem, manualPrices.returnRate)
    return {
      ...modifiedItem,
      craftingProfit: newProfit,
      returnRate: manualPrices.returnRate
    }
  }

  const displayItem = getDisplayItem()
  
  // Get the return rate to display (from manual prices or default)
  const currentReturnRate = manualPrices?.returnRate ?? 0.248

  return (
  <>
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-slate-900 border-slate-700">
        {/* HEADER */}
        <DialogHeader className="border-b border-slate-700 pb-4">
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-white text-2xl font-bold">
                {item["EN-US"]}
              </DialogTitle>
            </div>
            <Badge className={`${getTierColor(item.UniqueName)} shadow-md text-sm px-3 py-1`}>
              Enchantment @{getEnchantmentLevel(item.UniqueName)}
            </Badge>
          </div>
        </DialogHeader>

        <div className="max-h-[70vh] overflow-y-auto pr-2">
          <div className="space-y-6 py-4">
            {/* MAIN GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* LEFT COLUMN - IMAGE */}
              <div className="lg:col-span-1">
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700 h-full flex items-center justify-center">
                  {!imageErrors.has(item.UniqueName) ? (
                    <Image
                      src={`https://render.albiononline.com/v1/item/${item.UniqueName}.png`}
                      alt={item["EN-US"]}
                      width={200}
                      height={200}
                      className="object-contain drop-shadow-2xl"
                      onError={() => handleImageError(item.UniqueName)}
                      crossOrigin="anonymous"
                    />
                  ) : (
                    <span className="text-slate-500 text-sm">
                      No Image Available
                    </span>
                  )}
                </div>
              </div>

              {/* RIGHT COLUMNS - INFO */}
              <div className="lg:col-span-2 space-y-4">
                {/* CRAFTING REQUIREMENTS */}
                <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
                  <h4 className="text-base font-bold text-blue-400 mb-4 flex items-center gap-2">
                    <span className="w-1 h-5 bg-blue-400 rounded"></span>
                    Crafting Requirements
                  </h4>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                      <p className="text-xs text-slate-400 mb-1">Crafting Focus</p>
                      <p className="text-lg font-bold text-white">
                        {item.CraftingRequirements["@craftingfocus"]}
                      </p>
                    </div>

                    <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                      <p className="text-xs text-slate-400 mb-1">Crafting Time</p>
                      <p className="text-lg font-bold text-white">
                        {item.CraftingRequirements["@time"]}s
                      </p>
                    </div>

                    <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                      <p className="text-xs text-slate-400 mb-1">Silver Cost</p>
                      <p className="text-lg font-bold text-white">
                        Float
                      </p>
                    </div>
                  </div>
                </div>

                {/* CRAFTING ECONOMICS */}
                <div className="bg-gradient-to-br from-amber-900/20 to-slate-800/50 rounded-xl p-5 border border-amber-700/30">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-base font-bold text-amber-700 flex items-center gap-2">
                      <span className="w-1 h-5 bg-amber-400 rounded"></span>
                      Crafting Economics
                      {isManualCalculation && (
                        <Badge variant="outline" className="ml-2 text-xs border-amber-500/50 text-amber-400">
                          Manual
                        </Badge>
                      )}
                    </h4>
                    <Button
                      onClick={() => setShowPriceModal(true)}
                      size="sm"
                      variant="outline"
                      className="border-amber-600 text-amber-700 hover:bg-amber-600/20 hover:text-amber-300 transition-colors"
                    >
                      <Edit3 className="w-3 h-3 mr-1" />
                      Edit Prices
                    </Button>
                  </div>

                  {displayItem.craftingProfit ? (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
                        <span className="text-sm text-slate-300">Item Sell Price</span>
                        <span className="text-base font-bold text-white">
                          {displayItem.price.toLocaleString()} 
                          <span className="text-xs text-slate-400 ml-1">silver</span>
                        </span>
                      </div>

                      <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
                        <span className="text-sm text-slate-300">Total Craft Cost</span>
                        <span className="text-base font-bold text-red-400">
                          -{displayItem.craftingProfit.totalCraftCost.toLocaleString()}
                          <span className="text-xs text-slate-400 ml-1">silver</span>
                        </span>
                      </div>

                      <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
                        <span className="text-sm text-slate-300">Market Tax (10%)</span>
                        <span className="text-base font-bold text-red-400">
                          -{displayItem.craftingProfit.marketTax.toLocaleString()}
                          <span className="text-xs text-slate-400 ml-1">silver</span>
                        </span>
                      </div>

                      <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
                        <div className="flex flex-col">
                          <span className="text-sm text-slate-300">Return Value</span>
                          <span className="text-xs text-cyan-300/70">
                            ({(currentReturnRate * 100).toFixed(1)}% return rate)
                          </span>
                        </div>
                        <span className="text-base font-bold text-cyan-400">
                          +{displayItem.craftingProfit.returnValue.toLocaleString()}
                          <span className="text-xs text-slate-400 ml-1">silver</span>
                        </span>
                      </div>

                      <div className="flex justify-between items-center pt-3 mt-2 border-t-2 border-slate-600">
                        <span className="text-base font-bold text-white">Net Profit</span>
                        <span
                          className={`text-xl font-black ${
                            displayItem.craftingProfit.profit >= 0
                              ? "text-green-400"
                              : "text-red-400"
                          }`}
                        >
                          {displayItem.craftingProfit.profit >= 0 ? "+" : ""}
                          {displayItem.craftingProfit.profit.toLocaleString()}
                          <span className="text-sm text-slate-400 ml-1">silver</span>
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-900/50 rounded-lg p-6 text-center border border-slate-700/50">
                      <div className="text-slate-500 mb-2">
                        <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-sm font-medium text-slate-400">Economic Data Unavailable</p>
                        <p className="text-xs text-slate-500 mt-2">
                          Price data cannot be calculated due to low market activity,<br />
                          missing resource prices, or item rarity.
                        </p>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                        <div className="bg-slate-800/50 rounded p-2">
                          <p className="text-slate-500">Sell Price</p>
                          <p className="text-slate-400 font-medium">{item.price ? `${item.price.toLocaleString()} silver` : 'N/A'}</p>
                        </div>
                        <div className="bg-slate-800/50 rounded p-2">
                          <p className="text-slate-500">Profit</p>
                          <p className="text-slate-400 font-medium">N/A</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* RESOURCES - FULL WIDTH */}
            <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
              <h4 className="text-base font-bold text-green-400 mb-4 flex items-center gap-2">
                <span className="w-1 h-5 bg-green-400 rounded"></span>
                Required Resources
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {displayItem.CraftingRequirements.craftresource.map((res, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-slate-900/70 rounded-lg p-4 border border-slate-700/50 hover:border-slate-600 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-slate-800 rounded-lg p-2 border border-slate-700">
                        <Image
                          src={`https://render.albiononline.com/v1/item/${res["@uniquename"]}.png`}
                          alt={res["@uniquename"]}
                          width={48}
                          height={48}
                          className="object-contain"
                        />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-200">
                          {res["EN-US"]}
                        </div>
                        <div className="text-xs text-slate-400">
                          {res.price ? `${res.price.toLocaleString()} silver/unit` : 'Price N/A'}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-lg font-bold text-white">
                        ×{res["@count"]}
                      </div>
                      <div className="text-xs text-slate-400">
                        {res.price ? `${(res.price * res["@count"]).toLocaleString()} total` : 'N/A'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex justify-end pt-4 border-t border-slate-700">
          <Button
            onClick={onClose}
            variant="outline"
            className="border-slate-600 text-slate-600 hover:bg-slate-700 hover:text-white transition-colors"
          >
            <X className="w-4 h-4 mr-2" />
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>

    {/* MANUAL PRICE MODAL */}
    {showPriceModal && (
      <ManualPriceModal
        item={item}
        currentPrices={manualPrices}
        onClose={() => setShowPriceModal(false)}
        onSubmit={handleManualPriceSubmit}
      />
    )}
  </>
);
}