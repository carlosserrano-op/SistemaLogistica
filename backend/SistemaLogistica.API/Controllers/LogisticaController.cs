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

        // GET:/api/dispatch/v1/packages
        [HttpGet("packages")]
        public async Task<ActionResult<IEnumerable<Paquete>>> GetPendingPackages()
        {
            var packages = await _context.Paquetes
                .Where(p => p.Estado == "Pendiente")
                .ToListAsync();
            return Ok(packages);
        }
        // GET:/api/dispatch/v1/dispatchers
        [HttpGet("dispatchers")]
        public async Task<ActionResult<IEnumerable<Repartidor>>> GetDispatchers()
        {
            var dispatchers = await _context.Repartidores
                .Include(r => r.Paquetes) // 👈 Trae de la base de datos el historial de paquetes vinculados
                .ToListAsync();
            return Ok(dispatchers);
        }

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

                // Validación de la capacidad de carga
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
                return Ok(new { 
                    mensaje = "Asignación exitosa.", 
                    nuevaCapacidad = repartidor.CapacidadDisponibleKg,
                    despachoInfo = new {
                        id = Guid.NewGuid().ToString().Substring(0, 8),
                        paqueteId = paquete.Id,
                        repartidorNombre = repartidor.Nombre,
                        destino = paquete.Destino,
                        peso = paquete.PesoKg,
                        fecha = DateTime.Now.ToString("HH:mm:ss")
                    }
                });
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

            // Evita duplicados
            var existe = await _context.Paquetes.AnyAsync(p => p.Id == nuevoPaquete.Id);
            if (existe) return BadRequest(new { error = $"El código de paquete {nuevoPaquete.Id} ya está registrado." });

            // Asignación de estados
            nuevoPaquete.Estado = "Pendiente";
            nuevoPaquete.RepartidorId = null;

            _context.Paquetes.Add(nuevoPaquete);
            await _context.SaveChangesAsync();

            return Ok(nuevoPaquete);
        }
        [HttpPost("dispatchers")]
        public async Task<IActionResult> CrearRepartidor([FromBody] Repartidor nuevoRepartidor)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var existe = await _context.Repartidores.AnyAsync(r => r.Id == nuevoRepartidor.Id);
            if (existe) return BadRequest(new { error = $"El repartidor con ID {nuevoRepartidor.Id} ya existe." });

            // Capacidad disponible inicial
            nuevoRepartidor.CapacidadDisponibleKg = nuevoRepartidor.CapacidadMaximaKg;

            _context.Repartidores.Add(nuevoRepartidor);
            await _context.SaveChangesAsync();

            return Ok(nuevoRepartidor);
        }
    }
}
