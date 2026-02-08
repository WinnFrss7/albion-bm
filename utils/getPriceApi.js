import { calculateCraftingProfit } from "./calculateCraftingProfit";

export async function enrichItemsWithPrice(items, returnRate = 0.248) {
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
    fetchPricesBatched([...itemIds], "Blackmarket", true),
    fetchPricesBatched([...materialIds], "Fortsterling")
  ]);

  const priceMap = {};
  [...itemPrices, ...materialPrices].forEach(p => {
    priceMap[p.item_id] = calculateAveragePrice(p.data);
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



async function fetchPricesBatched(itemIds, location, useQuality = false, batchSize = 80) {
  const batches = chunkArray(itemIds, batchSize);
  const results = [];

  for (const batch of batches) {
    const res = await fetchPrices(batch, location, useQuality);
    results.push(...res);
  }

  return results;
}



async function fetchPrices(itemIds, location, useQuality = false) {
  let quality = useQuality ? "&qualities=2" : "";
  const baseUrl = "https://europe.albion-online-data.com/api/v2/stats/history";
  const itemsParam = itemIds.join(",");
  const url = `${baseUrl}/${itemsParam}?locations=${location}${quality}&time-scale=24`;

  const res = await fetch(url);
  return res.json();
}


function calculateAveragePrice(historyData) {
  if (!historyData || historyData.length === 0) return null;

  const lastFive = historyData.slice(-5);
  const sum = lastFive.reduce((acc, d) => acc + d.avg_price, 0);
  return Math.round(sum / lastFive.length);
}