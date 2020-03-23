import { Component, OnInit, Input, EventEmitter, Output, OnChanges, SimpleChanges } from '@angular/core';
import { Table } from 'src/app/models/Table';
import { TableService } from 'src/app/services/entities/table.service';
import { OrderService } from 'src/app/services/entities/order.service';
import { Service } from 'src/app/models/Service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PubModalServiceComponent } from '../pub-modal-service/pub-modal-service.component';
import { ModalAlertService } from 'src/app/services/components/modal-alert/modal-alert.service';
import { Message } from 'src/app/models/Message';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-pub-table',
  templateUrl: './pub-table.component.html',
  styleUrls: ['../../../../assets/css/lounge_pub_table.css'],
  providers: [CurrencyPipe]
})
export class PubTableComponent implements OnInit, OnChanges {

  @Input() table: Table;
  @Input() control: number;
  @Output() order = new EventEmitter<any>();
  service: Service;
  orders: {id: number, orders: any[]}[];

  sumPrice: number;

  constructor(
    private readonly currencypipe: CurrencyPipe,
    private readonly modalService: NgbModal,
    public readonly tableService: TableService,
    public readonly orderService: OrderService,
    private readonly messagesAlertService: ModalAlertService,
  ) {
    this.sumPrice = 0;
    this.orders = [];
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.control.currentValue.table === this.table) {
      this.services();
    }

  }

  ngOnInit() {
    // Consultamos si la tabla tiene servicio
    this.services();
  }

  public services() {
    this.tableService.tableServiceOpen(this.table.id).subscribe(
      serv => {
        if (serv) {
           this.service = serv;
           // vamos a por las ordenes
           this.orderService.orderByService({
             service: this.service,
             table: this.table
           }).subscribe( ordersresp => {
              ordersresp.forEach((ord: any) => {
                if (ord.status_id === 1) {
                  this.sumPrice = this.sumPrice + ord.price;
                }
                const elementOrder = this.orders.find(e => e.id === ord.id);
                if (elementOrder) {
                  elementOrder.orders.push(ord);
                } else {
                  // primer orden
                  this.orders.push({id: ord.id, orders: [ord]});
                }
              });
           });
        }
     });
  }

  public selectTable(evt: Event) {
    this.tableService.setTable(this.table);
  }

  public openService(evt: Event) {
    // Open Service
    const modalRef = this.modalService.open(PubModalServiceComponent, {
      windowClass: 'modal-holder',
      backdrop: 'static'
      // centered: true,
    });
    modalRef.componentInstance.table = this.table;
    modalRef.result.then(
      result => {
        if (typeof (result) === 'object') {
          // abemus calback service
          this.service = result;
        }
      },
      reason => console.log(reason)
    );
  }

  public openOrder(evt: Event) {
    // Siempre seleccionado ante una orden
    this.order.emit({table: this.table, service: this.service});
  }

  public showService(evt: Event) {
    alert('showService');
  }

  public closeService(evt: Event) {
    if (!this.orders.length) {
      //  Cerramos el servicio
      this.tableService.tableServiceClose(this.table.id, this.service.id).subscribe(
        resp => {
          console.log(resp);
          // Reniniciamos los servicios
          this.service = undefined;
          const messge = new Message({
            type: 'success',
            title: `Operación Exitosa`,
            text: `Listo el pollo, en la mesa ${this.table.name} el servicio de ${resp.name} ha sido cerrado correctamente`,
            confirmButton: 'Aceptar',
          });
          this.messagesAlertService.openAlert(messge);
        }
      );
    } else {
      let ordersPendig = [];
      this.orders.forEach(order => {
        ordersPendig = ordersPendig.concat(order.orders.filter(el => el.status_paid === 0));
      });

      if (ordersPendig.length) {
        const messge = new Message({
          type: 'warning',
          title: `Cerrar Servicio`,
          text: `El servicio de la mesa ${this.table.name} aún tiene ordenes por pagar. ¿Segurito que quieres cerrar el servicio?.
          Se debe aún ${this.currencypipe.transform(this.sumPrice, '', '$', '1.0-0')}`,
          confirmButton: 'Aceptar',
          cancelButton: 'Cancelar'
        });
        this.messagesAlertService.openAlert(messge)
        .result.then(
          result => {
            this.tableService.tableServiceClose(this.table.id, this.service.id).subscribe(
              resp => {
                console.log(resp);
              }
            );
          },
          err => {console.log('err'); }
        );

      }

    }
    // 1 consumo de servicio que trae ordenes con cuentas por pagar
  }

  public addMusicTrack(evt: Event) {
    alert('addMusicTrack');
  }

}
