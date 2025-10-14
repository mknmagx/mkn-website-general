// Basit state yönetimi için utility fonksiyonları

// URL parametrelerini parse et
export const parseURLParams = (searchParams) => {
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "all";
  const page = parseInt(searchParams.get("page")) || 1;
  const materials = searchParams.get("materials")
    ? searchParams.get("materials").split(",")
    : [];
  const sizes = searchParams.get("sizes")
    ? searchParams.get("sizes").split(",")
    : [];
  const colors = searchParams.get("colors")
    ? searchParams.get("colors").split(",")
    : [];

  return {
    search,
    category,
    page,
    materials,
    sizes,
    colors,
  };
};

// URL parametrelerini oluştur
export const createURLParams = (state) => {
  const params = new URLSearchParams();

  if (state.search) params.set("search", state.search);
  if (state.category !== "all") params.set("category", state.category);
  if (state.page > 1) params.set("page", state.page.toString());
  if (state.materials.length > 0)
    params.set("materials", state.materials.join(","));
  if (state.sizes.length > 0) params.set("sizes", state.sizes.join(","));
  if (state.colors.length > 0) params.set("colors", state.colors.join(","));

  return params.toString();
};

// Scroll pozisyonunu kaydet
export const saveScrollPosition = () => {
  if (typeof window !== "undefined") {
    sessionStorage.setItem("ambalaj-scroll", window.scrollY.toString());
  }
};

// Scroll pozisyonunu geri yükle
export const restoreScrollPosition = () => {
  if (typeof window !== "undefined") {
    const savedPosition = sessionStorage.getItem("ambalaj-scroll");
    if (savedPosition) {
      setTimeout(() => {
        window.scrollTo(0, parseInt(savedPosition));
        sessionStorage.removeItem("ambalaj-scroll");
      }, 100);
    }
  }
};
