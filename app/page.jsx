// app/page.jsx
import ItemBrowser from '@/components/ItemBrowser';

async function getRecords() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/blackmarket`,
    { cache: 'no-store' }
  );

  if (!res.ok) {
    throw new Error('Failed to fetch data');
  }

  return res.json();
}

export default async function Page() {
  const itemsData = await getRecords();
  return <ItemBrowser itemsData={itemsData} />;
}
