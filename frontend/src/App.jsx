import React, { useState, useEffect } from 'react';
import ListaPaquetes from './ListaPaquetes';
import ListaRepartidores from './ListaRepartidores';
import HistorialDespachos from './HistorialDespacho';

const API_BASE_URL = 'http://localhost:5000/api/dispatch/v1';

export default function App() {
    const [paquetes, setPaquetes] = useState([]);
    const [repartidores, setRepartidores] = useState([]);
    const [selectedPaquete, setSelectedPaquete] = useState(null);
    const [selectedRepartidor, setSelectedRepartidor] = useState(null);
    const [loading, setLoading] = useState(false);
    const [mensajeAlerta, setMensajeAlerta] = useState({ tipo: '', texto: '' });
    const [historial, setHistorial] = useState([]);
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
                        return {
                            ...rep,
                            capacidadDisponibleKg: rep.capacidadDisponibleKg - selectedPaquete.pesoKg,
                            paquetes: [...(rep.paquetes || []), selectedPaquete]
                        };
                    }
                    return rep; 
                }));
                if (resultado.despachoInfo) {
                    setHistorial(prev => [resultado.despachoInfo, ...prev]);
                }
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
        <div className="min-h-screen bg-white text-slate-800 flex flex-col font-sans">

            <header className="bg-white border-b border-slate-200 p-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-slate-900">Módulo de Control y Despacho</h1>
                        <p className="text-xs text-slate-500 mt-0.5">Gestión de Logística Comercial e Integridad de Carga</p>
                    </div>
                </div>
            </header>

            {mensajeAlerta.texto && (
                <div className={`p-3 text-center font-semibold text-sm transition-all duration-300 ${mensajeAlerta.tipo === 'error' ? 'bg-red-500 text-white' : 'bg-emerald-600 text-white'
                    }`}>
                    {mensajeAlerta.texto}
                </div>
            )}

            <main className="flex-1 max-w-7xl w-full mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 p-6">

                <ListaPaquetes
                    paquetes={paquetes}
                    selectedPaquete={selectedPaquete}
                    onSelectPaquete={setSelectedPaquete}
                    onPaqueteCreado={(nuevo) => setPaquetes(prev => [...prev, nuevo])}
                />

                <ListaRepartidores
                    repartidores={repartidores}
                    selectedRepartidor={selectedRepartidor}
                    onSelectRepartidor={setSelectedRepartidor}
                    selectedPaquete={selectedPaquete}
                    onRepartidorCreado={(nuevo) => setRepartidores(prev => [...prev, nuevo])}
                />

            </main>
            <HistorialDespachos historial={historial} />
            <footer className="bg-indigo-600/75 text-white p-4 mt-auto border-t border-indigo-50070 shadow-2xl">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">

                    <div className="flex flex-wrap gap-4 w-full sm:w-auto">
                        <div className="bg-white/20 px-4 py-2.5 rounded-xl border border-white/10 min-w-[180px]">
                            <span className="text-indigo-100 text-[10px] font-bold uppercase tracking-wider block">Paquete</span>
                            <span className="font-extrabold text-sm text-yellow-300">
                                {selectedPaquete ? `${selectedPaquete.id} (${selectedPaquete.pesoKg} kg)` : "Ninguno"}
                            </span>
                        </div>

                        <div className="bg-white/20 px-4 py-2.5 rounded-xl border border-white/10 min-w-[180px]">
                            <span className="text-indigo-100 text-[10px] font-bold uppercase tracking-wider block">Repartidor Destinado</span>
                            <span className="font-extrabold text-sm text-lime-300"> 
                                {selectedRepartidor ? selectedRepartidor.nombre : "Ninguno"}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={ejecutarAsignacion}
                        disabled={!selectedPaquete || !selectedRepartidor || loading}
                        className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all duration-150 border ${selectedPaquete && selectedRepartidor && !loading
                                ? 'bg-slate-900 hover:bg-slate-800 text-white border-slate-950 shadow-lg shadow-slate-900/20 active:scale-95 cursor-pointer'
                                : 'bg-white/10 text-white/40 border-white/10 cursor-not-allowed'
                            }`}
                    >
                        {loading ? 'Procesando...' : 'Confirmar Asignación'}
                    </button>

                </div>
            </footer>

        </div>
    );
}
