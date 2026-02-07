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
  const [returnRate, setReturnRate] = useState(
    currentPrices?.returnRate ?? 0.248
  )

  const handleResourcePriceChange = (uniqueName, value) => {
    const numValue = value === '' ? 0 : parseFloat(value)
    setResourcePrices(prev => ({
      ...prev,
      [uniqueName]: isNaN(numValue) ? 0 : numValue
    }))
  }

  const handleReset = () => {
    setItemPrice(item.price ?? 0)
    const reset = {}
    item.CraftingRequirements.craftresource.forEach(res => {
      reset[res["@uniquename"]] = res.price ?? 0
    })
    setResourcePrices(reset)
    setReturnRate(0.248)
  }

  const handleSubmit = () => {
    onSubmit({
      itemPrice: parseFloat(itemPrice) || 0,
      resources: resourcePrices,
      returnRate: parseFloat(returnRate) || 0.248
    })
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl bg-slate-900 border-slate-700 max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader className="border-b border-slate-700 pb-4">
          <DialogTitle className="text-white text-xl font-bold">
            Manual Price Input
          </DialogTitle>
          <p className="text-sm text-slate-400 mt-2">
            Enter custom prices for crafting calculation. Changes will be marked as "Manual" in the economics section.
          </p>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 pr-2">
          <div className="space-y-6 py-4">
            {/* ITEM PRICE */}
            <div className="bg-gradient-to-br from-amber-900/20 to-slate-800/50 rounded-xl p-5 border border-amber-700/30">
              <h4 className="text-sm font-bold text-amber-400 mb-4 flex items-center gap-2">
                <span className="w-1 h-4 bg-amber-400 rounded"></span>
                Item Sell Price
              </h4>
              <div className="space-y-2">
                <Label htmlFor="item-price" className="text-slate-300 text-sm">
                  {item["EN-US"]}
                </Label>
                <div className="relative">
                  <Input
                    id="item-price"
                    type="number"
                    value={itemPrice}
                    onChange={(e) => setItemPrice(e.target.value)}
                    className="bg-slate-800 border-slate-700 text-white pr-16 focus:border-amber-500"
                    placeholder="Enter price"
                    min="0"
                    step="1"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                    silver
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Original API price: {item.price ? `${item.price.toLocaleString()} silver` : 'N/A'}
                </p>
              </div>
            </div>

            {/* RETURN RATE */}
            <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
              <h4 className="text-sm font-bold text-cyan-400 mb-4 flex items-center gap-2">
                <span className="w-1 h-4 bg-cyan-400 rounded"></span>
                Return Rate
              </h4>
              <div className="space-y-2">
                <Label htmlFor="return-rate" className="text-slate-300 text-sm">
                  Resource Return Rate (0-1)
                </Label>
                <div className="relative">
                  <Input
                    id="return-rate"
                    type="number"
                    value={returnRate}
                    onChange={(e) => setReturnRate(e.target.value)}
                    className="bg-slate-800 border-slate-700 text-white focus:border-cyan-500"
                    placeholder="0.248"
                    min="0"
                    max="1"
                    step="0.001"
                  />
                </div>
                <p className="text-xs text-slate-500">
                  Default: 0.248 (24.8% return on non-artifact resources)
                </p>
              </div>
            </div>

            {/* RESOURCE PRICES */}
            <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
              <h4 className="text-sm font-bold text-green-400 mb-4 flex items-center gap-2">
                <span className="w-1 h-4 bg-green-400 rounded"></span>
                Resource Prices
              </h4>
              <div className="space-y-3">
                {item.CraftingRequirements.craftresource.map((res, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-900/70 rounded-lg p-4 border border-slate-700/50"
                  >
                    <div className="flex items-center gap-4 mb-3">
                      <div className="bg-slate-800 rounded-lg p-2 border border-slate-700">
                        <Image
                          src={`https://render.albiononline.com/v1/item/${res["@uniquename"]}.png`}
                          alt={res["@uniquename"]}
                          width={40}
                          height={40}
                          className="object-contain"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-slate-200 mb-1">
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
                          className="bg-slate-800 border-slate-700 text-white pr-16 focus:border-green-500"
                          placeholder="Enter price"
                          min="0"
                          step="1"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                          silver
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">
                          Original: {res.price ? `${res.price.toLocaleString()} silver` : 'N/A'}
                        </span>
                        <span className="text-slate-400">
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

        {/* FOOTER */}
        <div className="flex justify-between pt-4 border-t border-slate-700">
          <Button
            onClick={handleReset}
            variant="outline"
            className="border-slate-600 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset to Original
          </Button>
          
          <div className="flex gap-2">
            <Button
              onClick={onClose}
              variant="outline"
              className="border-slate-600 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="bg-amber-600 hover:bg-amber-700 text-white transition-colors"
            >
              <Save className="w-4 h-4 mr-2" />
              Save & Calculate
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
