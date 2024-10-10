import { db } from '@/firebase/firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import { checkAdmin } from '@/middleware/checkAdmin';

export async function GET(req) {
  // admin check middleware
  const adminCheckResponse = await checkAdmin(req, () => {})

  if (adminCheckResponse) {
    return adminCheckResponse
  }

  try {
    const placesCollection = collection(db, 'places');
    const placesSnapshot = await getDocs(placesCollection);
    const places = placesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    return new Response(JSON.stringify(places), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error fetching places:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch places' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
