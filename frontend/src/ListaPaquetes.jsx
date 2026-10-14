import React, { useState } from 'react';

export default function ListaPaquetes({ paquetes, selectedPaquete, onSelectPaquete, onPaqueteCreado }) {
    const [id, setId] = useState('');
    const [destino, setDestino] = useState('');
    const [pesoKg, setPesoKg] = useState('');
    const [errorForm, setErrorForm] = useState('');
    React.useEffect(() => {
        if (errorForm) {
            const timer = setTimeout(() => {
                setErrorForm('');
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [errorForm]);
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!id || !destino || !pesoKg) {
            setErrorForm('Todos los campos son obligatorios.');
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/dispatch/v1/packages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, destino, pesoKg: parseFloat(pesoKg) })
            });

            const data = await response.json();

            if (response.ok) {
                onPaqueteCreado(data); // actualiza la lista global App.jsx
                setId('');
                setDestino('');
                setPesoKg('');
                setErrorForm('');
            } else {
                setErrorForm(data.error || 'Error al crear el paquete.');
            }
        } catch (err) {
            setErrorForm('Error de red al conectar con el servidor.');
        }
    };

    return (
        <section className="bg-blue-50/70 rounded-xl p-5 border border-blue-100 flex flex-col shadow-xs">

            <div className="flex justify-between items-center mb-4">
                <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <span>📦</span> Gestión de Paquetes
                </h2>
                <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full border border-blue-200">
                    {paquetes.length} en espera
                </span>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg border border-slate-200 mb-4 space-y-3">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nuevo Registro</h3>
                {errorForm && (
                    <div className="fixed top-5 right-5 z-50 max-w-sm w-full bg-rose-600 text-white p-4 rounded-xl shadow-xl flex items-center justify-between border border-rose-500/30 animate-in slide-in-from-top-5 duration-200">
                        <div className="flex items-center gap-3">
                            <span>⚠️</span>
                            <p className="text-xs font-semibold tracking-wide">{errorForm}</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setErrorForm('')}
                            className="text-white/60 hover:text-white text-xs font-bold font-mono ml-4 focus:outline-none"
                        >
                            ✕
                        </button>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                    <input
                        type="text" placeholder="Código (ej. P005)" value={id} onChange={e => setId(e.target.value)}
                        className="p-2 text-sm border border-slate-200 rounded bg-slate-50 focus:outline-none focus:border-blue-500"
                    />
                    <input
                        type="number" step="0.1" placeholder="Peso (kg)" value={pesoKg} onChange={e => setPesoKg(e.target.value)}
                        className="p-2 text-sm border border-slate-200 rounded bg-slate-50 focus:outline-none focus:border-blue-500"
                    />
                </div>
                <input
                    type="text" placeholder="Dirección de Destino" value={destino} onChange={e => setDestino(e.target.value)}
                    className="w-full p-2 text-sm border border-slate-200 rounded bg-slate-50 focus:outline-none focus:border-blue-500"
                />
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 rounded transition-all">
                    ➕ Registrar e Ingresar al Almacén
                </button>
            </form>

            {/* Listado de paquetes */}
            <div className="space-y-3 overflow-y-auto pr-1 flex-1 max-h-[35vh]">
                {paquetes.length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-10">No hay paquetes pendientes.</p>
                ) : (
                    paquetes.map(p => (
                        <div
                            key={p.id}
                            onClick={() => onSelectPaquete(p)}
                            className={`p-4 rounded-lg border transition-all cursor-pointer bg-white ${selectedPaquete?.id === p.id
                                    ? 'border-blue-500 ring-2 ring-blue-500/10 bg-blue-50/30'
                                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                }`}
                        >
                            <div className="flex justify-between items-center">
                                <div>
                                    <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                        {p.id}
                                    </span>
                                    <p className="text-sm font-medium mt-2 text-slate-700">{p.destino}</p>
                                </div>
                                <span className="text-xs font-bold bg-slate-100 px-2.5 py-1 rounded border border-slate-200 text-slate-700">
                                    {p.pesoKg} kg
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </section>
    );
}
