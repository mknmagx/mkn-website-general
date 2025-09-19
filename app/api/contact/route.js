import { NextResponse } from "next/server"

export async function POST(request) {
  try {
    const body = await request.json()
    const { name, email, phone, company, service, product, message } = body

    // Basic validation
    if (!name || !email || !message) {
      return NextResponse.json({ error: "Ad, e-posta ve mesaj alanları zorunludur." }, { status: 400 })
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Geçerli bir e-posta adresi giriniz." }, { status: 400 })
    }

    // Here you would typically:
    // 1. Save to database
    // 2. Send email notification
    // 3. Integrate with CRM

    // For now, we'll just log the form data
    console.log("Contact form submission:", {
      name,
      email,
      phone,
      company,
      service,
      product,
      message,
      timestamp: new Date().toISOString(),
    })

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return NextResponse.json(
      {
        success: true,
        message: "Mesajınız başarıyla gönderildi. En kısa sürede size dönüş yapacağız.",
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Contact form error:", error)
    return NextResponse.json({ error: "Sunucu hatası. Lütfen tekrar deneyin." }, { status: 500 })
  }
}
