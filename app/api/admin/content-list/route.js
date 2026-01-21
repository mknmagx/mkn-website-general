import { NextResponse } from "next/server";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Get all content from content library
export async function GET(req) {
  try {
    // Fetch content from contentTitles collection
    const contentQuery = query(
      collection(db, "contentTitles"),
      orderBy("createdAt", "desc"),
      limit(200)
    );
    
    const contentSnapshot = await getDocs(contentQuery);
    const contents = contentSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({
      success: true,
      contents,
    });
  } catch (error) {
    console.error("Content list fetch error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
