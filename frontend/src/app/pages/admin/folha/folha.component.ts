import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../../services/data.service';

@Component({
  selector: 'app-folha',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px;">
      <div>
        <h2 style="font-family: var(--font-heading); font-size: 1.4rem; font-weight: 700; color: var(--text-primary); margin: 0;">
          Folha de Pagamento & Departamento Pessoal
        </h2>
        <p style="font-size: 0.85rem; color: var(--text-secondary); margin: 4px 0 0;">
          Controle mensal de fechamento de folha, pró-labore, eSocial e FGTS Digital
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
        <select class="filter-select" [(ngModel)]="filtros.competencia" (change)="aplicarFiltros()" style="width: 100%; height: 38px; padding: 0 12px; border: 1px solid var(--border-color); border-radius: var(--radius-sm);">
          <option value="Todas">Todas Competências</option>
          <option value="09/2026">09/2026</option>
          <option value="10/2026">10/2026</option>
        </select>
      </div>

      <div style="min-width: 180px;">
        <select class="filter-select" [(ngModel)]="filtros.situacao" (change)="aplicarFiltros()" style="width: 100%; height: 38px; padding: 0 12px; border: 1px solid var(--border-color); border-radius: var(--radius-sm);">
          <option value="Todas">Todas Situações</option>
          <option value="Aguardando Informações">Aguardando Informações</option>
          <option value="Processamento">Processamento</option>
          <option value="Conferência">Conferência</option>
          <option value="Fechada">Fechada</option>
          <option value="Entregue">Entregue</option>
        </select>
      </div>
    </div>

    <!-- Tabela da Folha -->
    <div class="table-card" style="background: var(--bg-card); border-radius: var(--radius-lg); border: 1px solid var(--border-color); box-shadow: var(--shadow-card); overflow: hidden;">
      <div class="table-responsive">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Empresa</th>
              <th>Competência</th>
              <th>Prazo Previsto</th>
              <th>Funcionários / Pró-labore</th>
              <th>Responsável DP</th>
              <th>Situação da Etapa</th>
              <th style="text-align: right;">Ações de Fechamento</th>
            </tr>
          </thead>
          <tbody>
            @for (item of folhaList; track item.id) {
              <tr>
                <td><strong>{{ getEmpresaNome(item.empresaId) }}</strong></td>
                <td><span class="badge-tag">{{ item.competencia }}</span></td>
                <td>{{ item.prazoPrevisto }}</td>
                <td>{{ item.funcionarios }} colaboradores</td>
                <td>{{ item.responsavel }}</td>
                <td>
                  <span class="status-badge" [ngClass]="getSituacaoClass(item.situacao)">
                    {{ item.situacao }}
                  </span>
                </td>
                <td style="text-align: right;">
                  <button class="btn btn-sm btn-outline-navy" (click)="abrirChecklist(item)" style="margin-right: 6px;">
                    <i class="fa-solid fa-list-check"></i> Checklist
                  </button>
                  @if (item.situacao !== 'Fechada' && item.situacao !== 'Entregue') {
                    <button class="btn btn-sm btn-primary" (click)="avancarStatus(item)">
                      Avançar Etapa
                    </button>
                  }
                </td>
              </tr>
            }
            @if (folhaList.length === 0) {
              <tr>
                <td colspan="7" style="text-align: center; padding: 32px; color: var(--text-muted);">
                  Nenhum registro de folha de pagamento encontrado.
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Checklist -->
    @if (modalChecklistAberto && itemChecklist) {
      <div class="admin-modal-backdrop" style="display: flex; position: fixed; inset: 0; background: rgba(0,0,0,0.55); z-index: 2000; align-items: center; justify-content: center; padding: 20px;">
        <div class="admin-modal modal-md" style="background: var(--bg-card); width: 100%; max-width: 540px; border-radius: var(--radius-lg); overflow: hidden;">
          <div class="modal-header" style="padding: 18px 24px; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
            <h3 style="margin: 0; font-family: var(--font-heading); font-size: 1.2rem;">
              Checklist Folha {{ itemChecklist.competencia }}
            </h3>
            <button class="modal-close-btn" (click)="fecharChecklist()" style="background: none; border: none; font-size: 1.2rem; cursor: pointer;">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
          <div class="modal-body" style="padding: 20px 24px;">
            <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 16px;">
              Empresa: <strong>{{ getEmpresaNome(itemChecklist.empresaId) }}</strong>
            </p>
            <div style="display: flex; flex-direction: column; gap: 10px; font-size: 0.88rem;">
              <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                <input type="checkbox" checked /> Apuração do Pró-labore e Folha de Salários
              </label>
              <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                <input type="checkbox" checked /> Transmissão dos Eventos Periódicos do eSocial (S-1200 / S-1210)
              </label>
              <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                <input type="checkbox" [checked]="itemChecklist.situacao === 'Fechada' || itemChecklist.situacao === 'Entregue'" /> Emissão da Guia FGTS Digital (Pix)
              </label>
              <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                <input type="checkbox" [checked]="itemChecklist.situacao === 'Fechada' || itemChecklist.situacao === 'Entregue'" /> Transmissão da DCTFWeb Previdenciária
              </label>
              <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                <input type="checkbox" [checked]="itemChecklist.situacao === 'Entregue'" /> Envio de Holerites e Recibos ao Cliente
              </label>
            </div>
          </div>
          <div class="modal-footer" style="padding: 14px 24px; border-top: 1px solid var(--border-color); display: flex; justify-content: flex-end;">
            <button class="btn btn-sm btn-primary" (click)="fecharChecklist()">Concluir Visualização</button>
          </div>
        </div>
      </div>
    }
  `
})
export class FolhaComponent implements OnInit {
  private dataService = inject(DataService);

  filtros: any = {
    empresaId: 'Todas',
    competencia: 'Todas',
    situacao: 'Todas'
  };

  folhaList: any[] = [];
  empresas: any[] = [];
  modalChecklistAberto = false;
  itemChecklist: any = null;

  ngOnInit() {
    this.empresas = this.dataService.getEmpresas();
    this.aplicarFiltros();
  }

  aplicarFiltros() {
    this.folhaList = this.dataService.getFolha(this.filtros);
  }

  getEmpresaNome(id: number): string {
    const emp = this.dataService.getEmpresaById(id);
    return emp ? emp.nomeFantasia : 'Geral';
  }

  getSituacaoClass(sit: string): string {
    switch (sit) {
      case 'Fechada':
      case 'Entregue': return 'concluida';
      case 'Processamento':
      case 'Conferência': return 'andamento';
      default: return 'pendente';
    }
  }

  avancarStatus(item: any) {
    const sequence = ['Aguardando Informações', 'Processamento', 'Conferência', 'Fechada', 'Entregue'];
    const idx = sequence.indexOf(item.situacao);
    if (idx !== -1 && idx < sequence.length - 1) {
      this.dataService.updateFolhaStatus(item.id, sequence[idx + 1]);
      this.aplicarFiltros();
    }
  }

  abrirChecklist(item: any) {
    this.itemChecklist = item;
    this.modalChecklistAberto = true;
  }

  fecharChecklist() {
    this.modalChecklistAberto = false;
    this.itemChecklist = null;
  }

  exportarCSV() {
    this.dataService.exportToCSV('folha_pagamento', this.folhaList);
  }
}
