export function ClientLogos() {
  // Placeholder client logos - these would be replaced with actual client logos
  const clients = [
    { name: "Müşteri 1", logo: "/corporate-logo-1.png" },
    { name: "Müşteri 2", logo: "/corporate-logo-2.png" },
    { name: "Müşteri 3", logo: "/corporate-logo-3.png" },
    { name: "Müşteri 4", logo: "/corporate-logo-4.png" },
    { name: "Müşteri 5", logo: "/corporate-logo-5.png" },
    { name: "Müşteri 6", logo: "/corporate-logo-6.png" },
  ];

  return (
    <section className="py-16 bg-background dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Güvenilen İş Ortağınız
          </h2>
          <p className="text-muted-foreground">
            Birçok başarılı markanın tercih ettiği{" "}
            <span className="font-montserrat font-semibold">MKNGROUP</span> ile
            tanışın.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center">
          {clients.map((client, index) => (
            <div
              key={index}
              className="flex items-center justify-center p-4 rounded-lg bg-muted/30 dark:bg-gray-800/50 hover:bg-muted/50 dark:hover:bg-gray-700/50 transition-colors border border-transparent dark:border-gray-700/50"
            >
              <img
                src={client.logo || "/placeholder.svg"}
                alt={`${client.name} logosu`}
                className="max-h-12 w-auto opacity-60 hover:opacity-100 transition-opacity dark:filter dark:brightness-90 dark:hover:brightness-110"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
