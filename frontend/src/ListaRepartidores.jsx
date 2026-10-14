import React, { useState } from 'react';

export default function ListaRepartidores({ repartidores, selectedRepartidor, onSelectRepartidor, onRepartidorCreado, selectedPaquete }) {
    const [id, setId] = useState('');
    const [nombre, setNombre] = useState('');
    const [capacidadMaximaKg, setCapacidadMaximaKg] = useState('');
    const [errorForm, setErrorForm] = useState('');

    // modal del historial
    const [repartidorEnModal, setRepartidorEnModal] = useState(null);
    const [modalAbierto, setModalAbierto] = useState(false);
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
        if (!id || !nombre || !capacidadMaximaKg) {
            setErrorForm('Todos los campos son obligatorios.'); 
            return;
        }

        if (parseFloat(capacidadMaximaKg) > 100) {
            setErrorForm('La capacidad máxima permitida por repartidor es de 100 kg.'); 
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/dispatch/v1/dispatchers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, nombre, capacidadMaximaKg: parseFloat(capacidadMaximaKg) })
            });

            const data = await response.json();

            if (response.ok) {
                onRepartidorCreado({ ...data, paquetes: [] });
                setId('');
                setNombre('');
                setCapacidadMaximaKg('');
                setErrorForm('');
            } else {
                setErrorForm(data.error || 'Error al registrar repartidor.');
            }
        } catch (err) {
            setErrorForm('Error de red al conectar con el servidor.');
        }
    };


    const abrirHistorial = (repartidor) => {
        setRepartidorEnModal(repartidor);
        setModalAbierto(true);
    };

    const cerrarModal = () => {
        setModalAbierto(false);
        setRepartidorEnModal(null);
    };

    return (
        <section className="bg-emerald-50/60 rounded-xl p-5 border border-emerald-100 flex flex-col shadow-xs relative">

            <div className="flex justify-between items-center mb-4">
                <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <span>🚚</span> Gestión de Repartidores
                </h2>
                <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-200">
                    {repartidores.length} activos
                </span>
            </div>

            {/* Formulario de Registro */}
            <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg border border-slate-200 mb-4 space-y-3">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nuevo Repartidor</h3>
                {errorForm && <p className="text-xs font-semibold text-red-500">{errorForm}</p>}

                <div className="grid grid-cols-2 gap-2">
                    <input
                        type="text" placeholder="ID (ej. R004)" value={id} onChange={e => setId(e.target.value)}
                        className="p-2 text-sm border border-slate-200 rounded bg-slate-50 focus:outline-none focus:border-blue-500"
                    />
                    <input
                        type="number" placeholder="Capacidad (kg)" value={capacidadMaximaKg} onChange={e => setCapacidadMaximaKg(e.target.value)}
                        className="p-2 text-sm border border-slate-200 rounded bg-slate-50 focus:outline-none focus:border-blue-500"
                    />
                </div>
                <input
                    type="text" placeholder="Nombre Completo" value={nombre} onChange={e => setNombre(e.target.value)}
                    className="w-full p-2 text-sm border border-slate-200 rounded bg-slate-50 focus:outline-none focus:border-blue-500"
                />
                <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 rounded transition-all">
                    ➕ Registrar Repartidor Activo
                </button>
            </form>

            {/* Listado de Repartidores */}
            <div className="space-y-3 overflow-y-auto pr-1 flex-1 max-h-[35vh]">
                {repartidores.map(r => {
                    const capacidadUsada = Number(r.capacidadMaximaKg) - Number(r.capacidadDisponibleKg);
                    const porcentajeCarga = (capacidadUsada / Number(r.capacidadMaximaKg)) * 100;
                    const noCabe = selectedPaquete && (Number(r.capacidadDisponibleKg) < Number(selectedPaquete.pesoKg));
                    const listadoHistorial = r.paquetes || [];

                    return (
                        <div
                            key={r.id}
                            onClick={() => !noCabe && onSelectRepartidor(r)}
                            className={`p-4 rounded-lg border bg-white transition-all shadow-sm ${noCabe
                                    ? 'opacity-40 bg-slate-50 border-dashed cursor-not-allowed'
                                    : selectedRepartidor?.id === r.id
                                        ? 'border-emerald-500 ring-2 ring-emerald-500/10 bg-emerald-50/20 cursor-pointer'
                                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 cursor-pointer'
                                }`}
                        >
                            <div className="flex justify-between items-center mb-2">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-bold text-slate-800">{r.nombre}</p>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation(); // ⚠️ Evita seleccionar al operador al abrir el modal
                                                abrirHistorial(r);
                                            }}
                                            className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold px-2 py-0.5 rounded border border-slate-300/40 transition-colors"
                                        >
                                            📜 Ver Historial ({listadoHistorial.length})
                                        </button>
                                    </div>
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

            {/* 🌟 VENTANA MODAL EMERGENTE (PORTAL HISTORIAL) */}
            {modalAbierto && repartidorEnModal && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                    <div className="bg-white w-full max-w-md rounded-xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                        {/* Cabecera del Modal */}
                        <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
                            <div>
                                <h3 className="text-sm font-bold">{repartidorEnModal.nombre}</h3>
                                <p className="text-[10px] text-slate-400 font-mono mt-0.5">Historial Logístico • ID: {repartidorEnModal.id}</p>
                            </div>
                            <button
                                onClick={cerrarModal}
                                className="text-slate-400 hover:text-white font-bold text-sm bg-slate-800 h-7 w-7 rounded-full flex items-center justify-center transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Contenido del Historial */}
                        <div className="p-5 max-h-[60vh] overflow-y-auto space-y-3">
                            <div className="flex justify-between items-center text-xs border-b border-slate-100 pb-2">
                                <span className="text-slate-500 font-medium">Estado de Carga:</span>
                                <span className="font-bold text-slate-700">
                                    {Number(repartidorEnModal.capacidadDisponibleKg).toFixed(1)} kg libres de {repartidorEnModal.capacidadMaximaKg} kg
                                </span>
                            </div>

                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-2">Paquetes Cargados en este Turno</p>

                            {(repartidorEnModal.paquetes || []).length === 0 ? (
                                <p className="text-xs text-slate-400 italic text-center py-6">Este repartidor no tiene paquetes asignados actualmente.</p>
                            ) : (
                                (repartidorEnModal.paquetes || []).map(p => (
                                    <div key={p.id} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
                                        <div>
                                            <span className="font-mono font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                                                {p.id}
                                            </span>
                                            <p className="text-slate-700 mt-1.5 font-medium">{p.destino}</p>
                                        </div>
                                        <span className="font-bold text-slate-800 bg-white px-2 py-1 rounded border border-slate-200">
                                            {p.pesoKg} kg
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Pie del Modal */}
                        <div className="bg-slate-50 p-3 border-t border-slate-200 flex justify-end">
                            <button
                                onClick={cerrarModal}
                                className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2 rounded-lg transition-colors"
                            >
                                Cerrar Ventana
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
