using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace SistemaLogistica.API.Models
{
    public class Repartidor
    {
        [Key] // Le dice a .NET que este es el campo PRIMARY KEY
        public string Id { get; set; } = string.Empty;

        [Required]
        public string Nombre { get; set; } = string.Empty;

        // Usamos decimal para que coincida perfectamente con el DECIMAL(10,2) de SQL
        public decimal CapacidadMaximaKg { get; set; }
        public decimal CapacidadDisponibleKg { get; set; }

        // Relación: Un repartidor puede tener una lista de paquetes asignados
        public ICollection<Paquete> Paquetes { get; set; } = new List<Paquete>();

        // 🔥 ESTE ES EL SECRETO PARA EL RETO DE CONCURRENCIA:
        // El atributo [Timestamp] mapea la columna RowVersion de SQL.
        // Si dos operadores intentan modificar al mismo repartidor al mismo tiempo,
        // Entity Framework comparará este campo automáticamente y bloqueará al segundo operador.
        [Timestamp]
        public byte[] RowVersion { get; set; } = Array.Empty<byte>();
    }

    public class Paquete
    {
        [Key] // PRIMARY KEY de los paquetes
        public string Id { get; set; } = string.Empty;

        [Required]
        public string Destino { get; set; } = string.Empty;

        public decimal PesoKg { get; set; }

        [Required]
        public string Estado { get; set; } = "Pendiente"; // Puede ser: Pendiente o Asignado

        // 🔗 Integridad Referencial (Llave foránea)
        // Al inicio es NULL porque el paquete no tiene repartidor asignado.
        public string? RepartidorId { get; set; }
        public Repartidor? Repartidor { get; set; }
    }

    // Esta clase extra nos servirá para recibir los datos de asignación desde React
    public class AsignacionRequest
    {
        [Required]
        public string PaqueteId { get; set; } = string.Empty;
        [Required]
        public string RepartidorId { get; set; } = string.Empty;
    }
}
