/**
 * seed-products.ts — inserta 100 productos de demo realistas.
 * Uso: DATABASE_URL=... tsx src/scripts/seed-products.ts
 * Idempotente: ignora conflictos de SKU.
 */

import "dotenv/config";
import { closeDb, getDb } from "../adapters/db.js";
import { products } from "../db/schema/index.js";

// ─── Catálogos ──────────────────────────────────────────────────────────────

type Category = {
  prefix: string;
  names: string[];
  priceRange: [number, number];
  descFn: (name: string) => string;
};

const categories: Category[] = [
  {
    prefix: "ELEC",
    names: [
      "Monitor UHD 27\"", "Teclado Mecánico RGB", "Mouse Inalámbrico Pro",
      "Webcam 4K", "Auriculares Noise-Cancelling", "Hub USB-C 10 en 1",
      "SSD NVMe 1TB", "RAM DDR5 32GB", "Tarjeta Gráfica RTX", "Disco Externo 2TB",
      "Router Wi-Fi 6E", "Switch de Red 24 puertos", "UPS 1500VA",
      "Tarjeta de Sonido Externa", "Capturadora de Video HDMI",
      "Controlador MIDI 49 teclas", "Micrófono de Condensador", "Cámara IP 360°",
      "Proyector Full HD 3500 lúmenes", "Impresora Láser Color",
    ],
    priceRange: [29.99, 1499.99],
    descFn: (n) =>
      `${n} — alto rendimiento para profesionales. Garantía de 2 años. Incluye accesorios y cable de alimentación.`,
  },
  {
    prefix: "MOB",
    names: [
      "Smartphone Flagship 6.7\"", "Tablet Pro 12.9\"", "Smartwatch AMOLED",
      "Auriculares TWS", "Cargador Inalámbrico 65W", "Power Bank 20000mAh",
      "Funda Protectora MagSafe", "Soporte Magnético Auto",
      "Cable USB-C a Lightning 2m", "Adaptador HDMI Lightning",
      "Stylus Activo 4096 niveles", "Teclado Bluetooth Plegable",
    ],
    priceRange: [9.99, 899.99],
    descFn: (n) =>
      `${n} — compatible con los principales ecosistemas móviles. Diseño ergonómico y materiales premium.`,
  },
  {
    prefix: "HOG",
    names: [
      "Aspiradora Robot con Mapa", "Cafetera Espresso Automática",
      "Licuadora de Alta Potencia", "Freidora de Aire 5.5L",
      "Purificador de Aire HEPA", "Humidificador Ultrasónico",
      "Báscula Digital de Cocina", "Tostadora 4 ranuras",
      "Hervidor Eléctrico 1.7L", "Sandwichera Doble",
      "Robot de Cocina 1200W", "Exprimidor Automático",
      "Máquina de Palomitas", "Yogurtera Automática",
    ],
    priceRange: [14.99, 499.99],
    descFn: (n) =>
      `${n} — eficiencia energética clase A. Materiales libres de BPA. Fácil limpieza y mantenimiento.`,
  },
  {
    prefix: "OFI",
    names: [
      "Silla Ergonómica Lumbar", "Escritorio Standing Eléctrico",
      "Monitor Arm Doble", "Alfombrilla XXL con Carga",
      "Organizador de Cables Magnético", "Lámpara LED Escritorio",
      "Reposapiés Ajustable", "Soporte Laptop Aluminio",
      "Pizarra Magnética 90x60", "Archivador Metal 4 cajones",
      "Calculadora Científica", "Tijeras de Precisión",
      "Grapadora Eléctrica", "Cinta Adhesiva Dispensador",
    ],
    priceRange: [4.99, 799.99],
    descFn: (n) =>
      `${n} — diseñado para largas jornadas de trabajo. Mejora tu productividad y bienestar en el espacio de trabajo.`,
  },
  {
    prefix: "DEP",
    names: [
      "Bicicleta Estática Smart", "Cuerda de Saltar Digital",
      "Mancuernas Ajustables 40kg", "Banda de Resistencia Set",
      "Colchoneta Yoga Antideslizante", "Pesas Rusas 16kg",
      "Guantes de Boxeo Pro", "Rodillo de Espuma Vibrador",
      "Pulsómetro Deportivo", "Cinturón Lumbar Levantamiento",
      "Zapatillas Running Trail", "Mochila Hidratación 15L",
    ],
    priceRange: [12.99, 699.99],
    descFn: (n) =>
      `${n} — para atletas de todos los niveles. Material transpirable y duradero. Apto para uso intensivo.`,
  },
];

// ─── Generador ───────────────────────────────────────────────────────────────

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function randomInt(min: number, max: number) {
  return Math.floor(randomBetween(min, max + 1));
}

function pad(n: number, len = 4) {
  return String(n).padStart(len, "0");
}

function buildProducts() {
  const rows: {
    sku: string;
    name: string;
    description: string;
    price: string;
    stock: number;
    minStock: number;
  }[] = [];

  let globalIdx = 1;

  for (const cat of categories) {
    const [minP, maxP] = cat.priceRange;
    for (let i = 0; i < cat.names.length && rows.length < 100; i++) {
      const name = cat.names[i];
      const sku = `${cat.prefix}-${pad(globalIdx)}`;
      const price = randomBetween(minP, maxP).toFixed(2);
      const stock = randomInt(0, 200);
      const minStock = randomInt(5, 30);

      rows.push({
        sku,
        name,
        description: cat.descFn(name),
        price,
        stock,
        minStock,
      });

      globalIdx++;
    }
  }

  // rellenar hasta 100 si los catálogos son menos
  while (rows.length < 100) {
    const sku = `MISC-${pad(globalIdx)}`;
    rows.push({
      sku,
      name: `Producto Genérico ${globalIdx}`,
      description: `Artículo de uso general. Referencia: ${sku}.`,
      price: randomBetween(5, 250).toFixed(2),
      stock: randomInt(10, 100),
      minStock: 5,
    });
    globalIdx++;
  }

  return rows;
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const db = getDb();
  const rows = buildProducts();
  console.log(`Insertando ${rows.length} productos…`);

  let inserted = 0;
  let skipped = 0;

  for (const row of rows) {
    try {
      await db.insert(products).values(row);
      inserted++;
    } catch (err: any) {
      // 23505 = unique_violation (SKU duplicado — idempotencia)
      if (err?.code === "23505") {
        skipped++;
      } else {
        throw err;
      }
    }
  }

  console.log(`✓ ${inserted} insertados, ${skipped} omitidos (SKU duplicado)`);
  await closeDb();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});