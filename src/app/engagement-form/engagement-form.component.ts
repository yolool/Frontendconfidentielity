import { Component, ViewChild, ElementRef, inject, signal,DestroyRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import SignaturePad from 'signature_pad';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EngagementService } from '../service/engagement.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-engagement-form',
  imports: [ReactiveFormsModule],
  templateUrl: './engagement-form.component.html',
  styleUrl: './engagement-form.component.css'
})
export class EngagementFormComponent {
  @ViewChild('signatureCanvas') canvas!: ElementRef<HTMLCanvasElement>;
  
  type: any;
  router = inject(Router);
  signaturePad!: SignaturePad;
  showbtn = false;
  form: FormGroup;
  date: Date = new Date();
  signture = false;
  
  isCapturing = false;
  destroyRef = inject(DestroyRef);

  errorMessage = signal<string | null>(null);
  isLoading = signal<boolean>(false);
  successMessage = signal<string | null>(null);

  ngOnInit() {
    
   this.form.get('teid')?.valueChanges.subscribe(val => {
        if (typeof val === 'string' && val !== val.toUpperCase()) {
          this.form.get('teid')?.setValue(val.toUpperCase());
          
        }
      });
    this.type = localStorage.getItem('type');
 
    if (this.type !== 'guest') {
      this.form.get('teid')?.setValidators([Validators.required]);
      this.form.get('teid')?.updateValueAndValidity();
    }   
  }

  constructor(private fb: FormBuilder, private engagementServ: EngagementService ) {
    this.form = this.fb.group({
      check: [false],
      name: ['', Validators.required],
      role: ['', Validators.required],
      company: ['', Validators.required],
      teid: [''],
      city: ['', Validators.required],
      date: [{ value: this.date.getDate() + '/' + '0' + (this.date.getMonth() + 1) + '/' + this.date.getFullYear(), disabled: true }]
    });
  }
  
  verfiecheck() {
    if (this.form.get('check')?.value === true) {
      this.showbtn = true;
    } else if (this.form.get('check')?.value === false) {
      this.showbtn = false;
    }
  }

 private getErrorMessage(err: HttpErrorResponse): string {
    if (err.error && typeof err.error === 'object') {
      if (err.error.message) return err.error.message;
      if (err.error.error) return err.error.error;
    }
    if (err.error && typeof err.error === 'string') {
      try {
        const parsed = JSON.parse(err.error);
        if (parsed.message) return parsed.message;
        if (parsed.error) return parsed.error;
      } catch {}
      return err.error;
    }
    switch (err.status) {
      case 400: return 'Invalid form data. Please check all fields.';
      case 401: return 'Session expired. Please login again.';
      case 403: return 'Access denied. You do not have permission.';
      case 404: return 'Resource not found.';
      case 409: return 'This document has already been submitted.';
      case 413: return 'File too large. Please try again.';
      case 500: return 'Server error. Please try again later.';
      default: return 'An unexpected error occurred. Please try again.';
    }
  }

  async generatePdf(): Promise<void> {
    this.errorMessage.set(null);
    window.scrollTo(0,0)
    this.successMessage.set(null);  
    if(localStorage.getItem('id')){
    if(localStorage.getItem('id')?.toUpperCase() !== this.form.get('teid')?.value){
      this.errorMessage.set('the id is invalid')
      return
    }    } 
    if (this.signaturePad.isEmpty() || this.form.invalid) {
      this.signture = true;
      this.form.markAllAsTouched();
      return;
    }else if(!this.signaturePad.isEmpty() || this.form.valid ){
      this.signture = false
    }

   
    this.isLoading.set(true);

    const buttons = document.querySelectorAll('.no-print');
    buttons.forEach(btn => {
      (btn as HTMLElement).style.display = 'none';
    });

    try {
      this.isCapturing = true;
      this.form.get('check')?.disable()
        this.signaturePad.off()
      await new Promise(resolve => setTimeout(resolve, 50));

      document.body.classList.add('pdf-capture-mode');

      const content = document.getElementById('pdfContent');
      if (!content) {
        this.isCapturing = false;
        this.isLoading.set(false);
        buttons.forEach(btn => {
          (btn as HTMLElement).style.display = 'block';
        });
        return;
      }

      const canvas = await html2canvas(content, {
        scale: 2,
        useCORS: true,
        logging: false
      });

      document.body.classList.remove('pdf-capture-mode');

      this.isCapturing = false;


      buttons.forEach(btn => {
        (btn as HTMLElement).style.display = 'block';
      });

      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);

      const pdfBlob = pdf.output('blob');
      const pdfFile = new File([pdfBlob], 'Engagement.pdf', { type: 'application/pdf' });
      
      const subject = `Engagement de confidentialité - ${this.form.value.name}`;
      let id = '';
      if (this.type !== 'guest') {
        id = this.form.get('teid')?.value;
      }
        
      this.engagementServ.uploadEngagement(pdfFile, subject, id).subscribe({
        next: (response) => {
          
          this.isLoading.set(false);
          this.successMessage.set('Document submitted successfully!');
          setTimeout(() => {
            if (this.type === 'guest') {
              this.router.navigate(['/']);
              localStorage.setItem('msg', response.statut);
            } else {
              this.router.navigate(['/Dashboard']);
            }
          }, 1500);
        },
        error: (err: HttpErrorResponse) => {
          this.form.get('check')?.enable()
          this.signaturePad.on()
          this.isLoading.set(false);
          this.errorMessage.set(this.getErrorMessage(err));
        }
      });

    } catch (error) {
      this.isCapturing = false;
      this.isLoading.set(false);
      this.errorMessage.set('Failed to generate PDF. Please try again.');
      document.body.classList.remove('pdf-capture-mode');
      buttons.forEach(btn => {
        (btn as HTMLElement).style.display = 'block';
      });
      
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      const canvas = this.canvas.nativeElement;
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      this.signaturePad = new SignaturePad(canvas);
    }, 100);
  }

  clearSignature() {
    this.signaturePad.clear();
  }
}