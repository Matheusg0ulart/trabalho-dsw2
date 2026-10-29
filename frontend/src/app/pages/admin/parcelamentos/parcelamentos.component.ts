import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../../services/data.service';

@Component({
  selector: 'app-parcelamentos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px;">
      <div>
        <h2 style="font-family: var(--font-heading); font-size: 1.4rem; font-weight: 700; color: var(--text-primary); margin: 0;">
          Parcelamentos Tributários & Acordos Fiscais
        </h2>
        <p style="font-size: 0.85rem; color: var(--text-secondary); margin: 4px 0 0;">
          Controle de parcelamentos junto à Receita Federal, PGFN, Simples Nacional e Prefeituras
        </p>
      </div>
      <div style="display: flex; gap: 10px;">
        <button type="button" class="btn btn-sm btn-contador" (click)="exportarCSV()">
          <i class="fa-solid fa-file-csv"></i> Exportar CSV
        </button>
      </div>
    </div>

    <!-- Barra de Filtros -->
    <div class="filter-bar" style="display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; align-items: center; background: var(--bg-card); padding: 16px; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
      <div style="min-width: 200px;">
        <select class="filter-select" [(ngModel)]="filtros.empresaId" (change)="aplicarFiltros()" style="width: 100%; height: 38px; padding: 0 12px; border: 1px solid var(--border-color); border-radius: var(--radius-sm);">
          <option value="Todas">Todas as Empresas</option>
          @for (emp of empresas; track emp.id) {
            <option [value]="emp.id">{{ emp.nomeFantasia }}</option>
          }
        </select>
      </div>

      <div style="min-width: 160px;">
        <select class="filter-select" [(ngModel)]="filtros.situacao" (change)="aplicarFiltros()" style="width: 100%; height: 38px; padding: 0 12px; border: 1px solid var(--border-color); border-radius: var(--radius-sm);">
          <option value="Todas">Todas Situações</option>
          <option value="Ativo">Ativo</option>
          <option value="Com Atraso">Com Atraso</option>
          <option value="Encerrado">Encerrado</option>
        </select>
      </div>
    </div>

    <!-- Tabela de Parcelamentos -->
    <div class="table-card" style="background: var(--bg-card); border-radius: var(--radius-lg); border: 1px solid var(--border-color); box-shadow: var(--shadow-card); overflow: hidden;">
      <div class="table-responsive">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Empresa</th>
              <th>Órgão / Acordo</th>
              <th>Progresso de Parcelas</th>
              <th>Valor Parcela</th>
              <th>Saldo Devedor Aprox.</th>
              <th>Situação</th>
              <th style="text-align: right;">Ações</th>
            </tr>
          </thead>
          <tbody>
            @for (p of parcelasList; track p.id) {
              <tr>
                <td><strong>{{ getEmpresaNome(p.empresaId) }}</strong></td>
                <td>
                  <strong>{{ p.orgao }}</strong><br />
                  <span style="font-size: 0.75rem; color: var(--text-muted);">{{ p.numeroProcesso || 'Acordo regular' }}</span>
                </td>
                <td>
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <div style="flex-grow: 1; height: 8px; background: var(--border-color); border-radius: 4px; overflow: hidden; width: 100px;">
                      <div [style.width.%]="(p.parcelasPagas / p.totalParcelas) * 100" style="height: 100%; background: var(--primary);"></div>
                    </div>
                    <span style="font-size: 0.8rem; font-weight: 600;">{{ p.parcelasPagas }} / {{ p.totalParcelas }}</span>
                  </div>
                </td>
                <td>R$ {{ p.valorParcela | number:'1.2-2' }}</td>
                <td>R$ {{ (p.totalParcelas - p.parcelasPagas) * p.valorParcela | number:'1.2-2' }}</td>
                <td>
                  <span class="status-badge" [ngClass]="p.situacao === 'Ativo' ? 'ativa' : (p.situacao === 'Com Atraso' ? 'atrasada' : 'concluida')">
                    {{ p.situacao }}
                  </span>
                </td>
                <td style="text-align: right;">
                  <button class="btn btn-sm btn-outline-navy" (click)="abrirExtrato(p)">
                    <i class="fa-solid fa-receipt"></i> Ver Parcelas
                  </button>
                </td>
              </tr>
            }
            @if (parcelasList.length === 0) {
              <tr>
                <td colspan="7" style="text-align: center; padding: 32px; color: var(--text-muted);">
                  Nenhum parcelamento encontrado.
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Extrato de Parcelas -->
    @if (modalExtratoAberto && parcelamentoSelecionado) {
      <div class="admin-modal-backdrop" style="display: flex; position: fixed; inset: 0; background: rgba(0,0,0,0.55); z-index: 2000; align-items: center; justify-content: center; padding: 20px;">
        <div class="admin-modal modal-md" style="background: var(--bg-card); width: 100%; max-width: 620px; border-radius: var(--radius-lg); overflow: hidden;">
          <div class="modal-header" style="padding: 18px 24px; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
            <div>
              <h3 style="margin: 0; font-family: var(--font-heading); font-size: 1.2rem;">
                Extrato: {{ parcelamentoSelecionado.orgao }}
              </h3>
              <span style="font-size: 0.8rem; color: var(--text-muted);">
                {{ getEmpresaNome(parcelamentoSelecionado.empresaId) }}
              </span>
            </div>
            <button class="modal-close-btn" (click)="fecharExtrato()" style="background: none; border: none; font-size: 1.2rem; cursor: pointer;">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <div class="modal-body" style="padding: 20px 24px; max-height: 60vh; overflow-y: auto;">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Nº</th>
                  <th>Vencimento</th>
                  <th>Valor</th>
                  <th>Status</th>
                  <th style="text-align: right;">Ação</th>
                </tr>
              </thead>
              <tbody>
                @for (parc of parcelamentoSelecionado.parcelasRecentes; track parc.numero) {
                  <tr>
                    <td><strong>#{{ parc.numero }}</strong></td>
                    <td>{{ parc.vencimento }}</td>
                    <td>R$ {{ parc.valor | number:'1.2-2' }}</td>
                    <td>
                      <span class="status-badge" [ngClass]="parc.situacao === 'Paga' ? 'concluida' : 'pendente'">
                        {{ parc.situacao }}
                      </span>
                    </td>
                    <td style="text-align: right;">
                      @if (parc.situacao !== 'Paga') {
                        <button class="btn btn-sm btn-primary" (click)="pagarParcela(parcelamentoSelecionado.id, parc.numero)">
                          Baixar Parcela
                        </button>
                      } @else {
                        <span style="font-size: 0.75rem; color: var(--success);"><i class="fa-solid fa-check"></i> Baixada</span>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <div class="modal-footer" style="padding: 14px 24px; border-top: 1px solid var(--border-color); display: flex; justify-content: flex-end;">
            <button class="btn btn-sm btn-outline-navy" (click)="fecharExtrato()">Fechar</button>
          </div>
        </div>
      </div>
    }
  `
})
export class ParcelamentosComponent implements OnInit {
  private dataService = inject(DataService);

  filtros: any = {
    empresaId: 'Todas',
    situacao: 'Todas'
  };

  parcelasList: any[] = [];
  empresas: any[] = [];
  modalExtratoAberto = false;
  parcelamentoSelecionado: any = null;

  ngOnInit() {
    this.empresas = this.dataService.getEmpresas();
    this.aplicarFiltros();
  }

  aplicarFiltros() {
    this.parcelasList = this.dataService.getParcelamentos(this.filtros);
  }

  getEmpresaNome(id: number): string {
    const emp = this.dataService.getEmpresaById(id);
    return emp ? emp.nomeFantasia : 'Geral';
  }

  abrirExtrato(p: any) {
    this.parcelamentoSelecionado = p;
    this.modalExtratoAberto = true;
  }

  fecharExtrato() {
    this.modalExtratoAberto = false;
    this.parcelamentoSelecionado = null;
  }

  pagarParcela(parcelamentoId: number, numero: number) {
    this.dataService.pagarParcela(parcelamentoId, numero);
    this.aplicarFiltros();
    if (this.parcelamentoSelecionado) {
      this.parcelamentoSelecionado = this.dataService.getParcelamentos().find((p: any) => p.id === parcelamentoId);
    }
  }

  exportarCSV() {
    this.dataService.exportToCSV('parcelamentos_tributarios', this.parcelasList);
  }
}
