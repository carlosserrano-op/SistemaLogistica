import React, { useState, useEffect } from 'react';

// Puerto estándar de tu API de .NET Core 5 (Cualquier endpoint /api/dispatch/v1/)
const API_BASE_URL = 'http://localhost:5000/api/dispatch/v1';

export default function App() {
    const [paquetes, setPaquetes] = useState([]);
    const [repartidores, setRepartidores] = useState([]);
    const [selectedPaquete, setSelectedPaquete] = useState(null);
    const [selectedRepartidor, setSelectedRepartidor] = useState(null);
    const [loading, setLoading] = useState(false);
    const [mensajeAlerta, setMensajeAlerta] = useState({ tipo: '', texto: '' });

    // Cargar datos del dashboard al arrancar la pantalla
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
        // Auto-limpiar el mensaje después de 5 segundos
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
                // Actualización optimista en tiempo real
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
                // Ataja errores de regla de negocio o el Reto de Concurrencia (409)
                mostrarAlerta('error', resultado.error || 'Ocurrió un problema en la asignación.');
            }
        } catch (error) {
            mostrarAlerta('error', 'Error de red al intentar procesar la asignación.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
            {/* Encabezado */}
            <header className="bg-slate-900 border-b border-slate-800 p-5 shadow-lg">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-black tracking-tight text-indigo-400">CORE LOGÍSTICO</h1>
                        <p className="text-xs text-slate-400 mt-0.5">Control y Despacho de Paquetería en Tiempo Real</p>
                    </div>
                    <button
                        onClick={cargarDatos}
                        className="bg-slate-800 hover:bg-slate-700 text-xs font-semibold px-3 py-1.5 rounded-md border border-slate-700 transition"
                    >
                        🔄 Sincronizar Tablero
                    </button>
                </div>
            </header>

            {/* Banner de Mensajes / Errores de Concurrencia */}
            {mensajeAlerta.texto && (
                <div className={`p-4 text-center font-semibold text-sm transition-all duration-300 ${mensajeAlerta.tipo === 'error' ? 'bg-red-600/90 text-white' : 'bg-emerald-600/90 text-white'
                    }`}>
                    {mensajeAlerta.texto}
                </div>
            )}

            {/* Grid Principal de dos columnas (Requerimiento UI) */}
            <main className="flex-1 max-w-7xl w-full mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 p-6 overflow-hidden">

                {/* Columna Izquierda: Paquetes Pendientes */}
                <section className="bg-slate-900 rounded-xl p-5 border border-slate-800 flex flex-col shadow-xl">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                            <span>📦</span> Paquetes Pendientes
                        </h2>
                        <span className="text-xs font-bold bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full border border-indigo-500/20">
                            {paquetes.length} en espera
                        </span>
                    </div>

                    <div className="space-y-3 overflow-y-auto pr-1 flex-1 max-h-[55vh]">
                        {paquetes.length === 0 ? (
                            <p className="text-sm text-slate-500 text-center py-10">No hay paquetes pendientes por asignar.</p>
                        ) : (
                            paquetes.map(p => (
                                <div
                                    key={p.id}
                                    onClick={() => setSelectedPaquete(p)}
                                    className={`p-4 rounded-xl border transition-all cursor-pointer ${selectedPaquete?.id === p.id
                                            ? 'bg-indigo-600/20 border-indigo-500 shadow-md shadow-indigo-500/10'
                                            : 'bg-slate-800/40 border-slate-800 hover:bg-slate-800 hover:border-slate-700'
                                        }`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                                                {p.id}
                                            </span>
                                            <p className="text-sm font-medium mt-2 text-slate-200">{p.destino}</p>
                                        </div>
                                        <span className="text-xs font-extrabold bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800 text-emerald-400">
                                            {p.pesoKg} kg
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>

                {/* Columna Derecha: Repartidores Activos */}
                <section className="bg-slate-900 rounded-xl p-5 border border-slate-800 flex flex-col shadow-xl">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                            <span>🚚</span> Repartidores Activos
                        </h2>
                        <span className="text-xs font-bold bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20">
                            {repartidores.length} disponibles
                        </span>
                    </div>

                    <div className="space-y-3 overflow-y-auto pr-1 flex-1 max-h-[55vh]">
                        {repartidores.map(r => {
                            const capacidadUsada = Number(r.capacidadMaximaKg) - Number(r.capacidadDisponibleKg);
                            const porcentajeCarga = (capacidadUsada / Number(r.capacidadMaximaKg)) * 100;

                            // Validar si el paquete seleccionado cabe en este repartidor
                            const noCabe = selectedPaquete && (Number(r.capacidadDisponibleKg) < Number(selectedPaquete.pesoKg));

                            return (
                                <div
                                    key={r.id}
                                    onClick={() => !noCabe && setSelectedRepartidor(r)}
                                    className={`p-4 rounded-xl border transition-all ${noCabe
                                            ? 'opacity-40 bg-slate-900 border-dashed border-slate-800 cursor-not-allowed'
                                            : selectedRepartidor?.id === r.id
                                                ? 'bg-emerald-600/20 border-emerald-500 shadow-md shadow-emerald-500/10 cursor-pointer'
                                                : 'bg-slate-800/40 border-slate-800 hover:bg-slate-800 hover:border-slate-700 cursor-pointer'
                                        }`}
                                >
                                    <div className="flex justify-between items-center mb-2">
                                        <div>
                                            <p className="text-sm font-bold text-slate-200">{r.nombre}</p>
                                            <p className="text-xs font-mono text-slate-500">{r.id}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Carga Disponible:</span>
                                            <p className="text-sm font-black text-emerald-400">
                                                {Number(r.capacidadDisponibleKg).toFixed(1)} <span className="text-xs text-slate-500">/ {r.capacidadMaximaKg} kg</span>
                                            </p>
                                        </div>
                                    </div>

                                    {/* Barra de progreso visual de carga */}
                                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                                        <div
                                            className={`h-full transition-all duration-500 ${porcentajeCarga > 85 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                                            style={{ width: `${Math.min(porcentajeCarga, 100)}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

            </main>

            {/* Barra de Control de Despacho Inferior */}
            <footer className="bg-slate-900 border-t border-slate-800 p-5 shadow-2xl mt-auto">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">

                    <div className="flex flex-wrap gap-4 w-full sm:w-auto">
                        {/* Recuadro informativo del paquete seleccionado */}
                        <div className="bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-800 min-w-[180px]">
                            <span className="text-slate-500 uppercase tracking-widest text-[9px] font-bold block">Paquete Seleccionado</span>
                            <span className="font-bold text-sm text-indigo-400">
                                {selectedPaquete ? `${selectedPaquete.id} (${selectedPaquete.pesoKg} kg)` : "Ninguno"}
                            </span>
                        </div>

                        {/* Recuadro informativo del repartidor seleccionado */}
                        <div className="bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-800 min-w-[180px]">
                            <span className="text-slate-500 uppercase tracking-widest text-[9px] font-bold block">Repartidor Destinado</span>
                            <span className="font-bold text-sm text-emerald-400">
                                {selectedRepartidor ? selectedRepartidor.nombre : "Ninguno"}
                            </span>
                        </div>
                    </div>

                    {/* Botón de acción principal controlado por estados */}
                    <button
                        onClick={ejecutarAsignacion}
                        disabled={!selectedPaquete || !selectedRepartidor || loading}
                        className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-extrabold text-sm uppercase tracking-wider transition-all duration-150 ${selectedPaquete && selectedRepartidor && !loading
                                ? 'bg-gradient-to-r from-indigo-500 to-emerald-500 text-slate-950 shadow-lg shadow-indigo-500/10 hover:brightness-110 active:scale-95 cursor-pointer'
                                : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                            }`}
                    >
                        {loading ? 'Procesando Despacho...' : 'Confirmar Asignación'}
                    </button>
                </div>
            </footer>
        </div>
    );
}

