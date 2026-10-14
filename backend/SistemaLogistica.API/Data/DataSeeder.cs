using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using SistemaLogistica.API.Data;
using SistemaLogistica.API.Models;
using System.Linq;

namespace SistemaLogistica.API.Data
{
    public static class DataSeeder
    {
        public static void Seed(IApplicationBuilder app)
        {
            using var serviceScope = app.ApplicationServices.GetRequiredService<IServiceScopeFactory>().CreateScope();
            var context = serviceScope.ServiceProvider.GetService<ApplicationDbContext>();

            if (context == null) return;

            // Asegurar que la base de datos esté creada
            context.Database.EnsureCreated();

            // Insertar Repartidores si la tabla está vacía
            if (!context.Repartidores.Any())
            {
                context.Repartidores.AddRange(
                    new Repartidor { Id = "R001", Nombre = "Carlos Mendoza", CapacidadMaximaKg = 100.00M, CapacidadDisponibleKg = 100.00M },
                    new Repartidor { Id = "R002", Nombre = "Ana Gómez", CapacidadMaximaKg = 50.00M, CapacidadDisponibleKg = 50.00M },
                    new Repartidor { Id = "R003", Nombre = "Luis Torres", CapacidadMaximaKg = 80.00M, CapacidadDisponibleKg = 80.00M }
                );
                context.SaveChanges();
            }

            // Insertar Paquetes si la tabla está vacía
            if (!context.Paquetes.Any())
            {
                context.Paquetes.AddRange(
                    new Paquete { Id = "P001", Destino = "Zona Centro, Av. Juárez 405", PesoKg = 15.50M, Estado = "Pendiente" },
                    new Paquete { Id = "P002", Destino = "Norte, Col. Altavista Calle 3", PesoKg = 45.00M, Estado = "Pendiente" },
                    new Paquete { Id = "P003", Destino = "Sur, Plaza Las Torres Local 12", PesoKg = 60.00M, Estado = "Pendiente" },
                    new Paquete { Id = "P004", Destino = "Sector Industrial Bodega 8B", PesoKg = 8.20M, Estado = "Pendiente" }
                );
                context.SaveChanges();
            }
        }
    }
}
