import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../../services/data.service';

@Component({
  selector: 'app-notas-fiscais',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px;">
      <div>
        <h2 style="font-family: var(--font-heading); font-size: 1.4rem; font-weight: 700; color: var(--text-primary); margin: 0;">
          Solicitações & Emissão de Notas Fiscais
        </h2>
        <p style="font-size: 0.85rem; color: var(--text-secondary); margin: 4px 0 0;">
          Acompanhamento de pedidos de emissão de NFS-e (Serviços), NF-e (Produtos) e CT-e
        </p>
      </div>
      <div style="display: flex; gap: 10px;">
        <button type="button" class="btn btn-sm btn-contador" (click)="exportarCSV()">
          <i class="fa-solid fa-file-csv"></i> Exportar CSV
        </button>
        <button type="button" class="btn btn-sm btn-primary" (click)="abrirModalNovo()">
          <i class="fa-solid fa-plus"></i> Nova Solicitação
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

      <div style="min-width: 180px;">
        <select class="filter-select" [(ngModel)]="filtros.situacao" (change)="aplicarFiltros()" style="width: 100%; height: 38px; padding: 0 12px; border: 1px solid var(--border-color); border-radius: var(--radius-sm);">
          <option value="Todas">Todas Situações</option>
          <option value="Solicitada">Solicitada</option>
          <option value="Pronta para Emissão">Pronta para Emissão</option>
          <option value="Emitida">Emitida</option>
          <option value="Cancelada">Cancelada</option>
        </select>
      </div>
    </div>

    <!-- Tabela de Notas Fiscais -->
    <div class="table-card" style="background: var(--bg-card); border-radius: var(--radius-lg); border: 1px solid var(--border-color); box-shadow: var(--shadow-card); overflow: hidden;">
      <div class="table-responsive">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Empresa Prestadora</th>
              <th>Tipo</th>
              <th>Tomador / Cliente</th>
              <th>Data Pedido</th>
              <th>Valor Bruto</th>
              <th>Situação</th>
              <th style="text-align: right;">Ações</th>
            </tr>
          </thead>
          <tbody>
            @for (nota of notasList; track nota.id) {
              <tr>
                <td><strong>{{ getEmpresaNome(nota.empresaId) }}</strong></td>
                <td><span class="badge-tag">{{ nota.tipo }}</span></td>
                <td>
                  <strong>{{ nota.tomador }}</strong><br />
                  <span style="font-size: 0.75rem; color: var(--text-muted);">{{ nota.descricaoServico || 'Prestação de serviços' }}</span>
                </td>
                <td>{{ nota.dataSolicitacao }}</td>
                <td><strong style="color: var(--primary);">R$ {{ nota.valor | number:'1.2-2' }}</strong></td>
                <td>
                  <span class="status-badge" [ngClass]="nota.situacao === 'Emitida' ? 'concluida' : 'pendente'">
                    {{ nota.situacao }}
                  </span>
                </td>
                <td style="text-align: right;">
                  @if (nota.situacao !== 'Emitida') {
                    <button class="btn btn-sm btn-primary" (click)="emitir(nota.id)" style="margin-right: 4px;">
                      <i class="fa-solid fa-stamp"></i> Emitir
                    </button>
                  }
                  <button class="btn-icon-action" (click)="editar(nota)" title="Editar">
                    <i class="fa-solid fa-pen"></i>
                  </button>
                </td>
              </tr>
            }
            @if (notasList.length === 0) {
              <tr>
                <td colspan="7" style="text-align: center; padding: 32px; color: var(--text-muted);">
                  Nenhuma nota fiscal encontrada.
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
        <div class="admin-modal modal-md" style="background: var(--bg-card); width: 100%; max-width: 540px; border-radius: var(--radius-lg); overflow: hidden;">
          <div class="modal-header" style="padding: 18px 24px; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
            <h3 style="margin: 0; font-family: var(--font-heading); font-size: 1.2rem;">
              {{ formNota.id ? 'Editar Solicitação de NF' : 'Nova Solicitação de NF' }}
            </h3>
            <button class="modal-close-btn" (click)="fecharModal()" style="background: none; border: none; font-size: 1.2rem; cursor: pointer;">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <form (ngSubmit)="salvar()">
            <div class="modal-body" style="padding: 20px 24px;">
              <div style="margin-bottom: 14px;">
                <label style="display: block; font-size: 0.8rem; font-weight: 600; margin-bottom: 4px;">Empresa Emissora *</label>
                <select [(ngModel)]="formNota.empresaId" name="empresaId" required style="width: 100%; height: 38px; border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 0 10px;">
                  @for (emp of empresas; track emp.id) {
                    <option [value]="emp.id">{{ emp.nomeFantasia }}</option>
                  }
                </select>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;">
                <div>
                  <label style="display: block; font-size: 0.8rem; font-weight: 600; margin-bottom: 4px;">Tipo de Documento</label>
                  <select [(ngModel)]="formNota.tipo" name="tipo" style="width: 100%; height: 38px; border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 0 10px;">
                    <option value="NFS-e">NFS-e (Serviços)</option>
                    <option value="NF-e">NF-e (Mercadorias)</option>
                    <option value="CT-e">CT-e (Transporte)</option>
                  </select>
                </div>
                <div>
                  <label style="display: block; font-size: 0.8rem; font-weight: 600; margin-bottom: 4px;">Valor Bruto (R$) *</label>
                  <input type="number" step="0.01" [(ngModel)]="formNota.valor" name="valor" required placeholder="0.00" style="width: 100%; height: 38px; border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 0 10px;" />
                </div>
              </div>

              <div style="margin-bottom: 14px;">
                <label style="display: block; font-size: 0.8rem; font-weight: 600; margin-bottom: 4px;">Tomador / Cliente Destinatário *</label>
                <input type="text" [(ngModel)]="formNota.tomador" name="tomador" required placeholder="Nome ou Razão Social do Tomador" style="width: 100%; height: 38px; border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 0 10px;" />
              </div>

              <div style="margin-bottom: 14px;">
                <label style="display: block; font-size: 0.8rem; font-weight: 600; margin-bottom: 4px;">Descrição dos Serviços / Itens</label>
                <textarea [(ngModel)]="formNota.descricaoServico" name="descricaoServico" rows="3" placeholder="Discriminação detalhada..." style="width: 100%; border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 8px 10px;"></textarea>
              </div>
            </div>

            <div class="modal-footer" style="padding: 14px 24px; border-top: 1px solid var(--border-color); display: flex; justify-content: flex-end; gap: 10px;">
              <button type="button" class="btn btn-sm btn-outline-navy" (click)="fecharModal()">Cancelar</button>
              <button type="submit" class="btn btn-sm btn-primary">Salvar Solicitação</button>
            </div>
          </form>
        </div>
      </div>
    }
  `
})
export class NotasFiscaisComponent implements OnInit {
  private dataService = inject(DataService);

  filtros: any = {
    empresaId: 'Todas',
    situacao: 'Todas'
  };

  notasList: any[] = [];
  empresas: any[] = [];
  modalAberto = false;
  formNota: any = {};

  ngOnInit() {
    this.empresas = this.dataService.getEmpresas();
    this.aplicarFiltros();
  }

  aplicarFiltros() {
    this.notasList = this.dataService.getNotas(this.filtros);
  }

  getEmpresaNome(id: number): string {
    const emp = this.dataService.getEmpresaById(id);
    return emp ? emp.nomeFantasia : 'Geral';
  }

  emitir(id: number) {
    this.dataService.emitirNota(id);
    this.aplicarFiltros();
  }

  abrirModalNovo() {
    this.formNota = {
      empresaId: this.empresas[0]?.id || 1,
      tipo: 'NFS-e',
      situacao: 'Solicitada'
    };
    this.modalAberto = true;
  }

  editar(nota: any) {
    this.formNota = { ...nota };
    this.modalAberto = true;
  }

  fecharModal() {
    this.modalAberto = false;
    this.formNota = {};
  }

  salvar() {
    this.dataService.saveNota(this.formNota);
    this.fecharModal();
    this.aplicarFiltros();
  }

  exportarCSV() {
    this.dataService.exportToCSV('solicitacoes_notas_fiscais', this.notasList);
  }
}
