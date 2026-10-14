import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'http://localhost:5000/api/dispatch/v1';

export default function App() {
    const [paquetes, setPaquetes] = useState([]);
    const [repartidores, setRepartidores] = useState([]);
    const [selectedPaquete, setSelectedPaquete] = useState(null);
    const [selectedRepartidor, setSelectedRepartidor] = useState(null);
    const [loading, setLoading] = useState(false);
    const [mensajeAlerta, setMensajeAlerta] = useState({ tipo: '', texto: '' });

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            const resPaquetes = await fetch(`${API_BASE_URL}/packages`);
            const dataPaquetes = await resPaquetes.json();

            const resRepartidores = await fetch(`${API_BASE_URL}/dispatchers`);
            const dataRepartidores = await resRepartidores.json();

            setPaquetes(dataPaquetes);
            setRepartidores(dataRepartidores);
        } catch (err) {
            mostrarAlerta('error', 'No se pudo conectar con el servidor de .NET Core. Verifica que la API esté corriendo.');
        }
    };

    const mostrarAlerta = (tipo, texto) => {
        setMensajeAlerta({ tipo, texto });
        setTimeout(() => setMensajeAlerta({ tipo: '', texto: '' }), 5000);
    };

    const ejecutarAsignacion = async () => {
        if (!selectedPaquete || !selectedRepartidor) return;

        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/assign`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    paqueteId: selectedPaquete.id,
                    repartidorId: selectedRepartidor.id
                })
            });

            const resultado = await response.json();

            if (response.ok) {
                setPaquetes(prev => prev.filter(p => p.id !== selectedPaquete.id));
                setRepartidores(prev => prev.map(rep => {
                    if (rep.id === selectedRepartidor.id) {
                        return { ...rep, capacidadDisponibleKg: rep.capacidadDisponibleKg - selectedPaquete.pesoKg };
                    }
                    return rep;
                }));

                mostrarAlerta('exito', `¡Asignación exitosa! El paquete ${selectedPaquete.id} fue despachado.`);
                setSelectedPaquete(null);
                setSelectedRepartidor(null);
            } else {
                mostrarAlerta('error', resultado.error || 'Ocurrió un problema en la asignación.');
            }
        } catch (error) {
            mostrarAlerta('error', 'Error de red al intentar procesar la asignación.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
            {/* Encabezado Profesional - Fondo Blanco Limpio */}
            <header className="bg-white border-b border-slate-200 p-4 shadow-sm">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-slate-900">Módulo de Despacho</h1>
                        <p className="text-xs text-slate-500 mt-0.5">Control y Asignación de Paquetería</p>
                    </div>
                    <button
                        onClick={cargarDatos}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-2 rounded-md border border-slate-300/70 transition-all"
                    >
                        🔄 Sincronizar Tablero
                    </button>
                </div>
            </header>

            {/* Banner de Mensajes */}
            {mensajeAlerta.texto && (
                <div className={`p-3 text-center font-medium text-sm transition-all duration-300 ${mensajeAlerta.tipo === 'error' ? 'bg-red-500 text-white' : 'bg-emerald-600 text-white'
                    }`}>
                    {mensajeAlerta.texto}
                </div>
            )}

            {/* Grid Principal - Fondos de columnas Gris Claro Suave */}
            <main className="flex-1 max-w-7xl w-full mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 p-6">

                {/* Columna Izquierda: Paquetes Pendientes */}
                <section className="bg-slate-100/60 rounded-xl p-5 border border-slate-200 flex flex-col shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                            <span>📦</span> Paquetes Pendientes
                        </h2>
                        <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full border border-blue-200">
                            {paquetes.length} en espera
                        </span>
                    </div>

                    <div className="space-y-3 overflow-y-auto pr-1 flex-1 max-h-[55vh]">
                        {paquetes.length === 0 ? (
                            <p className="text-sm text-slate-400 text-center py-10">No hay paquetes pendientes.</p>
                        ) : (
                            paquetes.map(p => (
                                <div
                                    key={p.id}
                                    onClick={() => setSelectedPaquete(p)}
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

                {/* Columna Derecha: Repartidores Activos */}
                <section className="bg-slate-100/60 rounded-xl p-5 border border-slate-200 flex flex-col shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                            <span>🚚</span> Repartidores Activos
                        </h2>
                        <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-200">
                            {repartidores.length} activos
                        </span>
                    </div>

                    <div className="space-y-3 overflow-y-auto pr-1 flex-1 max-h-[55vh]">
                        {repartidores.map(r => {
                            const capacidadUsada = Number(r.capacidadMaximaKg) - Number(r.capacidadDisponibleKg);
                            const porcentajeCarga = (capacidadUsada / Number(r.capacidadMaximaKg)) * 100;
                            const noCabe = selectedPaquete && (Number(r.capacidadDisponibleKg) < Number(selectedPaquete.pesoKg));

                            return (
                                <div
                                    key={r.id}
                                    onClick={() => !noCabe && setSelectedRepartidor(r)}
                                    className={`p-4 rounded-lg border transition-all bg-white ${noCabe
                                            ? 'opacity-40 bg-slate-100 border-dashed border-slate-200 cursor-not-allowed'
                                            : selectedRepartidor?.id === r.id
                                                ? 'border-emerald-500 ring-2 ring-emerald-500/10 bg-emerald-50/20 cursor-pointer'
                                                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 cursor-pointer'
                                        }`}
                                >
                                    <div className="flex justify-between items-center mb-2">
                                        <div>
                                            <p className="text-sm font-bold text-slate-800">{r.nombre}</p>
                                            <p className="text-xs font-mono text-slate-400">{r.id}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[10px] text-slate-400 font-bold block">DISPONIBLE:</span>
                                            <p className="text-sm font-bold text-slate-700">
                                                {Number(r.capacidadDisponibleKg).toFixed(1)} <span className="text-xs text-slate-400">/ {r.capacidadMaximaKg} kg</span>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                                        <div
                                            className={`h-full transition-all duration-500 ${porcentajeCarga > 85 ? 'bg-red-500' : 'bg-emerald-500'}`}
                                            style={{ width: `${Math.min(porcentajeCarga, 100)}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

            </main>

            {/* Barra de Control Inferior - Fondo Blanco y Bordes Suaves */}
            <footer className="bg-white border-t border-slate-200 p-4 shadow-md mt-auto">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">

                    <div className="flex flex-wrap gap-4 w-full sm:w-auto">
                        {/* Recuadro del paquete seleccionado */}
                        <div className="bg-slate-50 px-4 py-2 rounded-lg border border-slate-200 min-w-[170px]">
                            <span className="text-slate-400 text-[10px] font-bold block">PAQUETE</span>
                            <span className="font-semibold text-sm text-blue-600">
                                {selectedPaquete ? `${selectedPaquete.id} (${selectedPaquete.pesoKg} kg)` : "No seleccionado"}
                            </span>
                        </div>

                        {/* Recuadro del repartidor seleccionado */}
                        <div className="bg-slate-50 px-4 py-2 rounded-lg border border-slate-200 min-w-[170px]">
                            <span className="text-slate-400 text-[10px] font-bold block">REPARTIDOR</span>
                            <span className="font-semibold text-sm text-emerald-600">
                                {selectedRepartidor ? selectedRepartidor.nombre : "No seleccionado"}
                            </span>
                        </div>
                    </div>

                    {/* Botón de asignación con diseño corporativo elegante */}
                    <button
                        onClick={ejecutarAsignacion}
                        disabled={!selectedPaquete || !selectedRepartidor || loading}
                        className={`w-full sm:w-auto px-6 py-3 rounded-lg font-bold text-xs uppercase tracking-wider transition-all duration-150 ${selectedPaquete && selectedRepartidor && !loading
                                ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-sm active:scale-95 cursor-pointer'
                                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            }`}
                    >
                        {loading ? 'Procesando...' : 'Asignar Paquete'}
                    </button>

                </div>
            </footer>
        </div>
    );
}
