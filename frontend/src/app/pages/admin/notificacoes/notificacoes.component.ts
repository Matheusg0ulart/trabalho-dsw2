import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DataService } from '../../../services/data.service';

@Component({
  selector: 'app-notificacoes',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <!-- Barra de Ações & Filtros -->
    <div class="action-toolbar">
      <div class="filter-group">
        <select [(ngModel)]="filtroTipo" (ngModelChange)="filtrar()" class="filter-select">
          <option value="Todas">Severidade: Todas</option>
          <option value="critico">Críticas / Atrasadas</option>
          <option value="alerta">Alertas & Vencimentos</option>
          <option value="info">Informativas</option>
          <option value="sucesso">Conclusões com Sucesso</option>
        </select>

        <select [(ngModel)]="filtroStatus" (ngModelChange)="filtrar()" class="filter-select">
          <option value="Todas">Status: Todas</option>
          <option value="naoLidas">Apenas Não Lidas</option>
          <option value="lidas">Lidas</option>
        </select>
      </div>

      <div style="display: flex; gap: 10px;">
        <button type="button" class="btn btn-sm btn-contador" (click)="marcarTodasComoLidas()">
          <i class="fa-solid fa-check-double"></i> Marcar Todas como Lidas
        </button>
      </div>
    </div>

    <!-- Lista de Notificações -->
    <div class="notificacoes-container">
      @if (notificacoesFiltradas.length === 0) {
        <div class="table-card" style="padding: 50px; text-align: center; color: var(--text-muted);">
          <i class="fa-regular fa-bell-slash" style="font-size: 2.5rem; margin-bottom: 12px; display: block;"></i>
          <h3 style="margin: 0 0 4px; color: var(--text-primary); font-size: 1.15rem;">Nenhuma notificação encontrada</h3>
          <p style="font-size: 0.85rem; margin: 0;">Todas as pendências e avisos estão em dia no momento.</p>
        </div>
      } @else {
        @for (n of notificacoesFiltradas; track n.id) {
          <div
            class="notif-card-item"
            [class.unread]="!n.lida"
            [ngClass]="n.tipo"
          >
            <div style="display: flex; gap: 16px; align-items: flex-start; flex: 1;">
              <div style="font-size: 1.4rem; line-height: 1; margin-top: 2px;">
                @if (n.tipo === 'critico') {
                  <i class="fa-solid fa-circle-exclamation" style="color: var(--danger);"></i>
                } @else if (n.tipo === 'alerta') {
                  <i class="fa-solid fa-triangle-exclamation" style="color: var(--warning);"></i>
                } @else if (n.tipo === 'sucesso') {
                  <i class="fa-solid fa-circle-check" style="color: var(--success);"></i>
                } @else {
                  <i class="fa-solid fa-circle-info" style="color: var(--primary);"></i>
                }
              </div>

              <div style="flex: 1;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; flex-wrap: wrap; gap: 8px;">
                  <h4 style="margin: 0; font-size: 0.95rem; font-weight: 700; color: var(--text-primary);">
                    {{ n.titulo }}
                  </h4>
                  <span style="font-size: 0.75rem; color: var(--text-muted);">
                    {{ formatarData(n.data) }}
                  </span>
                </div>
                <p style="margin: 0 0 10px; font-size: 0.85rem; color: var(--text-secondary); line-height: 1.45;">
                  {{ n.mensagem }}
                </p>

                <div style="display: flex; gap: 12px; align-items: center;">
                  @if (n.link) {
                    <a [routerLink]="n.link" class="btn btn-sm btn-secondary" style="font-size: 0.75rem; padding: 4px 10px;">
                      Visualizar Módulo <i class="fa-solid fa-arrow-right" style="margin-left: 4px;"></i>
                    </a>
                  }
                  @if (!n.lida) {
                    <button type="button" class="btn btn-sm" style="font-size: 0.75rem; background: none; border: none; color: var(--primary); cursor: pointer; padding: 0;" (click)="marcarComoLida(n.id)">
                      <i class="fa-solid fa-check"></i> Marcar como lida
                    </button>
                  }
                </div>
              </div>
            </div>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .notif-card-item {
      background-color: #ffffff;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      padding: 20px 24px;
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 18px;
      margin-bottom: 14px;
      transition: all 0.2s ease;
    }

    .notif-card-item.unread {
      background-color: #f8fbff;
      border-left: 4px solid var(--primary);
    }

    .notif-card-item.critico {
      border-left: 4px solid var(--danger);
    }

    .notif-card-item.alerta {
      border-left: 4px solid var(--warning);
    }

    .notif-card-item.sucesso {
      border-left: 4px solid var(--success);
    }
  `]
})
export class NotificacoesComponent implements OnInit {
  private dataService = inject(DataService);

  filtroTipo: string = 'Todas';
  filtroStatus: string = 'naoLidas';

  notificacoesFiltradas: any[] = [];

  ngOnInit() {
    this.filtrar();
  }

  filtrar() {
    let list = this.dataService.getNotificacoes();

    if (this.filtroTipo !== 'Todas') {
      list = list.filter((n: any) => n.tipo === this.filtroTipo);
    }

    if (this.filtroStatus === 'naoLidas') {
      list = list.filter((n: any) => !n.lida);
    } else if (this.filtroStatus === 'lidas') {
      list = list.filter((n: any) => n.lida);
    }

    this.notificacoesFiltradas = list;
  }

  marcarComoLida(id: number) {
    this.dataService.marcarNotificacaoComoLida(id);
    this.filtrar();
  }

  marcarTodasComoLidas() {
    this.dataService.marcarTodasNotificacoesComoLidas();
    this.filtrar();
  }

  formatarData(dataStr: string): string {
    if (!dataStr) return '';
    if (dataStr.includes('T')) {
      const d = new Date(dataStr);
      return d.toLocaleDateString('pt-BR') + ' às ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    }
    const [y, m, d] = dataStr.split('-');
    return `${d}/${m}/${y}`;
  }
}
