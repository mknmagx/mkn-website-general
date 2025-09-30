import { NextResponse } from "next/server";
import {
  createContact,
  CONTACT_SOURCE,
} from "../../../lib/services/contacts-service";

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, phone, company, service, product, message } = body;

    // Basic validation
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Ad, e-posta ve mesaj alanları zorunludur." },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Geçerli bir e-posta adresi giriniz." },
        { status: 400 }
      );
    }

    try {
      // Firestore'a kaydet
      const contactData = {
        name,
        email,
        phone: phone || "",
        company: company || "",
        service: service || "",
        product: product || "",
        message,
        source: CONTACT_SOURCE.WEBSITE_CONTACT,
        // Varsayılan değerler service'de ayarlanacak
      };

      const contactId = await createContact(contactData);

      console.log("Contact saved to Firestore with ID:", contactId);

      return NextResponse.json(
        {
          success: true,
          message:
            "Mesajınız başarıyla gönderildi. En kısa sürede size dönüş yapacağız.",
          contactId: contactId,
        },
        { status: 200 }
      );
    } catch (dbError) {
      console.error("Database error:", dbError);
      // Database hatası olsa bile kullanıcıya success mesajı gösterebiliriz
      // Böylece kullanıcı deneyimi bozulmaz, arka planda log'larız
      return NextResponse.json(
        {
          success: true,
          message:
            "Mesajınız başarıyla gönderildi. En kısa sürede size dönüş yapacağız.",
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Sunucu hatası. Lütfen tekrar deneyin." },
      { status: 500 }
    );
  }
}
