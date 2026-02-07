export function calculateCraftingProfit(item, returnRate = 0.248) {
  // If item itself has no price, stop
  if (!item?.price || item.price <= 0) {
    return null;
  }

  let totalCost = 0;
  let returnBaseCost = 0;

  const resources = item?.CraftingRequirements?.craftresource;
  if (!Array.isArray(resources) || resources.length === 0) {
    return null;
  }

  // ===============================
  // 1. Validate ALL resource prices
  // ===============================
  for (const cr of resources) {
    const price = cr.price;

    if (
      price === null ||
      price === undefined ||
      price === "N/A" ||
      Number(price) <= 0 ||
      Number.isNaN(Number(price))
    ) {
      // Invalidate entire calculation
      return {
        itemName: item.UniqueName,
        itemPrice: item.price,
        totalCraftCost: null,
        returnValue: null,
        marketTax: null,
        profit: null
      };
    }
  }

  // ===============================
  // 2. Calculate costs
  // ===============================
  for (const cr of resources) {
    const count = Number(cr["@count"] || 1);
    const price = Number(cr.price);

    const cost = price * count;
    totalCost += cost;

    // artefact TIDAK ikut return
    const isArtefact = cr["@maxreturnamount"] === "0";
    if (!isArtefact) {
      returnBaseCost += cost;
    }
  }

  // ===============================
  // 3. Calculate return, tax & profit
  // ===============================
  const returnValue = returnBaseCost * returnRate;
  const marketTax = item.price * 0.10;
  const profit = item.price - totalCost + returnValue - marketTax;

  return {
    itemName: item.UniqueName,
    itemPrice: item.price,
    totalCraftCost: Math.round(totalCost),
    returnValue: Math.round(returnValue),
    marketTax: Math.round(marketTax),
    profit: Math.round(profit)
  };
}