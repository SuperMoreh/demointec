import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ErrorService {

  constructor(private toastr: ToastrService) { }

  handleError(error: HttpErrorResponse, defaultMsg: string = 'Ha ocurrido un error'): void {
    console.error('Error en login:', error);

    if (!error) {
      this.toastr.error(defaultMsg);
      return;
    }
    let serverMsg: string | null = null;

    if (error.error) {
      if (typeof error.error === 'object') {
        if ((error.error as any).msg) {
          serverMsg = (error.error as any).msg;
        }
        else if ((error.error as any).message) {
          serverMsg = (error.error as any).message;
        }
      }
      else if (typeof error.error === 'string') {
        serverMsg = error.error;
      }
    }

    if (serverMsg) {
      this.toastr.error(serverMsg);
    } else {
      const fallback = error.statusText || defaultMsg;
      this.toastr.error(fallback);
    }
  }
}