import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DataService } from '../../../services/data.service';

@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <!-- Barra de Filtros -->
    <div class="action-toolbar">
      <div class="filter-group">
        <select [(ngModel)]="filtroEmpresa" (ngModelChange)="filtrarEventos()" class="filter-select">
          <option value="Todas">Empresa: Todas</option>
          @for (emp of empresas; track emp.id) {
            <option [value]="emp.id">{{ emp.nomeFantasia }}</option>
          }
        </select>

        <select [(ngModel)]="filtroCategoria" (ngModelChange)="filtrarEventos()" class="filter-select">
          <option value="Todas">Categoria de Evento: Todas</option>
          <option value="Fiscal">Impostos & Fiscal</option>
          <option value="Folha">Folha de Pagamento</option>
          <option value="Serviços">Serviços & Tarefas</option>
          <option value="Parcelamentos">Parcelamentos</option>
        </select>
      </div>

      <div style="display: flex; align-items: center; gap: 14px; font-size: 0.8rem; color: var(--text-secondary); flex-wrap: wrap;">
        <span><i class="fa-solid fa-circle" style="color: var(--primary);"></i> Fiscal</span>
        <span><i class="fa-solid fa-circle" style="color: var(--info);"></i> Folha</span>
        <span><i class="fa-solid fa-circle" style="color: var(--purple);"></i> Tarefas</span>
        <span><i class="fa-solid fa-circle" style="color: var(--warning);"></i> Parcelamento</span>
      </div>
    </div>

    <!-- Grade do Calendário Mensal (Outubro de 2026) -->
    <div class="table-card" style="padding: 24px; margin-bottom: 24px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px;">
        <div>
          <h2 style="font-family: var(--font-heading); font-size: 1.3rem; color: var(--text-primary); font-weight: 700; margin: 0;">
            Outubro de 2026
          </h2>
          <span style="font-size: 0.8rem; color: var(--text-muted);">Visualização mensal consolidada de prazos do escritório</span>
        </div>
        <div style="display: flex; gap: 6px;">
          <span class="badge-tag" style="font-size: 0.72rem;">Mês Ativo</span>
        </div>
      </div>

      <div class="calendar-grid">
        <div class="cal-header-cell">Dom</div>
        <div class="cal-header-cell">Seg</div>
        <div class="cal-header-cell">Ter</div>
        <div class="cal-header-cell">Qua</div>
        <div class="cal-header-cell">Qui</div>
        <div class="cal-header-cell">Sex</div>
        <div class="cal-header-cell">Sáb</div>

        <!-- Linha 1 -->
        <div class="cal-day-cell other-month"><span class="cal-day-num">27</span></div>
        <div class="cal-day-cell other-month"><span class="cal-day-num">28</span></div>
        <div class="cal-day-cell other-month"><span class="cal-day-num">29</span></div>
        <div class="cal-day-cell other-month"><span class="cal-day-num">30</span></div>
        <div class="cal-day-cell"><span class="cal-day-num">1</span></div>
        <div class="cal-day-cell"><span class="cal-day-num">2</span></div>
        <div class="cal-day-cell"><span class="cal-day-num">3</span></div>

        <!-- Linha 2 -->
        <div class="cal-day-cell"><span class="cal-day-num">4</span></div>
        <div class="cal-day-cell"><span class="cal-day-num">5</span></div>
        <div class="cal-day-cell"><span class="cal-day-num">6</span></div>
        <div class="cal-day-cell">
          <span class="cal-day-num">7</span>
          <a routerLink="/admin/folha" class="cal-event-pill folha" title="Fechamento da folha e FGTS">Folha 09/26</a>
        </div>
        <div class="cal-day-cell"><span class="cal-day-num">8</span></div>
        <div class="cal-day-cell"><span class="cal-day-num">9</span></div>
        <div class="cal-day-cell"><span class="cal-day-num">10</span></div>

        <!-- Linha 3 -->
        <div class="cal-day-cell"><span class="cal-day-num">11</span></div>
        <div class="cal-day-cell"><span class="cal-day-num">12</span></div>
        <div class="cal-day-cell"><span class="cal-day-num">13</span></div>
        <div class="cal-day-cell"><span class="cal-day-num">14</span></div>
        <div class="cal-day-cell">
          <span class="cal-day-num">15</span>
          <a routerLink="/admin/impostos" class="cal-event-pill imposto" title="EFD-Reinf e DCTFWeb">DCTFWeb / Reinf</a>
        </div>
        <div class="cal-day-cell">
          <span class="cal-day-num">16</span>
          <a routerLink="/admin/servicos" class="cal-event-pill servico">CND Federal Inovare</a>
        </div>
        <div class="cal-day-cell"><span class="cal-day-num">17</span></div>

        <!-- Linha 4 -->
        <div class="cal-day-cell"><span class="cal-day-num">18</span></div>
        <div class="cal-day-cell"><span class="cal-day-num">19</span></div>
        <div class="cal-day-cell today">
          <span class="cal-day-num" style="color: var(--primary);">20 (Hoje)</span>
          <a routerLink="/admin/impostos" class="cal-event-pill imposto">DAS Simples Nacional</a>
        </div>
        <div class="cal-day-cell"><span class="cal-day-num">21</span></div>
        <div class="cal-day-cell">
          <span class="cal-day-num">22</span>
          <a routerLink="/admin/servicos" class="cal-event-pill servico">SEFAZ Pão D'Ouro</a>
        </div>
        <div class="cal-day-cell"><span class="cal-day-num">23</span></div>
        <div class="cal-day-cell">
          <span class="cal-day-num">24</span>
          <a routerLink="/admin/servicos" class="cal-event-pill servico">Abertura Nexus SLU</a>
        </div>

        <!-- Linha 5 -->
        <div class="cal-day-cell">
          <span class="cal-day-num">25</span>
          <a routerLink="/admin/impostos" class="cal-event-pill imposto">PIS/COFINS & ICMS</a>
          <a routerLink="/admin/parcelamentos" class="cal-event-pill parcelamento">Parc. Simples 30/60</a>
        </div>
        <div class="cal-day-cell"><span class="cal-day-num">26</span></div>
        <div class="cal-day-cell"><span class="cal-day-num">27</span></div>
        <div class="cal-day-cell">
          <span class="cal-day-num">28</span>
          <a routerLink="/admin/parcelamentos" class="cal-event-pill parcelamento">PPI PMSP 36/36</a>
        </div>
        <div class="cal-day-cell"><span class="cal-day-num">29</span></div>
        <div class="cal-day-cell">
          <span class="cal-day-num">30</span>
          <a routerLink="/admin/parcelamentos" class="cal-event-pill parcelamento">Transação RFB Inovare</a>
        </div>
        <div class="cal-day-cell">
          <span class="cal-day-num">31</span>
          <a routerLink="/admin/impostos" class="cal-event-pill imposto">IRPJ / CSLL 3º Tri</a>
        </div>
      </div>
    </div>

    <!-- Lista Cronológica dos Próximos Eventos -->
    <div class="table-card" style="padding: 24px;">
      <h3 style="font-family: var(--font-heading); font-size: 1.15rem; color: var(--text-primary); font-weight: 700; margin-bottom: 4px;">
        <i class="fa-solid fa-list-check" style="color: var(--primary); margin-right: 6px;"></i>
        Linha do Tempo dos Próximos Compromissos & Prazos
      </h3>
      <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 18px;">Itens sincronizados com os dados de impostos, tarefas e acordos fiscais</p>

      <div class="table-responsive">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Categoria</th>
              <th>Título do Compromisso</th>
              <th>Detalhes & Valores</th>
              <th>Situação</th>
              <th style="text-align: right;">Ação</th>
            </tr>
          </thead>
          <tbody>
            @if (eventosFiltrados.length === 0) {
              <tr>
                <td colspan="6" style="text-align: center; padding: 40px; color: var(--text-muted);">
                  <i class="fa-regular fa-calendar-xmark" style="font-size: 2rem; margin-bottom: 8px; display: block;"></i>
                  Nenhum evento encontrado para os filtros selecionados.
                </td>
              </tr>
            } @else {
              @for (ev of eventosFiltrados; track ev.id) {
                <tr [style.background-color]="isAtrasado(ev) ? '#fffaf0' : ''">
                  <td>
                    <strong [style.color]="isAtrasado(ev) ? 'var(--danger)' : 'var(--text-primary)'" style="font-size: 0.9rem;">
                      {{ formatarData(ev.data) }}
                      @if (isAtrasado(ev)) {
                        <i class="fa-solid fa-triangle-exclamation text-danger" style="margin-left: 4px;"></i>
                      }
                    </strong>
                  </td>
                  <td><span class="badge-tag" style="font-size: 0.7rem;">{{ ev.categoria }}</span></td>
                  <td>
                    <strong style="color: var(--navy-900); font-size: 0.88rem;">{{ ev.titulo }}</strong>
                  </td>
                  <td><span style="font-size: 0.8rem; color: var(--text-secondary);">{{ ev.detalhes }}</span></td>
                  <td>
                    <span class="status-badge" [ngClass]="ev.situacao.toLowerCase().split(' ').join('-')">
                      {{ ev.situacao }}
                    </span>
                  </td>
                  <td style="text-align: right;">
                    <a [routerLink]="ev.url" class="btn-icon-action" title="Abrir Módulo">
                      <i class="fa-solid fa-arrow-right"></i>
                    </a>
                  </td>
                </tr>
              }
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .calendar-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 1px;
      background-color: var(--border-color);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      overflow: hidden;
    }

    .cal-header-cell {
      background-color: #f8fafc;
      padding: 12px;
      text-align: center;
      font-weight: 700;
      font-size: 0.78rem;
      color: var(--text-secondary);
      text-transform: uppercase;
    }

    .cal-day-cell {
      background-color: #ffffff;
      min-height: 95px;
      padding: 8px;
      display: flex;
      flex-direction: column;
      gap: 4px;
      transition: background 0.15s ease;
    }

    .cal-day-cell:hover {
      background-color: #f8fafc;
    }

    .cal-day-cell.other-month {
      background-color: #fdfdfd;
      opacity: 0.45;
    }

    .cal-day-cell.today {
      background-color: #f0f7ff;
      border: 2px solid var(--primary);
    }

    .cal-day-num {
      font-size: 0.82rem;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 2px;
    }

    .cal-event-pill {
      font-size: 0.68rem;
      font-weight: 600;
      padding: 2px 6px;
      border-radius: 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      cursor: pointer;
      text-decoration: none;
      display: block;
    }

    .cal-event-pill.imposto { background: var(--primary-light); color: var(--primary); }
    .cal-event-pill.folha { background: var(--info-light); color: var(--info); }
    .cal-event-pill.servico { background: var(--purple-light); color: var(--purple); }
    .cal-event-pill.parcelamento { background: var(--warning-light); color: #b45309; }
  `]
})
export class AgendaComponent implements OnInit {
  private dataService = inject(DataService);

  empresas: any[] = [];
  eventosFiltrados: any[] = [];

  filtroEmpresa: string = 'Todas';
  filtroCategoria: string = 'Todas';

  ngOnInit() {
    this.empresas = this.dataService.getEmpresas();
    this.filtrarEventos();
  }

  filtrarEventos() {
    this.eventosFiltrados = this.dataService.getAgendaEventos({
      empresaId: this.filtroEmpresa,
      categoria: this.filtroCategoria
    });
  }

  isAtrasado(ev: any): boolean {
    return ev.data < '2026-10-20' && ev.situacao !== 'Concluído' && ev.situacao !== 'Concluída' && ev.situacao !== 'Paga';
  }

  formatarData(dataStr: string): string {
    if (!dataStr) return '-';
    const [y, m, d] = dataStr.split('-');
    return `${d}/${m}/${y}`;
  }
}
