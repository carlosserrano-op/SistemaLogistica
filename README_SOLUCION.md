##Guía Paso a Paso para Arrancar el Sistema

### Parte 1 Encender el backend

1. Abrir terminal o consola de comandos 
2. Entrar a la carpeta SistemaLogistica.API:
   ```bash
   cd backend/SistemaLogistica.API
   ```
3. limpiar cualquier rastro viejo :
   ```bash
   dotnet clean
   ```
4. Encender el motor:
   ```bash
   dotnet run
   ```
5. Se vera el puerto `http://localhost:5000`. No cerrar la ventana

---

### Parte 2 Encender frontend

1. Abrir otra terminal o consola de comandos
2. Entrar a la carpeta frontend:
   ```bash
   cd frontend
   ```
3. Descarga e instalar los componentes visuales:
   ```bash
   npm install --legacy-peer-deps
   ```
4. Encender el frontend:
   ```bash
   npm start
   ```
5. abrir el Navegador y poner http://localhost:8080/

## Cómo se resolvió el reto 

### La estrategia de solución
Para resolver este conflicto sin ralentizar la aplicación ni congelar la base de datos , se implementó una estrategia de Control Dinámico.

El flujo de la solución opera de la siguiente manera:

1. Cuando los operadores cargan el tablero en sus pantallas, los datos de los repartidores viajan acompañados de un sello de control (TIMESTAMP) único que representa el estado exacto de ese registro en ese instante
2. El operador que presione el botón de asignación un milisegundo antes entra al servidor el sistema verifica que el sello siga siendo el original, resta la capacidad de carga al vehículo, completa el despacho y cambia de forma automática el sello del repartidor por uno totalmente nuevo
3. Cuando la petición del segundo operador llega un milisegundo después, el sistema revisa el camión y nota que el sello ya cambió (debido a la acción del primer operador) al detectar que los sellos no coinciden, el backend cancela y revierte la operación de inmediato, impidiendo que el camión se sobrecargue
4. El servidor rechaza la segunda petición enviando una alerta de conflicto al recibirla, la pantalla de React del segundo operador bloquea el flujo visual

Con esta solución, el sistema garantiza que no haya sobrecarga de los camiones, como extra de saber que paquetes tiene cada personal y una bitacora para ver a que hora se le fue asignado