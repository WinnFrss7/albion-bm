'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Save, X, RotateCcw } from 'lucide-react'
import Image from 'next/image'

export default function ManualPriceModal({ item, currentPrices, onClose, onSubmit }) {
  const [itemPrice, setItemPrice] = useState(
    currentPrices?.itemPrice ?? item.price ?? 0
  )
  const [resourcePrices, setResourcePrices] = useState(() => {
    const initial = {}
    item.CraftingRequirements.craftresource.forEach(res => {
      initial[res["@uniquename"]] = 
        currentPrices?.resources?.[res["@uniquename"]] ?? res.price ?? 0
    })
    return initial
  })
  // Store as decimal (0.248), display as percentage (24.8)
  const [returnRate, setReturnRate] = useState(
    currentPrices?.returnRate ?? 0.248
  )
  // Separate display state for the input field
  const [returnRateDisplay, setReturnRateDisplay] = useState(
    ((currentPrices?.returnRate ?? 0.248) * 100).toFixed(1)
  )

  const handleResourcePriceChange = (uniqueName, value) => {
    const numValue = value === '' ? 0 : parseFloat(value)
    setResourcePrices(prev => ({
      ...prev,
      [uniqueName]: isNaN(numValue) ? 0 : numValue
    }))
  }

  const handleReturnRateChange = (value) => {
    // Update display state immediately for smooth typing
    setReturnRateDisplay(value)
    
    // Allow empty string for editing
    if (value === '') {
      setReturnRate(0)
      return
    }
    
    // Convert percentage input to decimal (e.g., 24.8 -> 0.248)
    const percentage = parseFloat(value)
    if (isNaN(percentage)) {
      return // Don't update if invalid
    }
    
    const decimal = percentage / 100
    // Clamp between 0 and 1
    const clamped = Math.max(0, Math.min(1, decimal))
    setReturnRate(clamped)
  }

  const handleReset = () => {
    setItemPrice(item.price ?? 0)
    const reset = {}
    item.CraftingRequirements.craftresource.forEach(res => {
      reset[res["@uniquename"]] = res.price ?? 0
    })
    setResourcePrices(reset)
    setReturnRate(0.248)
    setReturnRateDisplay('24.8')
  }

  const handleSubmit = (e) => {
    e?.stopPropagation()
    onSubmit({
      itemPrice: parseFloat(itemPrice) || 0,
      resources: resourcePrices,
      returnRate: returnRate
    })
  }

  const handleClose = (e) => {
    e?.stopPropagation()
    onClose()
  }

  const handleResetClick = (e) => {
    e?.stopPropagation()
    handleReset()
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-3xl bg-slate-900 border-slate-700 max-h-[90vh] p-0 flex flex-col"
        onClick={(e) => e.stopPropagation()}
        onInteractOutside={(e) => {
          e.preventDefault()
        }}
        onEscapeKeyDown={(e) => {
          e.preventDefault()
          onClose()
        }}
      >
        <DialogHeader className="border-b border-slate-700 pb-3 sm:pb-4 flex-shrink-0 px-4 sm:px-6 pt-4 sm:pt-6">
          <DialogTitle className="text-white text-lg sm:text-xl font-bold">
            Manual Price Input
          </DialogTitle>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            Enter custom prices for crafting calculation. Changes will be marked as "Manual" in the economics section.
          </p>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 px-4 sm:px-6 min-h-0">
          <div className="space-y-4 sm:space-y-6 py-3 sm:py-4">
            {/* ITEM PRICE */}
            <div className="bg-gradient-to-br from-amber-900/20 to-slate-800/50 rounded-xl p-4 sm:p-5 border border-amber-700/30">
              <h4 className="text-xs sm:text-sm font-bold text-amber-400 mb-3 sm:mb-4 flex items-center gap-2">
                <span className="w-1 h-3 sm:h-4 bg-amber-400 rounded"></span>
                Item Sell Price
              </h4>
              <div className="space-y-2">
                <Label htmlFor="item-price" className="text-slate-300 text-xs sm:text-sm">
                  {item["EN-US"]}
                </Label>
                <div className="relative">
                  <Input
                    id="item-price"
                    type="number"
                    value={itemPrice}
                    onChange={(e) => setItemPrice(e.target.value)}
                    className="bg-slate-800 border-slate-700 text-white pr-14 sm:pr-16 focus:border-amber-500 text-sm sm:text-base"
                    placeholder="Enter price"
                    min="0"
                    step="1"
                  />
                  <span className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs sm:text-sm">
                    silver
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Original API price: {item.price ? `${item.price.toLocaleString()} silver` : 'N/A'}
                </p>
              </div>
            </div>

            {/* RETURN RATE */}
            <div className="bg-gradient-to-br from-cyan-900/20 to-slate-800/50 rounded-xl p-4 sm:p-5 border border-cyan-700/30">
              <h4 className="text-xs sm:text-sm font-bold text-cyan-400 mb-3 sm:mb-4 flex items-center gap-2">
                <span className="w-1 h-3 sm:h-4 bg-cyan-400 rounded"></span>
                Return Rate
              </h4>
              <div className="space-y-2">
                <Label htmlFor="return-rate" className="text-slate-300 text-xs sm:text-sm">
                  Resource Return Rate
                </Label>
                <div className="relative">
                  <Input
                    id="return-rate"
                    type="text"
                    inputMode="decimal"
                    value={returnRateDisplay}
                    onChange={(e) => handleReturnRateChange(e.target.value)}
                    className="bg-slate-800 border-slate-700 text-white pr-10 sm:pr-12 focus:border-cyan-500 text-sm sm:text-base"
                    placeholder="24.8"
                  />
                  <span className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs sm:text-sm font-medium">
                    %
                  </span>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-2 sm:p-3 mt-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">Current Return Rate:</span>
                    <span className="text-cyan-400 font-medium">{(returnRate * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Decimal Value:</span>
                    <span className="text-slate-300 font-mono">{returnRate.toFixed(3)}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Default: 24.8% (Based on resource return mechanics for non-artifact items)
                </p>
              </div>
            </div>

            {/* RESOURCE PRICES */}
            <div className="bg-slate-800/50 rounded-xl p-4 sm:p-5 border border-slate-700">
              <h4 className="text-xs sm:text-sm font-bold text-green-400 mb-3 sm:mb-4 flex items-center gap-2">
                <span className="w-1 h-3 sm:h-4 bg-green-400 rounded"></span>
                Resource Prices
              </h4>
              <div className="space-y-2 sm:space-y-3">
                {item.CraftingRequirements.craftresource.map((res, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-900/70 rounded-lg p-3 sm:p-4 border border-slate-700/50"
                  >
                    <div className="flex items-center gap-2 sm:gap-4 mb-2 sm:mb-3">
                      <div className="bg-slate-800 rounded-lg p-1.5 sm:p-2 border border-slate-700 flex-shrink-0">
                        <Image
                          src={`https://render.albiononline.com/v1/item/${res["@uniquename"]}.png`}
                          alt={res["@uniquename"]}
                          width={40}
                          height={40}
                          className="object-contain w-8 h-8 sm:w-10 sm:h-10"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs sm:text-sm font-medium text-slate-200 mb-1 truncate">
                          {res["EN-US"]}
                        </div>
                        <div className="text-xs text-slate-500">
                          Quantity needed: ×{res["@count"]}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label 
                        htmlFor={`res-${idx}`} 
                        className="text-slate-400 text-xs"
                      >
                        Price per unit
                      </Label>
                      <div className="relative">
                        <Input
                          id={`res-${idx}`}
                          type="number"
                          value={resourcePrices[res["@uniquename"]] || ''}
                          onChange={(e) => 
                            handleResourcePriceChange(res["@uniquename"], e.target.value)
                          }
                          className="bg-slate-800 border-slate-700 text-white pr-14 sm:pr-16 focus:border-green-500 text-sm sm:text-base"
                          placeholder="Enter price"
                          min="0"
                          step="1"
                        />
                        <span className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                          silver
                        </span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-1 text-xs">
                        <span className="text-slate-500 truncate">
                          Original: {res.price ? `${res.price.toLocaleString()} silver` : 'N/A'}
                        </span>
                        <span className="text-slate-400 whitespace-nowrap">
                          Total: {(resourcePrices[res["@uniquename"]] * res["@count"]).toLocaleString()} silver
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER - Stacked on mobile, row on desktop */}
        <div className="flex flex-col sm:flex-row justify-between gap-2 sm:gap-0 pt-3 sm:pt-4 border-t border-slate-700 flex-shrink-0 px-4 sm:px-6 pb-4 sm:pb-6">
          <Button
            onClick={handleResetClick}
            variant="outline"
            className="border-slate-600 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors w-full sm:w-auto text-sm order-2 sm:order-1"
          >
            <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
            Reset to Original
          </Button>
          
          <div className="flex flex-col sm:flex-row gap-2 order-1 sm:order-2">
            <Button
              onClick={handleClose}
              variant="outline"
              className="border-slate-600 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors w-full sm:w-auto text-sm"
            >
              <X className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="bg-amber-600 hover:bg-amber-700 text-white transition-colors w-full sm:w-auto text-sm"
            >
              <Save className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
              Save & Calculate
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}