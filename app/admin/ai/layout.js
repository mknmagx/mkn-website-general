export default function AILayout({ children }) {
  // Admin navigation zaten admin/layout.js'de render ediliyor
  // Burada full-height layout için container oluşturuyoruz
  return <div className="h-full">{children}</div>;
}
