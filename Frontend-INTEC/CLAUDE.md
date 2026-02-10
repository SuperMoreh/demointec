# CLAUDE.md — Frontend-INTEC

## Descripción del Proyecto

Sistema de gestión de Recursos Humanos y administración de proyectos de construcción. Desarrollado para INTEC, cubre el ciclo de vida completo del empleado: contratación, asistencias, solicitudes de compra, relaciones laborales, permisos/vacaciones, bajas y repositorio documental. Cumple con regulaciones laborales mexicanas (CURP, RFC, NSS, IMSS).

## Stack Tecnológico

- **Angular 19.2** con standalone components (sin NgModules)
- **TypeScript 5.7** con modo estricto habilitado
- **RxJS 7.8** para programación reactiva
- **Bootstrap 5.3** para estilos
- **ngx-toastr** para notificaciones
- **jspdf + jspdf-autotable + html2canvas** para generación de PDFs
- **xlsx / xlsx-js-style** para exportación a Excel
- **SSR** habilitado con `@angular/ssr` y Express

## Arquitectura

El proyecto sigue una arquitectura por capas con el patrón Adapter:

```
Components (UI) → Adapters (acceso a datos) → Models (interfaces) → HTTP Client
                   Services (lógica de negocio / reportes)
```

### Estructura de carpetas

```
src/app/
├── adapters/       # Servicios adapter para comunicación con API (1 por entidad)
├── components/     # Componentes standalone de Angular (1 por feature)
├── models/         # Interfaces TypeScript del dominio
├── services/       # ErrorService + servicios de reportes (PDF/Excel)
├── app.routes.ts   # Configuración de rutas
├── app.config.ts   # Providers de la aplicación
└── app.component.ts
```

### Capas

- **Components**: Standalone components con Reactive Forms (FormBuilder/FormGroup). Manejan UI, estado local y paginación.
- **Adapters**: Servicios `@Injectable({ providedIn: 'root' })` que encapsulan llamadas HTTP (GET, POST, PUT, DELETE). Retornan `Observable<T>`. Usan `inject(HttpClient)`.
- **Models**: Interfaces TypeScript que definen estructuras de datos del dominio.
- **Services**: `ErrorService` para manejo centralizado de errores HTTP con ToastrService. Servicios de reportes para generación de PDF y Excel.

### Patrón de un Adapter

```typescript
@Injectable({ providedIn: 'root' })
export class XxxAdapterService {
  private myAppUrl = environment.endpoint;
  private myApiUrl = 'api/xxx/';
  private http = inject(HttpClient);

  getList(): Observable<Model[]> { ... }
  get(id: string): Observable<Model> { ... }
  post(data: Model): Observable<void> { ... }
  put(id: string, data: Model): Observable<void> { ... }
  delete(id: string): Observable<void> { ... }
}
```

## Rutas principales

```
/login                          → LoginComponent
/dashboard                      → NavbarMainComponent (layout wrapper)
  /usuarios                     → UserComponent
  /herramientas                 → ToolsCatalogComponent
  /materiales                   → MaterialsCatalogComponent
  /obras                        → ProjectsCatalogComponent
  /colaboradores                → EmployeesComponent
  /asistencias                  → AttendancesComponent
  /partidas                     → CategoriesComponent
  /subpartidas                  → SubcategoriesComponent
  /solicitudes                  → PurchaseRequestsComponent
  /relaciones-laborales         → LaborRelationsComponent
  /repositorio-documental       → DocumentRepositoryComponent
  /descripciones-puestos        → JobDescriptionComponent
  /control-bajas                → TerminationsComponent
  /permisos-vacaciones          → PermissionsVacationsComponent (lazy loaded)
```

## Autenticación

- Login vía `/api/login` que retorna `token` y objeto `user`.
- Token y usuario almacenados en `localStorage`.
- El modelo `Employee` contiene flags de permisos granulares (`pAut1`, `pCapSol`, `pUsuarios`, `pAlertaContratos`, etc.).
- Logout limpia localStorage y redirige a `/login`.

## API Backend

- Base URL configurada en `environment.endpoint`.
- Endpoints RESTful: `/api/colaboradores/`, `/api/solicitudesEncabezado/`, `/api/solicitudesDetalle/`, `/api/usuarios/`, `/api/herramientas/`, `/api/materiales/`, `/api/obras/`, etc.
- Endpoints de sincronización Firebase: `/api/sincronizar-*`.
- Endpoint de alertas: `/api/contracts-expiring`.

## Convenciones de código

### Nombrado de archivos
- Componentes: `nombre-componente.component.ts`
- Adapters: `nombre-entidad.adapter.ts`
- Modelos: `nombre-entidad.ts`
- Servicios: `nombre-servicio.service.ts`

### Nombrado en código
- Clases: PascalCase (`EmployeesComponent`, `EmployeesAdapterService`)
- Variables y métodos: camelCase (`employeesForm`, `currentPage`)
- Campos de BD/API: snake_case (`id_employee`, `name_employee`)
- Selectores de componentes: kebab-case con prefijo `app-` (`app-employees`)

### Formularios
- Siempre Reactive Forms con FormBuilder.
- Validadores: `Validators.required`, `Validators.email`, etc.

### Inyección de dependencias
- Usar `inject()` en lugar de constructor injection para servicios.

---

## Instrucciones para Agentes y Modelos de IA

### Reglas obligatorias

1. **Seguir la arquitectura existente.** No introducir nuevos patrones, librerías o capas. Respetar la separación: Components → Adapters → Models → Services.

2. **Generar código limpio y con buenas prácticas:**
   - Standalone components (nunca crear NgModules).
   - Inyección con `inject()`.
   - Reactive Forms con FormBuilder.
   - Observables de RxJS — no usar promesas para llamadas HTTP.
   - Tipado estricto: nunca usar `any` sin justificación.
   - Nombres descriptivos en camelCase para variables/métodos, PascalCase para clases.
   - Un adapter por entidad, un componente por feature.

3. **No generar documentación.** No crear archivos README, CHANGELOG, CONTRIBUTING, ni documentación en markdown. No agregar JSDoc ni comentarios explicativos salvo que la lógica sea compleja y no autoexplicativa.

4. **No generar scripts.** No crear scripts de utilidad, scripts de migración, scripts de seed, ni archivos auxiliares de automatización. Trabajar únicamente con el código fuente de la aplicación Angular.

5. **No sobre-ingeniería.** Solo implementar lo que fue solicitado. No agregar features extras, refactoring no pedido, manejo de errores para escenarios imposibles, ni abstracciones prematuras.

6. **Respetar convenciones de nombrado existentes.** Archivos, clases, variables y selectores deben seguir las convenciones documentadas arriba.

7. **Mantener consistencia con el código existente.** Antes de modificar un archivo, leerlo completo para entender el patrón. Replicar el mismo estilo.

8. **No modificar configuraciones de build/deploy** (angular.json, tsconfig.json, package.json) salvo que sea explícitamente solicitado.

9. **No agregar dependencias** sin que el usuario lo solicite o apruebe.

10. **Idioma:** Los nombres técnicos (clases, variables, métodos) se escriben en inglés. Los mensajes de UI y textos visibles para el usuario van en español.

### Buenas prácticas esperadas

- Suscripciones a Observables deben limpiarse (unsubscribe o usar `takeUntilDestroyed`).
- Componentes deben ser lo más simples posible: delegar lógica de negocio a services/adapters.
- Formularios deben validarse antes de enviar datos al backend.
- Errores HTTP deben manejarse a través del `ErrorService` existente.
- Paginación y filtrado se manejan en el componente con arrays locales (`filteredItems`, `currentPage`, `itemsPerPage`).
