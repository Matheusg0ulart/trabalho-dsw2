import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DataService } from '../../../services/data.service';

@Component({
  selector: 'app-impostos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px;">
      <div>
        <h2 style="font-family: var(--font-heading); font-size: 1.4rem; font-weight: 700; color: var(--text-primary); margin: 0;">
          Impostos & Obrigações Fiscais
        </h2>
        <p style="font-size: 0.85rem; color: var(--text-secondary); margin: 4px 0 0;">
          Acompanhamento das guias de arrecadação, declarações acessórias e prazos legais
        </p>
      </div>
      <div style="display: flex; gap: 10px;">
        <button type="button" class="btn btn-sm btn-contador" (click)="exportarCSV()">
          <i class="fa-solid fa-file-csv"></i> Exportar CSV
        </button>
        <button type="button" class="btn btn-sm btn-primary" (click)="abrirModalNovo()">
          <i class="fa-solid fa-plus"></i> Nova Obrigação
        </button>
      </div>
    </div>

    <!-- Barra de Filtros -->
    <div class="filter-bar" style="display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; align-items: center; background: var(--bg-card); padding: 16px; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
      <div style="flex-grow: 1; min-width: 200px;">
        <input
          type="text"
          class="filter-input"
          placeholder="Buscar por obrigação, empresa ou recibo..."
          [(ngModel)]="filtros.busca"
          (input)="aplicarFiltros()"
          style="width: 100%; height: 38px; padding: 0 12px; border: 1px solid var(--border-color); border-radius: var(--radius-sm);"
        />
      </div>

      <div style="min-width: 180px;">
        <select class="filter-select" [(ngModel)]="filtros.empresaId" (change)="aplicarFiltros()" style="width: 100%; height: 38px; padding: 0 12px; border: 1px solid var(--border-color); border-radius: var(--radius-sm);">
          <option value="Todas">Todas as Empresas</option>
          @for (emp of empresas; track emp.id) {
            <option [value]="emp.id">{{ emp.nomeFantasia }}</option>
          }
        </select>
      </div>

      <div style="min-width: 150px;">
        <select class="filter-select" [(ngModel)]="filtros.competencia" (change)="aplicarFiltros()" style="width: 100%; height: 38px; padding: 0 12px; border: 1px solid var(--border-color); border-radius: var(--radius-sm);">
          <option value="Todas">Competência: Todas</option>
          <option value="09/2026">09/2026</option>
          <option value="10/2026">10/2026</option>
          <option value="03T/2026">3º Trimestre/2026</option>
        </select>
      </div>

      <div style="min-width: 160px;">
        <select class="filter-select" [(ngModel)]="filtros.situacao" (change)="aplicarFiltros()" style="width: 100%; height: 38px; padding: 0 12px; border: 1px solid var(--border-color); border-radius: var(--radius-sm);">
          <option value="Todas">Todas Situações</option>
          <option value="Pendente">Pendente</option>
          <option value="Em Andamento">Em Andamento</option>
          <option value="Aguardando Documentos">Aguardando Documentos</option>
          <option value="Pronta para Entrega">Pronta para Entrega</option>
          <option value="Entregue">Entregue</option>
          <option value="Concluída">Concluída</option>
          <option value="Atrasada">Atrasada</option>
        </select>
      </div>
    </div>

    <!-- Tabela de Obrigações -->
    <div class="table-card" style="background: var(--bg-card); border-radius: var(--radius-lg); border: 1px solid var(--border-color); box-shadow: var(--shadow-card); overflow: hidden;">
      <div class="table-responsive">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Empresa</th>
              <th>Obrigação / Tributo</th>
              <th>Competência</th>
              <th>Vencimento</th>
              <th>Valor Guia</th>
              <th>Responsável</th>
              <th>Protocolo</th>
              <th>Situação</th>
              <th style="text-align: right;">Ações</th>
            </tr>
          </thead>
          <tbody>
            @for (imp of impostosList; track imp.id) {
              <tr>
                <td><strong>{{ getEmpresaNome(imp.empresaId) }}</strong></td>
                <td>
                  <span style="font-weight: 600;">{{ imp.tipo }}</span>
                </td>
                <td>{{ imp.competencia }}</td>
                <td>
                  <strong [style.color]="imp.situacao === 'Atrasada' ? 'var(--danger)' : 'inherit'">
                    {{ imp.vencimento }}
                  </strong>
                </td>
                <td>R$ {{ imp.valor | number:'1.2-2' }}</td>
                <td>{{ imp.responsavel }}</td>
                <td style="font-family: monospace; font-size: 0.8rem; color: var(--text-muted);">
                  {{ imp.protocolo || 'Não gerado' }}
                </td>
                <td>
                  <span class="status-badge" [ngClass]="getSituacaoClass(imp.situacao)">
                    {{ imp.situacao }}
                  </span>
                </td>
                <td style="text-align: right;">
                  @if (imp.situacao !== 'Concluída' && imp.situacao !== 'Entregue') {
                    <button class="btn-icon-action" (click)="concluir(imp.id)" title="Marcar como Concluída" style="color: var(--success); margin-right: 4px;">
                      <i class="fa-solid fa-check"></i>
                    </button>
                  }
                  <button class="btn-icon-action" (click)="editar(imp)" title="Editar">
                    <i class="fa-solid fa-pen"></i>
                  </button>
                </td>
              </tr>
            }
            @if (impostosList.length === 0) {
              <tr>
                <td colspan="9" style="text-align: center; padding: 32px; color: var(--text-muted);">
                  Nenhuma obrigação encontrada.
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>

    <!-- MODAL FORMULÁRIO -->
    @if (modalAberto) {
      <div class="admin-modal-backdrop" style="display: flex; position: fixed; inset: 0; background: rgba(0,0,0,0.55); z-index: 2000; align-items: center; justify-content: center; padding: 20px;">
        <div class="admin-modal modal-md" style="background: var(--bg-card); width: 100%; max-width: 580px; max-height: 90vh; border-radius: var(--radius-lg); overflow: hidden; display: flex; flex-direction: column;">
          <div class="modal-header" style="padding: 18px 24px; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
            <h3 style="margin: 0; font-family: var(--font-heading); font-size: 1.25rem;">
              {{ formImposto.id ? 'Editar Obrigação Fiscal' : 'Registrar Obrigação Fiscal' }}
            </h3>
            <button class="modal-close-btn" (click)="fecharModal()" aria-label="Fechar" style="background: none; border: none; font-size: 1.2rem; cursor: pointer; color: var(--text-muted);">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <form (ngSubmit)="salvar()" style="display: flex; flex-direction: column; flex-grow: 1; overflow-y: auto;">
            <div class="modal-body" style="padding: 20px 24px;">
              <div style="margin-bottom: 14px;">
                <label style="display: block; font-size: 0.8rem; font-weight: 600; margin-bottom: 4px;">Empresa *</label>
                <select [(ngModel)]="formImposto.empresaId" name="empresaId" required style="width: 100%; height: 38px; border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 0 10px;">
                  @for (emp of empresas; track emp.id) {
                    <option [value]="emp.id">{{ emp.nomeFantasia }}</option>
                  }
                </select>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;">
                <div>
                  <label style="display: block; font-size: 0.8rem; font-weight: 600; margin-bottom: 4px;">Tipo de Obrigação *</label>
                  <input type="text" [(ngModel)]="formImposto.tipo" name="tipo" required placeholder="Ex: DAS, DCTFWeb..." style="width: 100%; height: 38px; border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 0 10px;" />
                </div>
                <div>
                  <label style="display: block; font-size: 0.8rem; font-weight: 600; margin-bottom: 4px;">Competência *</label>
                  <input type="text" [(ngModel)]="formImposto.competencia" name="competencia" required placeholder="10/2026" style="width: 100%; height: 38px; border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 0 10px;" />
                </div>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;">
                <div>
                  <label style="display: block; font-size: 0.8rem; font-weight: 600; margin-bottom: 4px;">Data de Vencimento *</label>
                  <input type="date" [(ngModel)]="formImposto.vencimento" name="vencimento" required style="width: 100%; height: 38px; border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 0 10px;" />
                </div>
                <div>
                  <label style="display: block; font-size: 0.8rem; font-weight: 600; margin-bottom: 4px;">Valor da Guia (R$)</label>
                  <input type="number" step="0.01" [(ngModel)]="formImposto.valor" name="valor" placeholder="0.00" style="width: 100%; height: 38px; border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 0 10px;" />
                </div>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;">
                <div>
                  <label style="display: block; font-size: 0.8rem; font-weight: 600; margin-bottom: 4px;">Responsável Interno</label>
                  <input type="text" [(ngModel)]="formImposto.responsavel" name="responsavel" placeholder="Carlos Silveira" style="width: 100%; height: 38px; border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 0 10px;" />
                </div>
                <div>
                  <label style="display: block; font-size: 0.8rem; font-weight: 600; margin-bottom: 4px;">Situação</label>
                  <select [(ngModel)]="formImposto.situacao" name="situacao" style="width: 100%; height: 38px; border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 0 10px;">
                    <option value="Pendente">Pendente</option>
                    <option value="Em Andamento">Em Andamento</option>
                    <option value="Aguardando Documentos">Aguardando Documentos</option>
                    <option value="Pronta para Entrega">Pronta para Entrega</option>
                    <option value="Entregue">Entregue</option>
                    <option value="Concluída">Concluída</option>
                    <option value="Atrasada">Atrasada</option>
                  </select>
                </div>
              </div>
            </div>

            <div class="modal-footer" style="padding: 14px 24px; border-top: 1px solid var(--border-color); display: flex; justify-content: flex-end; gap: 10px;">
              <button type="button" class="btn btn-sm btn-outline-navy" (click)="fecharModal()">Cancelar</button>
              <button type="submit" class="btn btn-sm btn-primary">Salvar Obrigação</button>
            </div>
          </form>
        </div>
      </div>
    }
  `
})
export class ImpostosComponent implements OnInit {
  private dataService = inject(DataService);
  private route = inject(ActivatedRoute);

  filtros: any = {
    busca: '',
    empresaId: 'Todas',
    competencia: 'Todas',
    situacao: 'Todas'
  };

  impostosList: any[] = [];
  empresas: any[] = [];
  modalAberto = false;
  formImposto: any = {};

  ngOnInit() {
    this.empresas = this.dataService.getEmpresas();
    this.route.queryParams.subscribe(params => {
      if (params['situacao']) this.filtros.situacao = params['situacao'];
      this.aplicarFiltros();
    });
  }

  aplicarFiltros() {
    this.impostosList = this.dataService.getImpostos(this.filtros);
  }

  getEmpresaNome(id: number): string {
    const emp = this.dataService.getEmpresaById(id);
    return emp ? emp.nomeFantasia : 'Geral';
  }

  getSituacaoClass(sit: string): string {
    switch (sit) {
      case 'Concluída':
      case 'Entregue': return 'concluida';
      case 'Atrasada': return 'atrasada';
      case 'Em Andamento': return 'andamento';
      default: return 'pendente';
    }
  }

  concluir(id: number) {
    this.dataService.concluirImposto(id);
    this.aplicarFiltros();
  }

  abrirModalNovo() {
    this.formImposto = {
      empresaId: this.empresas[0]?.id || 1,
      situacao: 'Pendente',
      responsavel: 'Carlos Silveira',
      competencia: '10/2026',
      vencimento: '2026-10-25'
    };
    this.modalAberto = true;
  }

  editar(imp: any) {
    this.formImposto = { ...imp };
    this.modalAberto = true;
  }

  fecharModal() {
    this.modalAberto = false;
    this.formImposto = {};
  }

  salvar() {
    this.dataService.saveImposto(this.formImposto);
    this.fecharModal();
    this.aplicarFiltros();
  }

  exportarCSV() {
    this.dataService.exportToCSV('obrigacoes_fiscais', this.impostosList);
  }
}
