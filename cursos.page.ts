import { Component, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { ApiService, Curso } from '../services/api';

@Component({
  selector: 'app-cursos',
  templateUrl: './cursos.page.html',
  styleUrls: ['./cursos.page.scss'],
  standalone: false,
})
export class CursosPage implements OnInit {

  lista: Curso[] = [];
  detalle?: Curso;

  idBuscar = '';
  loadingList = false;
  loadingItem = false;
  errorMsg = '';

  form: {
    nombre: string;
    descripcion: string | null;
    profesorId: number | null;
    creditos: number | null;
    horas_duracion: number | null;
    activo: boolean;
  } = {
    nombre: '',
    descripcion: null,
    profesorId: null,
    creditos: 3,
    horas_duracion: null,
    activo: true
  };

  insertLoading = false;
  insertError = '';

  constructor(
    private api: ApiService,
    private toast: ToastController
  ) {}

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.errorMsg = '';
    this.loadingList = true;
    this.api.listarCursos().subscribe({
      next: (data) => {
        this.lista = data;
        this.loadingList = false;
      },
      error: (err) => {
        this.errorMsg = err?.error?.error || 'Error cargando cursos';
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
    this.api.cursoPorId(id).subscribe({
      next: (data) => {
        this.detalle = data;
        this.loadingItem = false;
      },
      error: (err) => {
        this.errorMsg = err?.status === 404
          ? 'No se encontró el curso'
          : (err?.error?.error || 'Error buscando curso');
        this.loadingItem = false;
      }
    });
  }

  insertar(): void {
    this.insertError = '';

    const nombre = (this.form.nombre || '').trim();
    const profesorId = Number(this.form.profesorId);
    const creditos = this.form.creditos !== null ? Number(this.form.creditos) : 3;
    const horas = this.form.horas_duracion !== null ? Number(this.form.horas_duracion) : null;

    if (!nombre || !profesorId) {
      this.insertError = 'nombre y profesorId son requeridos.';
      return;
    }
    if (isNaN(creditos) || creditos < 1 || creditos > 10) {
      this.insertError = 'Créditos debe estar entre 1 y 10.';
      return;
    }

    this.insertLoading = true;
    this.api.insertarCurso({
      nombre,
      descripcion: this.form.descripcion,
      profesorId,
      creditos,
      horas_duracion: horas,
      activo: this.form.activo ? 1 : 0
    }).subscribe({
      next: async () => {
        this.insertLoading = false;

      
        await this.toastOk('Curso guardado');

        this.resetForm();
        this.cargar();
      },
      error: async (err) => {
        this.insertLoading = false;
        this.insertError = err?.error?.error || err?.error?.message || 'Error al guardar';
        await this.toastError(this.insertError);
      }
    });
  }

  eliminar(id: number): void {
    if (!confirm(`¿Eliminar curso #${id}?`)) return;

    this.api.eliminarCurso(id).subscribe({
      next: async () => {
        await this.toastOk('Curso eliminado');
        this.cargar();
      },
      error: async (err) => {
        this.errorMsg = err?.error?.error || err?.error?.message || 'Error eliminando curso';
        await this.toastError(this.errorMsg);
      }
    });
  }

  private resetForm(): void {
    this.form = {
      nombre: '',
      descripcion: null,
      profesorId: null,
      creditos: 3,
      horas_duracion: null,
      activo: true
    };
  }

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
