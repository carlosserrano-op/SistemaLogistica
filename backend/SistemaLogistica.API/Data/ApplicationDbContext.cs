using Microsoft.EntityFrameworkCore;
using SistemaLogistica.API.Models;

namespace SistemaLogistica.API.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        public DbSet<Paquete> Paquetes => Set<Paquete>();
        public DbSet<Repartidor> Repartidores => Set<Repartidor>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Forzar precisión decimal exacta para evitar flotantes imprecisos
            modelBuilder.Entity<Paquete>().Property(p => p.PesoKg).HasPrecision(10, 2);
            modelBuilder.Entity<Repartidor>().Property(r => r.CapacidadMaximaKg).HasPrecision(10, 2);
            modelBuilder.Entity<Repartidor>().Property(r => r.CapacidadDisponibleKg).HasPrecision(10, 2);

            base.OnModelCreating(modelBuilder);
        }
    }
}
