import ClientesShowcase from "@/components/clientes/ClientesShowcase";

export default function ClientLogos() {
  return (
    <section className="py-14 md:py-20 bg-white overflow-hidden">
      <p className="text-center font-[var(--font-ui)] text-xs font-semibold uppercase tracking-[0.12em] text-text-muted mb-10">
        Empresas que confían en nosotros
      </p>
      <ClientesShowcase />
    </section>
  );
}
