CREATE TABLE Repartidores (
    Id VARCHAR(50) PRIMARY KEY,
    Nombre VARCHAR(100) NOT NULL,
    CapacidadMaximaKg DECIMAL(10, 2) NOT NULL,
    CapacidadDisponibleKg DECIMAL(10, 2) NOT NULL,
    RowVersion TIMESTAMP NOT NULL
);

CREATE TABLE Paquetes (
    Id VARCHAR(50) PRIMARY KEY,
    Destino VARCHAR(255) NOT NULL,
    PesoKg DECIMAL(10, 2) NOT NULL,
    Estado VARCHAR(20) NOT NULL DEFAULT 'Pendiente',
    RepartidorId VARCHAR(50) NULL,
    FOREIGN KEY (RepartidorId) REFERENCES Repartidores(Id)
);

INSERT INTO Repartidores (Id, Nombre, CapacidadMaximaKg, CapacidadDisponibleKg) VALUES
('R001', 'Carlos Mendoza', 100.00, 100.00),
('R002', 'Ana Gómez', 50.00, 50.00),
('R003', 'Luis Torres', 80.00, 80.00);

INSERT INTO Paquetes (Id, Destino, PesoKg, Estado, RepartidorId) VALUES
('P001', 'Zona Centro, Av. Juárez 405', 15.50, 'Pendiente', NULL),
('P002', 'Norte, Col. Altavista Calle 3', 45.00, 'Pendiente', NULL),
('P003', 'Sur, Plaza Las Torres Local 12', 60.00, 'Pendiente', NULL),
('P004', 'Sector Industrial Bodega 8B', 8.20, 'Pendiente', NULL);
