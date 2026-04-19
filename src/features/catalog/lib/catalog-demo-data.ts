import type { CatalogSeed } from "@/features/catalog/types";

export const catalogDemoData: CatalogSeed = {
  categories: [
    {
      id: "cat-keyboards",
      name: "Keyboards",
      slug: "keyboards",
      isActive: true,
    },
    { id: "cat-audio", name: "Audio", slug: "audio", isActive: true },
    {
      id: "cat-accessories",
      name: "Accessories",
      slug: "accessories",
      isActive: true,
    },
    {
      id: "cat-streaming",
      name: "Streaming",
      slug: "streaming",
      isActive: true,
    },
  ],
  sellers: [
    {
      id: "seller-northforge",
      storeName: "Northforge Supply",
      slug: "northforge-supply",
      status: "approved",
    },
    {
      id: "seller-lumen",
      storeName: "Lumen Audio",
      slug: "lumen-audio",
      status: "approved",
    },
    {
      id: "seller-cinder",
      storeName: "Cinder Studio",
      slug: "cinder-studio",
      status: "approved",
    },
    {
      id: "seller-holding",
      storeName: "Pending Seller",
      slug: "pending-seller",
      status: "pending",
    },
  ],
  products: [
    {
      id: "prod-aurora75",
      sellerId: "seller-northforge",
      categoryId: "cat-keyboards",
      title: "Aurora 75 Mechanical Keyboard",
      slug: "aurora-75-mechanical-keyboard",
      description:
        "A compact aluminum keyboard with gasket mounting, hot-swappable switches, and warm backlighting tuned for long work sessions.",
      shortDescription:
        "Compact 75% keyboard with aluminum body and hot-swappable switches.",
      priceAmount: 189,
      currencyCode: "USD",
      status: "active",
      thumbnailUrl: "/catalog/keyboard.svg",
      images: [
        {
          url: "/catalog/keyboard.svg",
          alt: "Aurora 75 mechanical keyboard preview",
        },
      ],
      publishedAt: "2026-04-12T10:00:00.000Z",
    },
    {
      id: "prod-halo-x",
      sellerId: "seller-lumen",
      categoryId: "cat-audio",
      title: "Halo X Wireless Headset",
      slug: "halo-x-wireless-headset",
      description:
        "Low-latency wireless headset with cushioned memory-foam cups, detachable boom mic, and balanced tuning for voice and game audio.",
      shortDescription:
        "Wireless over-ear headset designed for clean voice pickup and long sessions.",
      priceAmount: 149,
      currencyCode: "USD",
      status: "active",
      thumbnailUrl: "/catalog/headset.svg",
      images: [
        {
          url: "/catalog/headset.svg",
          alt: "Halo X wireless headset preview",
        },
      ],
      publishedAt: "2026-04-11T09:30:00.000Z",
    },
    {
      id: "prod-vector-pro",
      sellerId: "seller-cinder",
      categoryId: "cat-accessories",
      title: "Vector Pro Wireless Mouse",
      slug: "vector-pro-wireless-mouse",
      description:
        "Ergonomic wireless mouse with lightweight shell, precise optical sensor, and a charging dock that keeps the desk footprint clean.",
      shortDescription:
        "Lightweight wireless mouse with a precise sensor and charging dock.",
      priceAmount: 99,
      currencyCode: "USD",
      status: "active",
      thumbnailUrl: "/catalog/mouse.svg",
      images: [
        {
          url: "/catalog/mouse.svg",
          alt: "Vector Pro wireless mouse preview",
        },
      ],
      publishedAt: "2026-04-10T16:45:00.000Z",
    },
    {
      id: "prod-arc-notebook",
      sellerId: "seller-cinder",
      categoryId: "cat-accessories",
      title: "Arc Creator Notebook",
      slug: "arc-creator-notebook",
      description:
        "A premium planning notebook for creators with a durable cover, structured project pages, and room for quick product sketching.",
      shortDescription:
        "Premium planning notebook with structured layouts for creators.",
      priceAmount: 32,
      currencyCode: "USD",
      status: "active",
      thumbnailUrl: "/catalog/notebook.svg",
      images: [
        { url: "/catalog/notebook.svg", alt: "Arc Creator notebook preview" },
      ],
      publishedAt: "2026-04-09T12:00:00.000Z",
    },
    {
      id: "prod-studio-cam",
      sellerId: "seller-lumen",
      categoryId: "cat-streaming",
      title: "Studio Beam Webcam",
      slug: "studio-beam-webcam",
      description:
        "1080p webcam with a privacy shutter, adjustable field of view, and warm color profile suited for storefront and streaming setups.",
      shortDescription:
        "1080p webcam with privacy shutter and adjustable field of view.",
      priceAmount: 119,
      currencyCode: "USD",
      status: "active",
      thumbnailUrl: "/catalog/webcam.svg",
      images: [
        { url: "/catalog/webcam.svg", alt: "Studio Beam webcam preview" },
      ],
      publishedAt: "2026-04-08T08:15:00.000Z",
    },
    {
      id: "prod-hidden-draft",
      sellerId: "seller-northforge",
      categoryId: "cat-keyboards",
      title: "Prototype Switch Tester",
      slug: "prototype-switch-tester",
      description:
        "Draft catalog item used to validate hidden product behavior.",
      shortDescription: "Draft-only internal catalog item.",
      priceAmount: 24,
      currencyCode: "USD",
      status: "draft",
      thumbnailUrl: "/catalog/keyboard.svg",
      images: [],
      publishedAt: null,
    },
    {
      id: "prod-hidden-pending",
      sellerId: "seller-holding",
      categoryId: "cat-streaming",
      title: "Unapproved Seller Camera Kit",
      slug: "unapproved-seller-camera-kit",
      description: "Pending seller product should not appear publicly.",
      shortDescription: "Hidden while seller approval is pending.",
      priceAmount: 89,
      currencyCode: "USD",
      status: "active",
      thumbnailUrl: "/catalog/webcam.svg",
      images: [],
      publishedAt: "2026-04-13T14:00:00.000Z",
    },
  ],
};
