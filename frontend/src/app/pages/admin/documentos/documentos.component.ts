import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../../services/data.service';

@Component({
  selector: 'app-documentos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Barra de Ações & Filtros -->
    <div class="action-toolbar">
      <div class="filter-group">
        <select [(ngModel)]="filtroEmpresa" (ngModelChange)="renderizar()" class="filter-select">
          <option value="Todas">Empresa: Todas</option>
          @for (emp of empresas; track emp.id) {
            <option [value]="emp.id">{{ emp.nomeFantasia }}</option>
          }
        </select>

        <select [(ngModel)]="filtroCategoria" (ngModelChange)="renderizar()" class="filter-select">
          <option value="Todas">Categoria: Todas</option>
          <option value="Contábil">Contábil / Financeiro</option>
          <option value="Fiscal">Fiscal</option>
          <option value="Pessoal">Departamento Pessoal</option>
          <option value="Societário">Societário / Cadastral</option>
        </select>

        <select [(ngModel)]="filtroSituacao" (ngModelChange)="renderizar()" class="filter-select">
          <option value="Todas">Situação: Todas</option>
          <option value="Solicitado">Solicitado</option>
          <option value="Aguardando Cliente">Aguardando Cliente</option>
          <option value="Recebido">Recebido</option>
          <option value="Em Conferência">Em Conferência</option>
          <option value="Aprovado">Aprovado</option>
          <option value="Pendente de Correção">Pendente de Correção</option>
        </select>
      </div>

      <div style="display: flex; gap: 10px;">
        <button type="button" class="btn btn-sm btn-contador" (click)="exportarCSV()">
          <i class="fa-solid fa-file-csv"></i> Exportar CSV
        </button>
        <button type="button" class="btn btn-sm btn-primary" (click)="abrirModal()">
          <i class="fa-solid fa-plus"></i> Solicitar Novo Documento
        </button>
      </div>
    </div>

    <!-- Tabela de Documentos -->
    <div class="table-card">
      <div class="table-responsive">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Empresa</th>
              <th>Documento Solicitado</th>
              <th>Categoria</th>
              <th>Data Solicitação</th>
              <th>Prazo Envio</th>
              <th>Responsável</th>
              <th>Arquivo / Anexo</th>
              <th>Situação</th>
              <th style="text-align: right;">Ações</th>
            </tr>
          </thead>
          <tbody>
            @if (documentos.length === 0) {
              <tr>
                <td colspan="9" style="text-align: center; padding: 40px; color: var(--text-muted);">
                  <i class="fa-solid fa-folder-open" style="font-size: 2rem; margin-bottom: 8px; display: block;"></i>
                  Nenhum documento encontrado com os filtros selecionados.
                </td>
              </tr>
            }
            @for (d of documentos; track d.id) {
              <tr [style.background-color]="isAtrasado(d) ? '#fffaf0' : ''">
                <td><strong>{{ getEmpresaNome(d.empresaId) }}</strong></td>
                <td>
                  <strong style="color: var(--navy-900); font-size: 0.88rem;">{{ d.nome }}</strong><br>
                  <span style="font-size: 0.74rem; color: var(--text-muted);">{{ d.observacoes || '' }}</span>
                </td>
                <td><span class="badge-tag" style="font-size: 0.7rem;">{{ d.categoria }}</span></td>
                <td>{{ formatDate(d.dataSolicitacao) }}</td>
                <td>
                  <strong [style.color]="isAtrasado(d) ? 'var(--danger)' : 'var(--text-primary)'">
                    {{ formatDate(d.prazoEnvio) }}
                    @if (isAtrasado(d)) {
                      <i class="fa-solid fa-triangle-exclamation text-danger" style="margin-left: 4px;"></i>
                    }
                  </strong>
                </td>
                <td><span style="font-size: 0.82rem; color: var(--text-secondary);">{{ d.responsavel }}</span></td>
                <td>
                  @if (d.arquivoMock) {
                    <div style="display: inline-flex; align-items: center; gap: 6px; font-size: 0.78rem; color: var(--primary); background: var(--primary-light); padding: 4px 8px; border-radius: 4px;">
                      <i class="fa-solid fa-file-lines"></i>
                      <span>{{ d.arquivoMock }}</span>
                      <span style="color: var(--text-muted); font-size: 0.7rem;">({{ d.tamanhoMock || 'Demo' }})</span>
                    </div>
                  } @else {
                    <span style="font-size: 0.75rem; color: var(--text-muted);">Não anexado</span>
                  }
                </td>
                <td>
                  <span class="status-badge" [ngClass]="d.situacao.toLowerCase().split(' ').join('-')">
                    {{ d.situacao }}
                  </span>
                </td>
                <td style="text-align: right;">
                  <div class="action-btn-group" style="justify-content: flex-end;">
                    @if (d.situacao !== 'Aprovado') {
                      <button type="button" class="btn-icon-action success" title="Aprovar Documento" (click)="aprovarDoc(d.id)">
                        <i class="fa-solid fa-check"></i>
                      </button>
                    }
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>

    <!-- MODAL: SOLICITAR DOCUMENTO -->
    @if (showModal) {
      <div class="admin-modal-backdrop" (click)="fecharModal()">
        <div class="admin-modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Solicitar Documento ao Cliente</h3>
            <button class="modal-close-btn" (click)="fecharModal()"><i class="fa-solid fa-xmark"></i></button>
          </div>

          <form (ngSubmit)="salvarDoc()">
            <div class="modal-body">
              <div class="form-field">
                <label for="campoEmpresaId">Empresa Destinatária *</label>
                <select [(ngModel)]="formDoc.empresaId" name="empresaId" required class="filter-select" style="width: 100%;">
                  @for (emp of empresas; track emp.id) {
                    <option [value]="emp.id">{{ emp.nomeFantasia }}</option>
                  }
                </select>
              </div>

              <div class="form-field" style="margin-top: 14px;">
                <label for="campoNomeDoc">Nome / Descrição do Documento *</label>
                <input type="text" [(ngModel)]="formDoc.nome" name="nome" required placeholder="Ex: Extrato bancário de set/2026, comprovante de taxa...">
              </div>

              <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 14px;">
                <div class="form-field">
                  <label for="campoCategoria">Categoria *</label>
                  <select [(ngModel)]="formDoc.categoria" name="categoria" class="filter-select" style="width: 100%;">
                    <option value="Contábil / Financeiro">Contábil / Financeiro</option>
                    <option value="Fiscal">Fiscal</option>
                    <option value="Departamento Pessoal">Departamento Pessoal</option>
                    <option value="Societário / Cadastral">Societário / Cadastral</option>
                  </select>
                </div>
                <div class="form-field">
                  <label for="campoPrazo">Prazo Limite para Envio *</label>
                  <input type="date" [(ngModel)]="formDoc.prazoEnvio" name="prazoEnvio" required>
                </div>
                <div class="form-field">
                  <label for="campoResponsavel">Responsável Interno *</label>
                  <select [(ngModel)]="formDoc.responsavel" name="responsavel" class="filter-select" style="width: 100%;">
                    <option value="Carlos Silveira">Carlos Silveira</option>
                    <option value="Juliana Martins">Juliana Martins</option>
                    <option value="Waldo Ferreira">Waldo Ferreira</option>
                    <option value="Beatriz Oliveira">Beatriz Oliveira</option>
                    <option value="Ricardo Mendes">Ricardo Mendes</option>
                  </select>
                </div>
              </div>

              <div class="form-field" style="margin-top: 14px;">
                <label for="campoObsDoc">Instruções para o Cliente</label>
                <textarea [(ngModel)]="formDoc.observacoes" name="observacoes" rows="3" placeholder="Orientações sobre formatos aceitos (PDF, OFX, XML)..."></textarea>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-contador" (click)="fecharModal()">Cancelar</button>
              <button type="submit" class="btn btn-primary"><i class="fa-solid fa-paper-plane"></i> Enviar Solicitação</button>
            </div>
          </form>
        </div>
      </div>
    }
  `
})
export class DocumentosComponent implements OnInit {
  private dataService = inject(DataService);

  filtroEmpresa = 'Todas';
  filtroCategoria = 'Todas';
  filtroSituacao = 'Todas';
  showModal = false;
  empresas: any[] = [];
  documentos: any[] = [];

  formDoc: any = {
    empresaId: '',
    nome: '',
    categoria: 'Contábil / Financeiro',
    prazoEnvio: '',
    responsavel: 'Carlos Silveira',
    observacoes: '',
    situacao: 'Solicitado'
  };

  ngOnInit() {
    this.empresas = this.dataService.getEmpresas();
    this.renderizar();
  }

  renderizar() {
    this.documentos = this.dataService.getDocumentos({
      empresaId: this.filtroEmpresa,
      categoria: this.filtroCategoria,
      situacao: this.filtroSituacao
    });
  }

  getEmpresaNome(empresaId: number): string {
    const emp = this.dataService.getEmpresaById(empresaId);
    return emp ? emp.nomeFantasia : 'Empresa';
  }

  isAtrasado(d: any): boolean {
    return d.prazoEnvio < '2026-10-20' && (d.situacao === 'Aguardando Cliente' || d.situacao === 'Solicitado');
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '-';
    const parts = dateStr.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return dateStr;
  }

  aprovarDoc(id: number) {
    const doc = this.dataService.aprovarDocumento(id);
    if (doc) {
      this.renderizar();
    }
  }

  abrirModal() {
    this.formDoc = {
      empresaId: this.empresas.length > 0 ? this.empresas[0].id : '',
      nome: '',
      categoria: 'Contábil / Financeiro',
      prazoEnvio: new Date().toISOString().split('T')[0],
      responsavel: 'Carlos Silveira',
      observacoes: '',
      situacao: 'Solicitado'
    };
    this.showModal = true;
  }

  fecharModal() {
    this.showModal = false;
  }

  salvarDoc() {
    this.dataService.saveDocumento({
      ...this.formDoc,
      empresaId: Number(this.formDoc.empresaId)
    });
    this.fecharModal();
    this.renderizar();
  }

  exportarCSV() {
    const rows = this.documentos.map((d: any) => {
      const emp = this.dataService.getEmpresaById(d.empresaId);
      return {
        'ID': d.id,
        'Empresa': emp ? emp.nomeFantasia : '',
        'Documento': d.nome,
        'Categoria': d.categoria,
        'Data Solicitação': d.dataSolicitacao,
        'Prazo Envio': d.prazoEnvio,
        'Responsável': d.responsavel,
        'Situação': d.situacao,
        'Arquivo Anexo': d.arquivoMock || 'Nenhum'
      };
    });
    this.dataService.exportToCSV('documentos_solicitacoes_clientes', rows);
  }
}
