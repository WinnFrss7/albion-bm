import { calculateCraftingProfit } from "./calculateCraftingProfit";
import { useServerStore } from "@/stores/useServerStore";

export async function enrichItemsWithPrice(items, returnRate = 0.248, serverOverride = null) {
  // Get server from store if not overridden
  const server = serverOverride || useServerStore.getState().selectedServer;
  
  const itemIds = new Set();
  const materialIds = new Set();
  
  items.forEach(item => {
    itemIds.add(item.UniqueName);
    const resources = normalizeToArray(item.CraftingRequirements?.craftresource);
    resources.forEach(cr => {
      materialIds.add(cr["@uniquename"]);
    });
  });
  
  const [itemPrices, materialPrices] = await Promise.all([
    fetchPricesBatched([...itemIds], "Blackmarket", true, server),
    fetchPricesBatched([...materialIds], "Fortsterling", false, server)
  ]);
  
  const priceMap = {};
  
  // For items (from Black Market with quality 2)
  // API returns array where each element has quality and data properties
  itemPrices.forEach(p => {
    if (p.quality === 2) {
      priceMap[p.item_id] = calculateAveragePrice(p.data);
    }
  });
  
  // For materials (from Fort Sterling)
  // Group by item_id and select quality 1 or 2 (prefer quality 1 as it's cheaper)
  const materialsByItemId = {};
  materialPrices.forEach(p => {
    if (!materialsByItemId[p.item_id]) {
      materialsByItemId[p.item_id] = [];
    }
    materialsByItemId[p.item_id].push(p);
  });
  
  // For each material, find the best quality to use (1 or 2, prefer 1)
  Object.entries(materialsByItemId).forEach(([itemId, qualityData]) => {
    // Try quality 1 first (cheapest)
    const quality1 = qualityData.find(q => q.quality === 1);
    if (quality1 && quality1.data && quality1.data.length > 0) {
      priceMap[itemId] = calculateAveragePrice(quality1.data);
      return;
    }
    
    // Fall back to quality 2
    const quality2 = qualityData.find(q => q.quality === 2);
    if (quality2 && quality2.data && quality2.data.length > 0) {
      priceMap[itemId] = calculateAveragePrice(quality2.data);
      return;
    }
    
    // If neither quality 1 nor 2 exists, don't set a price (will default to 0)
    console.warn(`No quality 1 or 2 data for material: ${itemId}`);
  });
  
  
  return items.map(item => {
    const resources = normalizeToArray(item.CraftingRequirements?.craftresource);
    const enrichedItem = {
      ...item,
      price: priceMap[item.UniqueName] || 0,
      CraftingRequirements: {
        ...item.CraftingRequirements,
        craftresource: resources.map(cr => ({
          ...cr,
          price: priceMap[cr["@uniquename"]] || 0
        }))
      }
    };
    
    return {
      ...enrichedItem,
      craftingProfit: calculateCraftingProfit(enrichedItem, returnRate)
    };
  });
}

function chunkArray(arr, size) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

function normalizeToArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

async function fetchPricesBatched(itemIds, location, useQuality = false, server = 'europe', batchSize = 80) {
  const batches = chunkArray(itemIds, batchSize);
  const results = [];
  
  for (const batch of batches) {
    const res = await fetchPrices(batch, location, useQuality, server);
    results.push(...res);
  }
  
  return results;
}

async function fetchPrices(itemIds, location, useQuality = false, server = 'europe') {
  let quality = useQuality ? "&qualities=2" : "";
  const baseUrl = `https://${server}.albion-online-data.com/api/v2/stats/history`;
  const itemsParam = itemIds.join(",");
  const url = `${baseUrl}/${itemsParam}?locations=${location}${quality}&time-scale=6`;

  const res = await fetch(url);
  return res.json();
}

function calculateAveragePrice(historyData) {
  if (!historyData || historyData.length === 0) return null;
  
  const lastFive = historyData.slice(-3);
  const sum = lastFive.reduce((acc, d) => acc + d.avg_price, 0);
  return Math.round(sum / lastFive.length);
}