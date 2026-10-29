import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../../services/data.service';

@Component({
  selector: 'app-servicos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px;">
      <div>
        <h2 style="font-family: var(--font-heading); font-size: 1.4rem; font-weight: 700; color: var(--text-primary); margin: 0;">
          Serviços & Demandas Societárias
        </h2>
        <p style="font-size: 0.85rem; color: var(--text-secondary); margin: 4px 0 0;">
          Acompanhamento de aberturas, alterações contratuais, emissão de CNDs e demandas extraordinárias
        </p>
      </div>
      <div style="display: flex; gap: 10px;">
        <button type="button" class="btn btn-sm btn-contador" (click)="exportarCSV()">
          <i class="fa-solid fa-file-csv"></i> Exportar CSV
        </button>
        <button type="button" class="btn btn-sm btn-primary" (click)="abrirModalNovo()">
          <i class="fa-solid fa-plus"></i> Nova Demanda
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

      <div style="min-width: 150px;">
        <select class="filter-select" [(ngModel)]="filtros.prioridade" (change)="aplicarFiltros()" style="width: 100%; height: 38px; padding: 0 12px; border: 1px solid var(--border-color); border-radius: var(--radius-sm);">
          <option value="Todas">Todas Prioridades</option>
          <option value="Urgente">Urgente</option>
          <option value="Alta">Alta</option>
          <option value="Normal">Normal</option>
        </select>
      </div>

      <div style="min-width: 160px;">
        <select class="filter-select" [(ngModel)]="filtros.situacao" (change)="aplicarFiltros()" style="width: 100%; height: 38px; padding: 0 12px; border: 1px solid var(--border-color); border-radius: var(--radius-sm);">
          <option value="Todas">Todas Situações</option>
          <option value="Aberto">Aberto</option>
          <option value="Em Andamento">Em Andamento</option>
          <option value="Concluído">Concluído</option>
        </select>
      </div>
    </div>

    <!-- Tabela de Serviços -->
    <div class="table-card" style="background: var(--bg-card); border-radius: var(--radius-lg); border: 1px solid var(--border-color); box-shadow: var(--shadow-card); overflow: hidden;">
      <div class="table-responsive">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Demanda / Tarefa</th>
              <th>Empresa</th>
              <th>Prazo de Entrega</th>
              <th>Prioridade</th>
              <th>Responsável</th>
              <th>Situação</th>
              <th style="text-align: right;">Ações</th>
            </tr>
          </thead>
          <tbody>
            @for (s of servicosList; track s.id) {
              <tr>
                <td>
                  <strong>{{ s.titulo }}</strong><br />
                  <span style="font-size: 0.75rem; color: var(--text-muted);">{{ s.descricao }}</span>
                </td>
                <td>{{ getEmpresaNome(s.empresaId) }}</td>
                <td>
                  <strong [style.color]="s.prazoEntrega < '2026-10-20' && s.situacao !== 'Concluído' ? 'var(--danger)' : 'inherit'">
                    {{ s.prazoEntrega }}
                  </strong>
                </td>
                <td>
                  <span class="badge-tag" [ngClass]="getPrioridadeClass(s.prioridade)">
                    {{ s.prioridade }}
                  </span>
                </td>
                <td>{{ s.responsavel }}</td>
                <td>
                  <span class="status-badge" [ngClass]="s.situacao === 'Concluído' ? 'concluida' : 'pendente'">
                    {{ s.situacao }}
                  </span>
                </td>
                <td style="text-align: right;">
                  @if (s.situacao !== 'Concluído') {
                    <button class="btn-icon-action" (click)="concluir(s.id)" title="Concluir Demanda" style="color: var(--success); margin-right: 4px;">
                      <i class="fa-solid fa-check"></i>
                    </button>
                  }
                  <button class="btn-icon-action" (click)="editar(s)" title="Editar">
                    <i class="fa-solid fa-pen"></i>
                  </button>
                </td>
              </tr>
            }
            @if (servicosList.length === 0) {
              <tr>
                <td colspan="7" style="text-align: center; padding: 32px; color: var(--text-muted);">
                  Nenhum serviço encontrado.
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Form -->
    @if (modalAberto) {
      <div class="admin-modal-backdrop" style="display: flex; position: fixed; inset: 0; background: rgba(0,0,0,0.55); z-index: 2000; align-items: center; justify-content: center; padding: 20px;">
        <div class="admin-modal modal-md" style="background: var(--bg-card); width: 100%; max-width: 560px; border-radius: var(--radius-lg); overflow: hidden;">
          <div class="modal-header" style="padding: 18px 24px; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
            <h3 style="margin: 0; font-family: var(--font-heading); font-size: 1.25rem;">
              {{ formServico.id ? 'Editar Serviço' : 'Nova Demanda' }}
            </h3>
            <button class="modal-close-btn" (click)="fecharModal()" style="background: none; border: none; font-size: 1.2rem; cursor: pointer;">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <form (ngSubmit)="salvar()">
            <div class="modal-body" style="padding: 20px 24px;">
              <div style="margin-bottom: 14px;">
                <label style="display: block; font-size: 0.8rem; font-weight: 600; margin-bottom: 4px;">Empresa *</label>
                <select [(ngModel)]="formServico.empresaId" name="empresaId" required style="width: 100%; height: 38px; border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 0 10px;">
                  @for (emp of empresas; track emp.id) {
                    <option [value]="emp.id">{{ emp.nomeFantasia }}</option>
                  }
                </select>
              </div>

              <div style="margin-bottom: 14px;">
                <label style="display: block; font-size: 0.8rem; font-weight: 600; margin-bottom: 4px;">Título da Tarefa *</label>
                <input type="text" [(ngModel)]="formServico.titulo" name="titulo" required placeholder="Ex: Emissão de CND Federal, Alteração de CNAE..." style="width: 100%; height: 38px; border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 0 10px;" />
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;">
                <div>
                  <label style="display: block; font-size: 0.8rem; font-weight: 600; margin-bottom: 4px;">Prazo de Entrega *</label>
                  <input type="date" [(ngModel)]="formServico.prazoEntrega" name="prazoEntrega" required style="width: 100%; height: 38px; border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 0 10px;" />
                </div>
                <div>
                  <label style="display: block; font-size: 0.8rem; font-weight: 600; margin-bottom: 4px;">Prioridade</label>
                  <select [(ngModel)]="formServico.prioridade" name="prioridade" style="width: 100%; height: 38px; border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 0 10px;">
                    <option value="Normal">Normal</option>
                    <option value="Alta">Alta</option>
                    <option value="Urgente">Urgente</option>
                  </select>
                </div>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;">
                <div>
                  <label style="display: block; font-size: 0.8rem; font-weight: 600; margin-bottom: 4px;">Responsável</label>
                  <input type="text" [(ngModel)]="formServico.responsavel" name="responsavel" placeholder="Waldo Ferreira" style="width: 100%; height: 38px; border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 0 10px;" />
                </div>
                <div>
                  <label style="display: block; font-size: 0.8rem; font-weight: 600; margin-bottom: 4px;">Situação</label>
                  <select [(ngModel)]="formServico.situacao" name="situacao" style="width: 100%; height: 38px; border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 0 10px;">
                    <option value="Aberto">Aberto</option>
                    <option value="Em Andamento">Em Andamento</option>
                    <option value="Concluído">Concluído</option>
                  </select>
                </div>
              </div>
            </div>

            <div class="modal-footer" style="padding: 14px 24px; border-top: 1px solid var(--border-color); display: flex; justify-content: flex-end; gap: 10px;">
              <button type="button" class="btn btn-sm btn-outline-navy" (click)="fecharModal()">Cancelar</button>
              <button type="submit" class="btn btn-sm btn-primary">Salvar</button>
            </div>
          </form>
        </div>
      </div>
    }
  `
})
export class ServicosComponent implements OnInit {
  private dataService = inject(DataService);

  filtros: any = {
    empresaId: 'Todas',
    prioridade: 'Todas',
    situacao: 'Todas'
  };

  servicosList: any[] = [];
  empresas: any[] = [];
  modalAberto = false;
  formServico: any = {};

  ngOnInit() {
    this.empresas = this.dataService.getEmpresas();
    this.aplicarFiltros();
  }

  aplicarFiltros() {
    this.servicosList = this.dataService.getServicos(this.filtros);
  }

  getEmpresaNome(id: number): string {
    const emp = this.dataService.getEmpresaById(id);
    return emp ? emp.nomeFantasia : 'Geral';
  }

  getPrioridadeClass(pri: string): string {
    switch (pri) {
      case 'Urgente': return 'danger';
      case 'Alta': return 'warning';
      default: return 'blue-tag';
    }
  }

  concluir(id: number) {
    this.dataService.concluirServico(id);
    this.aplicarFiltros();
  }

  abrirModalNovo() {
    this.formServico = {
      empresaId: this.empresas[0]?.id || 1,
      prioridade: 'Normal',
      situacao: 'Aberto',
      responsavel: 'Waldo Ferreira',
      prazoEntrega: '2026-10-30'
    };
    this.modalAberto = true;
  }

  editar(s: any) {
    this.formServico = { ...s };
    this.modalAberto = true;
  }

  fecharModal() {
    this.modalAberto = false;
    this.formServico = {};
  }

  salvar() {
    this.dataService.saveServico(this.formServico);
    this.fecharModal();
    this.aplicarFiltros();
  }

  exportarCSV() {
    this.dataService.exportToCSV('servicos_demandas', this.servicosList);
  }
}
