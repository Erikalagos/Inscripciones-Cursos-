import { Component, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { ApiService, Inscripcion } from '../services/api';

@Component({
  selector: 'app-inscripciones',
  templateUrl: './inscripciones.page.html',
  styleUrls: ['./inscripciones.page.scss'],
  standalone: false,
})
export class InscripcionesPage implements OnInit {

  lista: Inscripcion[] = [];
  detalle?: Inscripcion;

  idBuscar = '';
  loadingList = false;
  loadingItem = false;
  errorMsg = '';

  form: {
    cursoId: number | null,
    estudianteId: number | null,
    estado: 'Activo' | 'Completado' | 'Cancelado' | 'Retirado',
    calificacion: number | null | ''
  } = {
    cursoId: null,
    estudianteId: null,
    estado: 'Activo',
    calificacion: null
  };

  insertLoading = false;
  insertError = '';

  constructor(private api: ApiService, private toast: ToastController) {}

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.errorMsg = '';
    this.loadingList = true;

    this.api.listarInscripciones().subscribe({
      next: (data: Inscripcion[]) => {
        this.lista = data;
        this.loadingList = false;
      },
      error: (err: any) => {
        this.errorMsg = err?.error?.error || 'Error cargando inscripciones';
        this.loadingList = false;
      }
    });
  }

  buscarPorId(): void {
    this.errorMsg = '';
    this.detalle = undefined;

    const id = Number(this.idBuscar);
    if (!id) {
      this.errorMsg = 'Ingresa un ID válido';
      return;
    }

    this.loadingItem = true;
    this.api.inscripcionPorId(id).subscribe({
      next: (data: Inscripcion) => {
        this.detalle = data;
        this.loadingItem = false;
      },
      error: (err: any) => {
        this.errorMsg = err?.status === 404
          ? 'No se encontró la inscripción'
          : (err?.error?.error || 'Error buscando inscripción');
        this.loadingItem = false;
      }
    });
  }

  insertar(): void {
    this.insertError = '';

    const cursoId = Number(this.form.cursoId);
    const estudianteId = Number(this.form.estudianteId);
    if (!cursoId || !estudianteId) {
      this.insertError = 'cursoId y estudianteId son requeridos.';
      return;
    }

    let calif: number | null = null;
    if (this.form.calificacion !== '' && this.form.calificacion !== null) {
      calif = Number(this.form.calificacion);
      if (isNaN(calif) || calif < 0 || calif > 100) {
        this.insertError = 'La calificación debe estar entre 0 y 100.';
        return;
      }
    }

    this.insertLoading = true;

    this.api.insertarInscripcion({
      cursoId,
      estudianteId,
      estado: this.form.estado,
      calificacion: calif
    }).subscribe({
      next: async () => {
        this.insertLoading = false;
        await this.toastOk('Inscripción guardada');   // ✅ mensaje fijo
        this.resetForm();
        this.cargar();
      },
      error: async (err: any) => {
        this.insertLoading = false;
        const msg = err?.error?.error || err?.error?.message || 'Error al guardar';
        this.insertError = msg;
        await this.toastError(msg);
      }
    });
  }

  eliminar(id: number): void {
    if (!confirm(`¿Eliminar inscripción #${id}?`)) return;

    this.api.eliminarInscripcion(id).subscribe({
      next: async () => {
        await this.toastOk('Inscripción eliminada');  // ✅ mensaje fijo
        this.cargar();
      },
      error: async (err: any) => {
        const msg = err?.error?.error || err?.error?.message || 'Error eliminando inscripción';
        this.errorMsg = msg;
        await this.toastError(msg);
      }
    });
  }

  private resetForm(): void {
    this.form = {
      cursoId: null,
      estudianteId: null,
      estado: 'Activo',
      calificacion: null
    };
  }

  // === Toast helpers consistentes con "Cursos" ===
  private async toastOk(msg: string) {
    const t = await this.toast.create({
      message: msg,
      duration: 1500,
      color: 'success',
      position: 'top',
      icon: 'checkmark-circle',
      cssClass: 'toast-ok'
    });
    await t.present();
  }

  private async toastError(msg: string) {
    const t = await this.toast.create({
      message: msg,
      duration: 2000,
      color: 'danger',
      position: 'top',
      icon: 'alert-circle',
      cssClass: 'toast-error'
    });
    await t.present();
  }
}
