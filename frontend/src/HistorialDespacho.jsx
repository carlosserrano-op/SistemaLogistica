import React from 'react';

export default function HistorialDespachos({ historial }) {
    return (
        <section className="bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-xs max-w-7xl w-full mx-auto mt-2 mb-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                Bitácora de Operaciones
            </h3>

            {historial.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No se han realizado asignaciones</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {historial.map((item) => (
                        <div
                            key={item.id}
                            className="bg-white p-3 rounded-lg border border-emerald-100 bg-emerald-50/10 flex flex-col justify-between shadow-2xs animate-in fade-in slide-in-from-bottom-2 duration-200"
                        >
                            <div className="flex justify-between items-start">
                                <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                                    {item.paqueteId} ➔ {item.id}
                                </span>
                                <span className="text-[10px] text-slate-400 font-medium">{item.fecha}</span>
                            </div>
                            <p className="text-xs font-semibold text-slate-700 mt-2 truncate">
                                Asignado a: <span className="text-emerald-600">{item.repartidorNombre}</span>
                            </p>
                            <p className="text-[11px] text-slate-500 mt-1 truncate">{item.destino}</p>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}
