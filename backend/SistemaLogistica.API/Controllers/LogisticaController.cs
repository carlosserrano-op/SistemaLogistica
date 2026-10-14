using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SistemaLogistica.API.Data;
using SistemaLogistica.API.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SistemaLogistica.API.Controllers
{
    [ApiController]
    [Route("api/dispatch/v1")]
    public class LogisticaController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        public LogisticaController(ApplicationDbContext context)
        {
            _context = context;
        }

        // POST /api/dispatch/v1/assign
        [HttpPost("assign")]
        public async Task<IActionResult> AssignPackage([FromBody] AsignacionRequest request)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            using var transaction = _context.Database.IsInMemory() 
                ? null 
                : await _context.Database.BeginTransactionAsync();

            try
            {
                var paquete = await _context.Paquetes.FirstOrDefaultAsync(p => p.Id == request.PaqueteId && p.Estado == "Pendiente");
                var repartidor = await _context.Repartidores.FirstOrDefaultAsync(r => r.Id == request.RepartidorId);

                if (paquete == null)
                    return NotFound(new { error = "El paquete ya no está disponible o no existe." });

                if (repartidor == null)
                    return NotFound(new { error = "El repartidor seleccionado no existe." });

                // capacidad de carga
                if (repartidor.CapacidadDisponibleKg < paquete.PesoKg)
                    return BadRequest(new { error = $"Capacidad insuficiente. El paquete pesa {paquete.PesoKg}kg pero el repartidor solo tiene libre {repartidor.CapacidadDisponibleKg}kg." });

                repartidor.CapacidadDisponibleKg -= paquete.PesoKg;
                paquete.Estado = "Asignado";
                paquete.RepartidorId = repartidor.Id;

                await _context.SaveChangesAsync();

                if (transaction != null)
                {
                    await transaction.CommitAsync();
                }

                return Ok(new { mensaje = "Asignación exitosa.", nuevaCapacidad = repartidor.CapacidadDisponibleKg });
            }
            catch (DbUpdateConcurrencyException)
            {
                if (transaction != null) await transaction.RollbackAsync();
                return StatusCode(409, new { error = "Conflicto de Concurrencia: Otro operador asignó un paquete a este repartidor en este preciso instante. Por favor, recarga la pantalla." });
            }
            catch (Exception ex)
            {
                if (transaction != null) await transaction.RollbackAsync();
                return StatusCode(500, new { error = "Error interno en el servidor logístico.", detalle = ex.Message });
            }
        }
        [HttpPost("packages")]
        public async Task<IActionResult> CrearPaquete([FromBody] Paquete nuevoPaquete)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            // Validar si el ID ya existe para evitar duplicados
            var existe = await _context.Paquetes.AnyAsync(p => p.Id == nuevoPaquete.Id);
            if (existe) return BadRequest(new { error = $"El código de paquete {nuevoPaquete.Id} ya está registrado." });

            // Asignar estado por defecto e insertar
            nuevoPaquete.Estado = "Pendiente";
            nuevoPaquete.RepartidorId = null;

            _context.Paquetes.Add(nuevoPaquete);
            await _context.SaveChangesAsync();

            return Ok(nuevoPaquete);
        }
    }
}
