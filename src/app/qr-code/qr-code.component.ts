import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import QRCodeStyling from 'qr-code-styling';

@Component({
  selector: 'app-qr-code',
  standalone: true,
  templateUrl: './qr-code.component.html',
  styleUrls: ['./qr-code.component.css']
})
export class QrCodeComponent implements AfterViewInit {

  @ViewChild('qrContainer', { static: true })
  qrContainer!: ElementRef;

  qrCode!: QRCodeStyling;

  ngAfterViewInit(): void {

    this.qrCode = new QRCodeStyling({
      width: 300,
      height: 300,

      data: " http://localhost:4200/",

      image: "assets/img/image.png",

      dotsOptions: {
        color: "#000000",
        type: "rounded"
      },

      backgroundOptions: {
        color: "#ffffff"
      },

      imageOptions: {
        crossOrigin: "anonymous",
        margin: 10
      },

      cornersSquareOptions: {
        type: "extra-rounded"
      },

      cornersDotOptions: {
        type: "dot"
      }
    });


    this.qrCode.append(
      this.qrContainer.nativeElement
    );
  }


  downloadQR() {
    this.qrCode.download({
      name: "my-qrcode",
      extension: "png"
    });
  }

}