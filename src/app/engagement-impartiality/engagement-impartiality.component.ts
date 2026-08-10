import { Component, ViewChild, ElementRef, inject, signal, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import SignaturePad from 'signature_pad';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { EngagementService } from '../service/engagement.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-engagement-impartiality',
  imports: [ReactiveFormsModule , DatePipe],
  templateUrl: './engagement-impartiality.component.html',
  styleUrl: './engagement-impartiality.component.css'
})
export class EngagementImpartialityComponent {

 @ViewChild('signatureCanvas') canvas!: ElementRef<HTMLCanvasElement>;

  router = inject(Router);
  signaturePad!: SignaturePad;
  showbtn = false;
  form: FormGroup;
  date: Date = new Date();
  signture = false;
  errorMessage = signal<string | null>(null);
  isLoading = signal<boolean>(false);
  successMessage = signal<string | null>(null);

  isCapturing = false;

  ngOnInit(){
    this.form.get('teid')?.valueChanges.subscribe(val => {
        if (typeof val === 'string' && val !== val.toUpperCase()) {
          this.form.get('teid')?.setValue(val.toUpperCase());
          
        }
      });
  }
  constructor(private fb: FormBuilder, private engagementServ:EngagementService) {
  
    this.form = this.fb.group({
      check: [false],
      name: ['', Validators.required],
      teid: ['',Validators.required],
      date:[{value: this.date.getDate() + '/' + '0'+(this.date.getMonth()+1) + '/' + this.date.getFullYear(),disabled:true}]
    });
  }

 verfiecheck(){
        if(this.form.get('check')?.value === true){
        this.showbtn=true
         }else if(this.form.get('check')?.value === false){
      this.showbtn=false
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
  this.successMessage.set(null);
    

      if(localStorage.getItem('id')?.toUpperCase() !== this.form.get('teid')?.value){
      this.errorMessage.set('the id is invalid')
      return
    }     
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

    const pages = document.querySelectorAll('.page');
    const pdf = new jsPDF('p', 'mm', 'a4');

    for (let i = 0; i < pages.length; i++) {
      const canvas = await html2canvas(
        pages[i] as HTMLElement,
        {
          scale: 2,
          useCORS: true,
          logging: false
        }
      );

      const imgData = canvas.toDataURL('image/png');
      const pageWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * pageWidth) / canvas.width;

      if (i > 0) {
        pdf.addPage();
      }

      const finalHeight = Math.min(imgHeight, pageHeight);
      pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, finalHeight);
    }

    document.body.classList.remove('pdf-capture-mode');

    this.isCapturing = false;

    buttons.forEach(btn => {
      (btn as HTMLElement).style.display = 'block';
    });

    const blob = pdf.output('blob');
    const pdfFile = new File([blob], 'Engagement.pdf', { type: 'application/pdf' });

    const subject = `Engagement d'impartialité et de confidentialité - ${this.form.value.name}`;
    const idte = this.form.get('teid')?.value;

    this.engagementServ.uploadEngagement(pdfFile, subject, idte).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.successMessage.set('Document submitted successfully!');
        setTimeout(() => {
          this.router.navigate(['/Dashboard']);
        }, 1500);
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading.set(false);
        this.errorMessage.set(this.getErrorMessage(err));
      }
    });

  } catch(error) {
     this.form.get('check')?.enable()
         this.signaturePad.on()
    this.isCapturing = false;
    this.isLoading.set(false);
    this.errorMessage.set('Failed to generate PDF. Please try again.');
    document.body.classList.remove('pdf-capture-mode');
    buttons.forEach(btn => {
      (btn as HTMLElement).style.display = 'block';
    });
  } finally {
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