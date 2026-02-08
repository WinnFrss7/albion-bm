'use client'

import { useState, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { enrichItemsWithPrice } from '@/utils/getPriceApi'
import { useEffect } from 'react'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { useServerStore } from '@/stores/useServerStore' // Add this import

export default function ItemGrid({ items, onSelectItem }) {
  const [imageErrors, setImageErrors] = useState(new Set())
  const [itemsWithPrices, setItemsWithPrices] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  
  // Get server from Zustand store
  const selectedServer = useServerStore((state) => state.selectedServer)
  
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 50
  
  useEffect(() => {
    async function loadPrices() {
      if (items.length === 0) {
        setItemsWithPrices([])
        return
      }

      setIsLoading(true)
      setLoadingProgress(0)
      setCurrentPage(1) // Reset to page 1 when items change

      try {
        // Simulate progress updates
        const progressInterval = setInterval(() => {
          setLoadingProgress(prev => Math.min(prev + 5, 85))
        }, 100)

        const enriched = await enrichItemsWithPrice(items)

        clearInterval(progressInterval)
        setLoadingProgress(90)

        const sorted = [...enriched].sort((a, b) => {
          const profitA = a.craftingProfit?.profit ?? -Infinity
          const profitB = b.craftingProfit?.profit ?? -Infinity
          return profitB - profitA
        })

        setLoadingProgress(100)
        setItemsWithPrices(sorted)

        // Small delay to show 100%
        setTimeout(() => {
          setIsLoading(false)
        }, 300)
      } catch (error) {
        console.error('Error loading prices:', error)
        setIsLoading(false)
      }
    }

    loadPrices()
  }, [items, selectedServer]) // Add selectedServer to dependency array

  // Pagination calculations
  const totalPages = Math.ceil(itemsWithPrices.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentItems = itemsWithPrices.slice(startIndex, endIndex)

  // Pagination handlers
  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handlePrevPage = () => {
    if (currentPage > 1) goToPage(currentPage - 1)
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) goToPage(currentPage + 1)
  }

  // Generate page numbers
  const getPageNumbers = () => {
    const pages = []
    const maxPagesToShow = 7

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      pages.push(1)

      if (currentPage > 3) {
        pages.push('...')
      }

      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(i)
      }

      if (currentPage < totalPages - 2) {
        pages.push('...')
      }

      pages.push(totalPages)
    }

    return pages
  }

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

  // Loading State
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-6" />
        <p className="text-lg text-slate-300 mb-2">Loading items and calculating profits...</p>
        <p className="text-sm text-slate-400 mb-4">Processing {items.length} items</p>
        
        {/* Show current server */}
        <p className="text-xs text-slate-500 mb-6">
          Server: <span className="text-blue-400 font-medium">{selectedServer.toUpperCase()}</span>
        </p>
        
        {/* Progress Bar */}
        <div className="w-full max-w-md">
          <div className="bg-slate-800 rounded-full h-3 overflow-hidden border border-slate-700 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-300 ease-out relative overflow-hidden"
              style={{ width: `${loadingProgress}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
            </div>
          </div>
          <div className="flex justify-between mt-2 text-xs text-slate-500">
            <span>Processing...</span>
            <span>{loadingProgress}%</span>
          </div>
        </div>
      </div>
    )
  }

  // Empty State
  if (items.length === 0 || itemsWithPrices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 text-center max-w-md">
          <svg className="w-16 h-16 text-slate-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <h3 className="text-lg font-semibold text-white mb-2">No items found</h3>
          <p className="text-slate-400 text-sm">Try adjusting your filters or search terms</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Items Grid */}
      <div className="grid auto-rows-max gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {currentItems.map((item) => (
          <div
            key={item.UniqueName}
            onClick={() => onSelectItem(item)}
            className="cursor-pointer group"
          >
            <Card className="overflow-hidden bg-slate-800/50 border-slate-700 hover:border-slate-500 hover:shadow-xl hover:shadow-slate-900/50 transition-all duration-200 h-full flex flex-col">
              {/* Image Container with Tier Badge */}
              <div className="relative w-full h-48 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center overflow-hidden border-b border-slate-700">
                {/* Tier Badge */}
                <div className="absolute top-2 right-2 z-10">
                  <Badge className={`${getTierColor(item.UniqueName)} shadow-lg text-xs px-2 py-1`}>
                    @{getEnchantmentLevel(item.UniqueName)}
                  </Badge>
                </div>

                {!imageErrors.has(item.UniqueName) ? (
                  <Image
                    src={`https://render.albiononline.com/v1/item/${item.UniqueName}.png`}
                    alt={item['EN-US']}
                    width={140}
                    height={140}
                    className="object-contain p-4 group-hover:scale-110 transition-transform duration-200"
                    onError={() => handleImageError(item.UniqueName)}
                    crossOrigin="anonymous"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-700/50 flex items-center justify-center">
                    <span className="text-slate-500 text-sm">No Image</span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4 flex-1 flex flex-col gap-3">
                {/* Title Section */}
                <div>
                  <h3 className="text-sm font-bold text-white line-clamp-1 group-hover:text-blue-400 transition-colors">
                    {item['EN-US']}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {item.SlotType.charAt(0).toUpperCase() + item.SlotType.slice(1)}
                  </p>
                </div>

                {/* Stats Preview */}
                <div className="space-y-2 border-t border-slate-700 pt-3">
                  {/* Price */}
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400">Price:</span>
                    <span className="text-sm font-semibold text-white">
                      {item.price ? item.price.toLocaleString() : 'N/A'}
                    </span>
                  </div>

                  {/* Craft Cost */}
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400">Craft Cost:</span>
                    <span className="text-sm font-semibold text-red-400">
                      {item.craftingProfit?.totalCraftCost 
                        ? item.craftingProfit.totalCraftCost.toLocaleString() 
                        : 'N/A'}
                    </span>
                  </div>

                  {/* Profit */}
                  <div className="flex justify-between items-center pt-2 border-t border-slate-700/50">
                    <span className="text-xs font-medium text-slate-300">Profit:</span>
                    <span 
                      className={`text-sm font-bold ${
                        item.craftingProfit?.profit 
                          ? item.craftingProfit.profit >= 0 
                            ? 'text-green-400' 
                            : 'text-red-400'
                          : 'text-slate-500'
                      }`}
                    >
                      {item.craftingProfit?.profit 
                        ? `${item.craftingProfit.profit >= 0 ? '+' : ''}${item.craftingProfit.profit.toLocaleString()}`
                        : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            {/* Items Info */}
            <div className="text-sm text-slate-400">
              Showing <span className="font-semibold text-white">{startIndex + 1}</span> to{' '}
              <span className="font-semibold text-white">{Math.min(endIndex, itemsWithPrices.length)}</span> of{' '}
              <span className="font-semibold text-white">{itemsWithPrices.length}</span> items
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-2">
              {/* Previous Button */}
              <Button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                variant="outline"
                size="sm"
                className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              {/* Page Numbers */}
              <div className="flex items-center gap-1">
                {getPageNumbers().map((pageNum, idx) => (
                  pageNum === '...' ? (
                    <span key={`ellipsis-${idx}`} className="px-2 text-slate-500">
                      ...
                    </span>
                  ) : (
                    <Button
                      key={pageNum}
                      onClick={() => goToPage(pageNum)}
                      variant={currentPage === pageNum ? 'default' : 'outline'}
                      size="sm"
                      className={
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white hover:bg-blue-700 min-w-[2.5rem]'
                          : 'border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white min-w-[2.5rem]'
                      }
                    >
                      {pageNum}
                    </Button>
                  )
                ))}
              </div>

              {/* Next Button */}
              <Button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                variant="outline"
                size="sm"
                className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}