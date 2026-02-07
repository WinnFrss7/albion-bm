// app/page.jsx (Server Component - NO "use client")
import clientPromise from '@/lib/mongodb';
import ItemBrowser from '@/components/ItemBrowser';

async function getRecords() {
  const client = await clientPromise;
  const db = client.db('albion');
  const records = await db.collection('blackmarket').find({}).toArray();
  return JSON.parse(JSON.stringify(records));
}

export default async function Page() {
  const itemsData = await getRecords();
  
  return <ItemBrowser itemsData={itemsData} />;
}