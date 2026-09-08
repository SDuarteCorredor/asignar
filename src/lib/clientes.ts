/**
 * Logos de clientes reales, con el nombre de la marca que muestra cada uno.
 *
 * Vive aquí y no dentro de un componente porque es la fuente de los nombres
 * (`altDeLogo`) y de la agrupación por sector (`SECTORES_CLIENTES`) que usan
 * el carrusel y el modal de clientes. Antes la grilla de servicios repetía
 * `alt="Cliente Asignar"` en los 63 logos —inútil para accesibilidad y para
 * búsqueda de imágenes— mientras el home ya tenía los nombres correctos.
 *
 * El `alt` es el nombre de la marca a secas, que es justo lo que comunica un
 * logo. No se le agrega "cliente de Asignar" a cada uno: el encabezado de la
 * sección ya da ese contexto y repetirlo 63 veces sería relleno de keywords.
 */
export type LogoCliente = { src: string; alt: string };

export const LOGOS_CLIENTES: LogoCliente[] = [
  { src: "/clientes-brand/nh-hotels-y-resorts.webp", alt: "NH Hotels & Resorts" },
  { src: "/clientes-brand/marriott.webp", alt: "Marriott" },
  { src: "/clientes-brand/nh-hotels-y-resorts-2.webp", alt: "NH Hotels & Resorts" },
  { src: "/clientes-brand/estelar.webp", alt: "Estelar" },
  { src: "/clientes-brand/grand-hyatt.webp", alt: "Grand Hyatt" },
  { src: "/clientes-brand/tequendama-hoteles.webp", alt: "Tequendama Hoteles" },
  { src: "/clientes-brand/atton-hoteles.webp", alt: "Atton Hoteles" },
  { src: "/clientes-brand/hilton-bogota.webp", alt: "Hilton Bogota" },
  { src: "/clientes-brand/dann-carlton-hotel-y-spa.webp", alt: "Dann Carlton Hotel & Spa" },
  { src: "/clientes-brand/hoteles-dann.webp", alt: "Hoteles Dann" },
  { src: "/clientes-brand/exe-hotels.webp", alt: "Exe Hotels" },
  { src: "/clientes-brand/ibis-hotels.webp", alt: "Ibis Hotels" },
  { src: "/clientes-brand/intercontinental-movich-medellin.webp", alt: "InterContinental Movich Medellin" },
  { src: "/clientes-brand/hoteles-spiwak.webp", alt: "Hoteles Spiwak" },
  { src: "/clientes-brand/movich-hotels.webp", alt: "Movich Hotels" },
  { src: "/clientes-brand/jw-marriott.webp", alt: "JW Marriott" },
  { src: "/clientes-brand/habitel-hotels.webp", alt: "Habitel Hotels" },
  { src: "/clientes-brand/hotel-caribe-cartagena.webp", alt: "Hotel Caribe Cartagena" },
  { src: "/clientes-brand/w-hotels.webp", alt: "W Hotels" },
  { src: "/clientes-brand/diez-hotel-categoria-colombia.webp", alt: "Diez Hotel Categoria Colombia" },
  { src: "/clientes-brand/hotel-spirito-by-spiwak.webp", alt: "Hotel Spirito by Spiwak" },
  { src: "/clientes-brand/lagoon-hotel-llanogrande.webp", alt: "Lagoon Hotel Llanogrande" },
  { src: "/clientes-brand/four-seasons-hotels-and-resorts.webp", alt: "Four Seasons Hotels and Resorts" },
  { src: "/clientes-brand/hotel-capital-ghl.webp", alt: "Hotel Capital GHL" },
  { src: "/clientes-brand/fairfield-by-marriott-medellin.webp", alt: "Fairfield by Marriott Medellin" },
  { src: "/clientes-brand/nh-collection.webp", alt: "NH Collection" },
  { src: "/clientes-brand/sonesta-hotels-and-resorts.webp", alt: "Sonesta Hotels and Resorts" },
  { src: "/clientes-brand/irotama-resort.webp", alt: "Irotama Resort" },
  { src: "/clientes-brand/accor.webp", alt: "Accor" },
  { src: "/clientes-brand/hotel-nutibara-medellin.webp", alt: "Hotel Nutibara Medellin" },
  { src: "/clientes-brand/the-charlee-hotels.webp", alt: "The Charlee Hotels" },
  { src: "/clientes-brand/the-brown-at-luxe.webp", alt: "The Brown at Luxe" },
  { src: "/clientes-brand/crowne-plaza-barranquilla.webp", alt: "Crowne Plaza Barranquilla" },
  { src: "/clientes-brand/tequendama-hotel-medellin.webp", alt: "Tequendama Hotel Medellin" },
  { src: "/clientes-brand/city-express-hoteles.webp", alt: "City Express Hoteles" },
  { src: "/clientes-brand/colsubsidio.webp", alt: "Colsubsidio" },
  { src: "/clientes-brand/corferias.webp", alt: "Corferias" },
  { src: "/clientes-brand/agora-bogota-centro-de-convenciones.webp", alt: "Agora Bogota Centro de Convenciones" },
  { src: "/clientes-brand/centro-de-eventos-valle-del-pacifico.webp", alt: "Centro de Eventos Valle del Pacifico" },
  { src: "/clientes-brand/centro-de-convenciones-cartagena-de-indias.webp", alt: "Centro de Convenciones Cartagena de Indias" },
  { src: "/clientes-brand/macarena-centro-de-negocios-y-eventos.webp", alt: "Macarena Centro de Negocios & Eventos" },
  { src: "/clientes-brand/d-groupe.webp", alt: "D'Groupe" },
  { src: "/clientes-brand/club-el-rodeo.webp", alt: "Club El Rodeo" },
  { src: "/clientes-brand/country-club-ejecutivos.webp", alt: "Country Club Ejecutivos" },
  { src: "/clientes-brand/club-campestre-pereira.webp", alt: "Club Campestre Pereira" },
  { src: "/clientes-brand/club-campestre-de-cali.webp", alt: "Club Campestre de Cali" },
  { src: "/clientes-brand/club-campestre-medellin-llanogrande.webp", alt: "Club Campestre Medellin Llanogrande" },
  { src: "/clientes-brand/casal-casa-alimenticia.webp", alt: "Casal Casa Alimenticia" },
  { src: "/clientes-brand/la-kasta-grill-y-wine.webp", alt: "La Kasta Grill & Wine" },
  { src: "/clientes-brand/mangiare-pizzeria-enoteca.webp", alt: "Mangiare Pizzeria Enoteca" },
  { src: "/clientes-brand/la-causa-marisqueria.webp", alt: "La Causa Marisqueria" },
  { src: "/clientes-brand/romero-cocina-artesanal.webp", alt: "Romero Cocina Artesanal" },
  { src: "/clientes-brand/izumi-asian-fusion.webp", alt: "Izumi Asian Fusion" },
  { src: "/clientes-brand/casa-soller-cocina-mediterranea.webp", alt: "Casa Soller Cocina Mediterranea" },
  { src: "/clientes-brand/jalo.webp", alt: "Jalo" },
  { src: "/clientes-brand/hashtag-98-hotel.webp", alt: "Hashtag 98 Hotel" },
  { src: "/clientes-brand/go-living-y-suites.webp", alt: "GO Living & Suites" },
  { src: "/clientes-brand/medicox.webp", alt: "Medicox" },
  { src: "/clientes-brand/superpack.webp", alt: "SuperPack" },
  { src: "/clientes-brand/fruta-fresca-origin.webp", alt: "Fruta Fresca Origin" },
  { src: "/clientes-brand/gesproyect.webp", alt: "Gesproyect" },
  { src: "/clientes-brand/rcd-project.webp", alt: "RCD Project" },
  { src: "/clientes-brand/industrias-mecanicas-dayo.webp", alt: "Industrias Mecanicas Dayo" },
];

const ALT_POR_SRC = new Map(LOGOS_CLIENTES.map((l) => [l.src, l.alt]));

/** Nombre de la marca de un logo. Si el archivo no está en la lista, cae en un
 *  texto genérico en vez de dejar la imagen sin nombre accesible. */
export function altDeLogo(src: string): string {
  return ALT_POR_SRC.get(src) ?? "Cliente de Asignar SAS";
}

/** Un sector de clientes con sus logos ya resueltos a `{ src, alt }`. */
export type SectorClientes = { nombre: string; logos: LogoCliente[] };

const sector = (nombre: string, srcs: string[]): SectorClientes => ({
  nombre,
  logos: srcs.map((src) => ({ src, alt: altDeLogo(src) })),
});

/**
 * Los mismos clientes del marquee, agrupados por el sector al que pertenecen.
 *
 * Vive aquí —y no en `/servicios`— porque ahora lo consumen el carrusel del
 * Home, el de `/servicios` y el modal de "todos los clientes". Son 62 y no 63
 * porque la variante alterna del logo de NH solo tiene sentido en el marquee,
 * donde repetir una marca pasa desapercibido; en una grilla organizada por
 * sector saldría dos veces la misma empresa.
 */
export const SECTORES_CLIENTES: SectorClientes[] = [
  sector("Sector Hotelero", [
    "/clientes-brand/nh-hotels-y-resorts.webp", "/clientes-brand/marriott.webp",
    "/clientes-brand/estelar.webp", "/clientes-brand/grand-hyatt.webp",
    "/clientes-brand/tequendama-hoteles.webp", "/clientes-brand/atton-hoteles.webp",
    "/clientes-brand/hilton-bogota.webp", "/clientes-brand/dann-carlton-hotel-y-spa.webp",
    "/clientes-brand/hoteles-dann.webp", "/clientes-brand/exe-hotels.webp",
    "/clientes-brand/ibis-hotels.webp", "/clientes-brand/intercontinental-movich-medellin.webp",
    "/clientes-brand/hoteles-spiwak.webp", "/clientes-brand/movich-hotels.webp",
    "/clientes-brand/jw-marriott.webp", "/clientes-brand/habitel-hotels.webp",
    "/clientes-brand/hotel-caribe-cartagena.webp", "/clientes-brand/w-hotels.webp",
    "/clientes-brand/diez-hotel-categoria-colombia.webp", "/clientes-brand/hotel-spirito-by-spiwak.webp",
    "/clientes-brand/lagoon-hotel-llanogrande.webp", "/clientes-brand/four-seasons-hotels-and-resorts.webp",
    "/clientes-brand/hotel-capital-ghl.webp", "/clientes-brand/fairfield-by-marriott-medellin.webp",
    "/clientes-brand/nh-collection.webp", "/clientes-brand/sonesta-hotels-and-resorts.webp",
    "/clientes-brand/irotama-resort.webp", "/clientes-brand/accor.webp",
    "/clientes-brand/hotel-nutibara-medellin.webp", "/clientes-brand/the-charlee-hotels.webp",
    "/clientes-brand/the-brown-at-luxe.webp", "/clientes-brand/crowne-plaza-barranquilla.webp",
    "/clientes-brand/tequendama-hotel-medellin.webp", "/clientes-brand/city-express-hoteles.webp",
  ]),
  sector("Centros de eventos", [
    "/clientes-brand/colsubsidio.webp", "/clientes-brand/corferias.webp",
    "/clientes-brand/agora-bogota-centro-de-convenciones.webp", "/clientes-brand/centro-de-eventos-valle-del-pacifico.webp",
    "/clientes-brand/centro-de-convenciones-cartagena-de-indias.webp", "/clientes-brand/macarena-centro-de-negocios-y-eventos.webp",
    "/clientes-brand/d-groupe.webp",
  ]),
  sector("Clubes", [
    "/clientes-brand/club-el-rodeo.webp", "/clientes-brand/country-club-ejecutivos.webp",
    "/clientes-brand/club-campestre-pereira.webp", "/clientes-brand/club-campestre-de-cali.webp",
    "/clientes-brand/club-campestre-medellin-llanogrande.webp",
  ]),
  sector("Restaurantes", [
    "/clientes-brand/casal-casa-alimenticia.webp", "/clientes-brand/la-kasta-grill-y-wine.webp",
    "/clientes-brand/mangiare-pizzeria-enoteca.webp", "/clientes-brand/la-causa-marisqueria.webp",
    "/clientes-brand/romero-cocina-artesanal.webp", "/clientes-brand/izumi-asian-fusion.webp",
    "/clientes-brand/casa-soller-cocina-mediterranea.webp",
  ]),
  sector("Sector Inmobiliario", [
    "/clientes-brand/jalo.webp", "/clientes-brand/hashtag-98-hotel.webp",
    "/clientes-brand/go-living-y-suites.webp",
  ]),
  sector("Industria, Producción, Retail y Servicios", [
    "/clientes-brand/medicox.webp", "/clientes-brand/superpack.webp",
    "/clientes-brand/fruta-fresca-origin.webp", "/clientes-brand/gesproyect.webp",
    "/clientes-brand/rcd-project.webp", "/clientes-brand/industrias-mecanicas-dayo.webp",
  ]),
];
