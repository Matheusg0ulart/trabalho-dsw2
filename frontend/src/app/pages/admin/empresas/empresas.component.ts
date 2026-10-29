import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DataService } from '../../../services/data.service';

@Component({
  selector: 'app-empresas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Topo da Página -->
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px;">
      <div>
        <h2 style="font-family: var(--font-heading); font-size: 1.4rem; font-weight: 700; color: var(--text-primary); margin: 0;">
          Gestão de Empresas & Clientes
        </h2>
        <p style="font-size: 0.85rem; color: var(--text-secondary); margin: 4px 0 0;">
          Cadastro centralizado de empresas da carteira contábil, fiscal e trabalhista
        </p>
      </div>
      <div style="display: flex; gap: 10px;">
        <button type="button" class="btn btn-sm btn-contador" (click)="exportarCSV()">
          <i class="fa-solid fa-file-csv"></i> Exportar CSV
        </button>
        <button type="button" class="btn btn-sm btn-primary" (click)="abrirModalNovaEmpresa()">
          <i class="fa-solid fa-plus"></i> Cadastrar Empresa
        </button>
      </div>
    </div>

    <!-- Barra de Filtros e Busca -->
    <div class="filter-bar" style="display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; align-items: center; background: var(--bg-card); padding: 16px; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
      <div style="flex-grow: 1; min-width: 220px;">
        <input
          type="text"
          class="filter-input"
          placeholder="Buscar por razão social, fantasia ou CNPJ..."
          [(ngModel)]="filtros.busca"
          (input)="aplicarFiltros()"
          style="width: 100%; height: 38px; padding: 0 12px; border: 1px solid var(--border-color); border-radius: var(--radius-sm);"
        />
      </div>

      <div style="min-width: 170px;">
        <select
          class="filter-select"
          [(ngModel)]="filtros.regime"
          (change)="aplicarFiltros()"
          style="width: 100%; height: 38px; padding: 0 12px; border: 1px solid var(--border-color); border-radius: var(--radius-sm);"
        >
          <option value="Todos">Todos os Regimes</option>
          <option value="Simples Nacional">Simples Nacional</option>
          <option value="Lucro Presumido">Lucro Presumido</option>
          <option value="Lucro Real">Lucro Real</option>
        </select>
      </div>

      <div style="min-width: 160px;">
        <select
          class="filter-select"
          [(ngModel)]="filtros.situacao"
          (change)="aplicarFiltros()"
          style="width: 100%; height: 38px; padding: 0 12px; border: 1px solid var(--border-color); border-radius: var(--radius-sm);"
        >
          <option value="Todas">Todas Situações</option>
          <option value="Ativa">Ativa</option>
          <option value="Em Abertura">Em Abertura</option>
          <option value="Regularização">Regularização</option>
          <option value="Inativa">Inativa</option>
        </select>
      </div>

      <div style="min-width: 170px;">
        <select
          class="filter-select"
          [(ngModel)]="filtros.ordem"
          (change)="aplicarFiltros()"
          style="width: 100%; height: 38px; padding: 0 12px; border: 1px solid var(--border-color); border-radius: var(--radius-sm);"
        >
          <option value="nomeAsc">Nome (A - Z)</option>
          <option value="nomeDesc">Nome (Z - A)</option>
          <option value="inicioDesc">Mais Recentes</option>
          <option value="inicioAsc">Mais Antigas</option>
        </select>
      </div>
    </div>

    <!-- Tabela de Empresas -->
    <div class="table-card" style="background: var(--bg-card); border-radius: var(--radius-lg); border: 1px solid var(--border-color); box-shadow: var(--shadow-card); overflow: hidden;">
      <div class="table-responsive">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Empresa / Razão Social</th>
              <th>CNPJ</th>
              <th>Regime Tributário</th>
              <th>Responsável / Contato</th>
              <th>Contador Interno</th>
              <th>Situação</th>
              <th style="text-align: right;">Ações</th>
            </tr>
          </thead>
          <tbody>
            @for (emp of empresasList; track emp.id) {
              <tr>
                <td>
                  <strong style="color: var(--text-primary); cursor: pointer;" (click)="abrirDetalhes(emp)">
                    {{ emp.nomeFantasia }}
                  </strong>
                  <br />
                  <span style="font-size: 0.75rem; color: var(--text-muted);">{{ emp.razaoSocial }}</span>
                </td>
                <td style="font-family: monospace; font-size: 0.85rem;">{{ emp.cnpj }}</td>
                <td>
                  <span class="badge-tag" [ngClass]="getRegimeBadgeClass(emp.regimeTributario)">
                    {{ emp.regimeTributario }}
                  </span>
                  @if (emp.fatorR) {
                    <span style="font-size: 0.65rem; color: var(--gold); margin-left: 4px; font-weight: 700;">(Fator R)</span>
                  }
                </td>
                <td>
                  <span style="font-size: 0.85rem; font-weight: 600;">{{ emp.responsavel }}</span><br />
                  <span style="font-size: 0.75rem; color: var(--text-muted);">{{ emp.telefone }}</span>
                </td>
                <td>
                  <span style="font-size: 0.85rem; color: var(--text-secondary);">{{ emp.responsavelInterno || 'Waldo Ferreira' }}</span>
                </td>
                <td>
                  <span class="status-badge" [ngClass]="getSituacaoClass(emp.situacao)">
                    {{ emp.situacao }}
                  </span>
                </td>
                <td style="text-align: right;">
                  <button class="btn-icon-action" (click)="abrirDetalhes(emp)" title="Ver Detalhes (8 Abas)" style="margin-right: 4px;">
                    <i class="fa-solid fa-eye"></i>
                  </button>
                  <button class="btn-icon-action" (click)="editarEmpresa(emp)" title="Editar Cadastro" style="margin-right: 4px;">
                    <i class="fa-solid fa-pen"></i>
                  </button>
                  <button class="btn-icon-action" (click)="alternarSituacao(emp.id)" [title]="emp.situacao === 'Inativa' ? 'Reativar' : 'Desativar'">
                    <i class="fa-solid" [ngClass]="emp.situacao === 'Inativa' ? 'fa-check text-success' : 'fa-ban text-danger'"></i>
                  </button>
                </td>
              </tr>
            }
            @if (empresasList.length === 0) {
              <tr>
                <td colspan="7" style="text-align: center; padding: 32px; color: var(--text-muted);">
                  Nenhuma empresa encontrada com os filtros selecionados.
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>

    <!-- MODAL: DETALHES COMPLETOS DA EMPRESA (8 ABAS) -->
    @if (modalDetalhesAberto && empresaSelecionada) {
      <div class="admin-modal-backdrop" style="display: flex; position: fixed; inset: 0; background: rgba(0,0,0,0.55); z-index: 2000; align-items: center; justify-content: center; padding: 20px;">
        <div class="admin-modal modal-lg" style="background: var(--bg-card); width: 100%; max-width: 850px; max-height: 90vh; border-radius: var(--radius-lg); overflow: hidden; display: flex; flex-direction: column;">
          <div class="modal-header" style="padding: 18px 24px; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
            <div>
              <h3 style="margin: 0; font-family: var(--font-heading); font-size: 1.25rem;">{{ empresaSelecionada.nomeFantasia }}</h3>
              <span style="font-size: 0.82rem; color: var(--text-muted);">{{ empresaSelecionada.razaoSocial }}</span>
            </div>
            <button class="modal-close-btn" (click)="fecharDetalhes()" aria-label="Fechar" style="background: none; border: none; font-size: 1.2rem; cursor: pointer; color: var(--text-muted);">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <div class="modal-body" style="padding: 20px 24px; overflow-y: auto;">
            <!-- Abas -->
            <div class="modal-tabs" style="display: flex; gap: 8px; border-bottom: 1px solid var(--border-color); margin-bottom: 20px; overflow-x: auto; padding-bottom: 4px;">
              <button class="tab-btn" [class.active]="abaAtiva === 'tab-geral'" (click)="abaAtiva = 'tab-geral'">
                <i class="fa-solid fa-circle-info"></i> Geral
              </button>
              <button class="tab-btn" [class.active]="abaAtiva === 'tab-impostos'" (click)="abaAtiva = 'tab-impostos'">
                <i class="fa-solid fa-receipt"></i> Impostos
              </button>
              <button class="tab-btn" [class.active]="abaAtiva === 'tab-folha'" (click)="abaAtiva = 'tab-folha'">
                <i class="fa-solid fa-users"></i> Folha
              </button>
              <button class="tab-btn" [class.active]="abaAtiva === 'tab-servicos'" (click)="abaAtiva = 'tab-servicos'">
                <i class="fa-solid fa-list-check"></i> Serviços
              </button>
              <button class="tab-btn" [class.active]="abaAtiva === 'tab-notas'" (click)="abaAtiva = 'tab-notas'">
                <i class="fa-solid fa-file-invoice"></i> Notas
              </button>
              <button class="tab-btn" [class.active]="abaAtiva === 'tab-parcelamentos'" (click)="abaAtiva = 'tab-parcelamentos'">
                <i class="fa-solid fa-hand-holding-dollar"></i> Parcelamentos
              </button>
              <button class="tab-btn" [class.active]="abaAtiva === 'tab-documentos'" (click)="abaAtiva = 'tab-documentos'">
                <i class="fa-solid fa-folder-open"></i> Documentos
              </button>
            </div>

            <!-- Aba Geral -->
            @if (abaAtiva === 'tab-geral') {
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div>
                  <h4 style="font-size: 0.9rem; margin-bottom: 12px; color: var(--text-primary);"><i class="fa-solid fa-building" style="color: var(--primary);"></i> Dados Cadastrais</h4>
                  <p style="font-size: 0.85rem; margin-bottom: 6px;"><strong>CNPJ:</strong> {{ empresaSelecionada.cnpj }}</p>
                  <p style="font-size: 0.85rem; margin-bottom: 6px;"><strong>Inscrição Estadual:</strong> {{ empresaSelecionada.inscricaoEstadual }}</p>
                  <p style="font-size: 0.85rem; margin-bottom: 6px;"><strong>Inscrição Municipal (CCM):</strong> {{ empresaSelecionada.inscricaoMunicipal }}</p>
                  <p style="font-size: 0.85rem; margin-bottom: 6px;"><strong>Regime:</strong> {{ empresaSelecionada.regimeTributario }}</p>
                  <p style="font-size: 0.85rem; margin-bottom: 6px;"><strong>Data Abertura:</strong> {{ empresaSelecionada.dataAbertura }}</p>
                  <p style="font-size: 0.85rem; margin-bottom: 6px;"><strong>CNAE Principal:</strong> {{ empresaSelecionada.cnae }}</p>
                </div>
                <div>
                  <h4 style="font-size: 0.9rem; margin-bottom: 12px; color: var(--text-primary);"><i class="fa-solid fa-address-book" style="color: var(--primary);"></i> Contato & Responsáveis</h4>
                  <p style="font-size: 0.85rem; margin-bottom: 6px;"><strong>Responsável:</strong> {{ empresaSelecionada.responsavel }}</p>
                  <p style="font-size: 0.85rem; margin-bottom: 6px;"><strong>E-mail:</strong> {{ empresaSelecionada.email }}</p>
                  <p style="font-size: 0.85rem; margin-bottom: 6px;"><strong>Telefone:</strong> {{ empresaSelecionada.telefone }}</p>
                  <p style="font-size: 0.85rem; margin-bottom: 6px;"><strong>Endereço:</strong> {{ empresaSelecionada.endereco }}</p>
                  <p style="font-size: 0.85rem; margin-bottom: 6px;"><strong>Responsável Interno:</strong> {{ empresaSelecionada.responsavelInterno }}</p>
                  <p style="font-size: 0.85rem; margin-bottom: 6px;"><strong>Início do Contrato:</strong> {{ empresaSelecionada.dataInicio }}</p>
                </div>
              </div>
              <div style="margin-top: 18px; padding-top: 14px; border-top: 1px solid var(--border-color);">
                <strong style="font-size: 0.85rem; display: block; margin-bottom: 4px;">Observações Contábeis:</strong>
                <p style="font-size: 0.82rem; color: var(--text-secondary); background: #f8fafc; padding: 10px; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
                  {{ empresaSelecionada.observacoes || 'Nenhuma observação registrada.' }}
                </p>
              </div>
            }

            <!-- Aba Impostos -->
            @if (abaAtiva === 'tab-impostos') {
              <div class="table-responsive">
                <table class="admin-table">
                  <thead>
                    <tr><th>Obrigação</th><th>Competência</th><th>Vencimento</th><th>Valor</th><th>Situação</th></tr>
                  </thead>
                  <tbody>
                    @for (imp of getImpostosDaEmpresa(empresaSelecionada.id); track imp.id) {
                      <tr>
                        <td><strong>{{ imp.tipo }}</strong></td>
                        <td>{{ imp.competencia }}</td>
                        <td>{{ imp.vencimento }}</td>
                        <td>R$ {{ imp.valor | number:'1.2-2' }}</td>
                        <td><span class="status-badge" [ngClass]="imp.situacao.toLowerCase()">{{ imp.situacao }}</span></td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }

            <!-- Aba Folha -->
            @if (abaAtiva === 'tab-folha') {
              <div class="table-responsive">
                <table class="admin-table">
                  <thead>
                    <tr><th>Competência</th><th>Prazo Previsto</th><th>Funcionários</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    @for (f of getFolhasDaEmpresa(empresaSelecionada.id); track f.id) {
                      <tr>
                        <td><strong>{{ f.competencia }}</strong></td>
                        <td>{{ f.prazoPrevisto }}</td>
                        <td>{{ f.funcionarios }}</td>
                        <td><span class="status-badge" [ngClass]="f.situacao.toLowerCase()">{{ f.situacao }}</span></td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }

            <!-- Aba Serviços -->
            @if (abaAtiva === 'tab-servicos') {
              <div class="table-responsive">
                <table class="admin-table">
                  <thead>
                    <tr><th>Serviço</th><th>Prazo</th><th>Prioridade</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    @for (s of getServicosDaEmpresa(empresaSelecionada.id); track s.id) {
                      <tr>
                        <td><strong>{{ s.titulo }}</strong></td>
                        <td>{{ s.prazoEntrega }}</td>
                        <td>{{ s.prioridade }}</td>
                        <td><span class="status-badge" [ngClass]="s.situacao.toLowerCase()">{{ s.situacao }}</span></td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }

            <!-- Aba Notas -->
            @if (abaAtiva === 'tab-notas') {
              <div class="table-responsive">
                <table class="admin-table">
                  <thead>
                    <tr><th>Tipo NF</th><th>Tomador</th><th>Valor</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    @for (n of getNotasDaEmpresa(empresaSelecionada.id); track n.id) {
                      <tr>
                        <td><strong>{{ n.tipo }}</strong></td>
                        <td>{{ n.tomador }}</td>
                        <td>R$ {{ n.valor | number:'1.2-2' }}</td>
                        <td><span class="status-badge" [ngClass]="n.situacao.toLowerCase()">{{ n.situacao }}</span></td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }

            <!-- Aba Parcelamentos -->
            @if (abaAtiva === 'tab-parcelamentos') {
              <div class="table-responsive">
                <table class="admin-table">
                  <thead>
                    <tr><th>Órgão</th><th>Parcelas</th><th>Valor Parcela</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    @for (p of getParcelamentosDaEmpresa(empresaSelecionada.id); track p.id) {
                      <tr>
                        <td><strong>{{ p.orgao }}</strong></td>
                        <td>{{ p.parcelasPagas }} / {{ p.totalParcelas }}</td>
                        <td>R$ {{ p.valorParcela | number:'1.2-2' }}</td>
                        <td><span class="status-badge" [ngClass]="p.situacao.toLowerCase()">{{ p.situacao }}</span></td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }

            <!-- Aba Documentos -->
            @if (abaAtiva === 'tab-documentos') {
              <div class="table-responsive">
                <table class="admin-table">
                  <thead>
                    <tr><th>Documento</th><th>Categoria</th><th>Solicitado em</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    @for (d of getDocumentosDaEmpresa(empresaSelecionada.id); track d.id) {
                      <tr>
                        <td><strong>{{ d.titulo }}</strong></td>
                        <td>{{ d.categoria }}</td>
                        <td>{{ d.dataSolicitacao }}</td>
                        <td><span class="status-badge" [ngClass]="d.situacao.toLowerCase()">{{ d.situacao }}</span></td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }
          </div>

          <div class="modal-footer" style="padding: 14px 24px; border-top: 1px solid var(--border-color); display: flex; justify-content: flex-end;">
            <button class="btn btn-sm btn-outline-navy" (click)="fecharDetalhes()">Fechar</button>
          </div>
        </div>
      </div>
    }

    <!-- MODAL: FORMULÁRIO CADASTRAR / EDITAR EMPRESA -->
    @if (modalFormAberto) {
      <div class="admin-modal-backdrop" style="display: flex; position: fixed; inset: 0; background: rgba(0,0,0,0.55); z-index: 2000; align-items: center; justify-content: center; padding: 20px;">
        <div class="admin-modal modal-md" style="background: var(--bg-card); width: 100%; max-width: 650px; max-height: 90vh; border-radius: var(--radius-lg); overflow: hidden; display: flex; flex-direction: column;">
          <div class="modal-header" style="padding: 18px 24px; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
            <h3 style="margin: 0; font-family: var(--font-heading); font-size: 1.25rem;">
              {{ formEmpresa.id ? 'Editar Empresa' : 'Cadastrar Nova Empresa' }}
            </h3>
            <button class="modal-close-btn" (click)="fecharForm()" aria-label="Fechar" style="background: none; border: none; font-size: 1.2rem; cursor: pointer; color: var(--text-muted);">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <form (ngSubmit)="salvarEmpresa()" style="display: flex; flex-direction: column; flex-grow: 1; overflow-y: auto;">
            <div class="modal-body" style="padding: 20px 24px;">
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;">
                <div>
                  <label style="display: block; font-size: 0.8rem; font-weight: 600; margin-bottom: 4px;">Nome Fantasia *</label>
                  <input type="text" [(ngModel)]="formEmpresa.nomeFantasia" name="nomeFantasia" required style="width: 100%; height: 38px; border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 0 10px;" />
                </div>
                <div>
                  <label style="display: block; font-size: 0.8rem; font-weight: 600; margin-bottom: 4px;">Razão Social *</label>
                  <input type="text" [(ngModel)]="formEmpresa.razaoSocial" name="razaoSocial" required style="width: 100%; height: 38px; border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 0 10px;" />
                </div>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;">
                <div>
                  <label style="display: block; font-size: 0.8rem; font-weight: 600; margin-bottom: 4px;">CNPJ *</label>
                  <input type="text" [(ngModel)]="formEmpresa.cnpj" name="cnpj" required placeholder="00.000.000/0000-00" style="width: 100%; height: 38px; border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 0 10px;" />
                </div>
                <div>
                  <label style="display: block; font-size: 0.8rem; font-weight: 600; margin-bottom: 4px;">Regime Tributário *</label>
                  <select [(ngModel)]="formEmpresa.regimeTributario" name="regimeTributario" required style="width: 100%; height: 38px; border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 0 10px;">
                    <option value="Simples Nacional">Simples Nacional</option>
                    <option value="Lucro Presumido">Lucro Presumido</option>
                    <option value="Lucro Real">Lucro Real</option>
                  </select>
                </div>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;">
                <div>
                  <label style="display: block; font-size: 0.8rem; font-weight: 600; margin-bottom: 4px;">Responsável / Sócio</label>
                  <input type="text" [(ngModel)]="formEmpresa.responsavel" name="responsavel" style="width: 100%; height: 38px; border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 0 10px;" />
                </div>
                <div>
                  <label style="display: block; font-size: 0.8rem; font-weight: 600; margin-bottom: 4px;">Telefone / WhatsApp</label>
                  <input type="text" [(ngModel)]="formEmpresa.telefone" name="telefone" placeholder="(11) 99999-9999" style="width: 100%; height: 38px; border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 0 10px;" />
                </div>
              </div>

              <div style="margin-bottom: 14px;">
                <label style="display: block; font-size: 0.8rem; font-weight: 600; margin-bottom: 4px;">E-mail de Contato</label>
                <input type="email" [(ngModel)]="formEmpresa.email" name="email" style="width: 100%; height: 38px; border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 0 10px;" />
              </div>

              <div style="margin-bottom: 14px;">
                <label style="display: block; font-size: 0.8rem; font-weight: 600; margin-bottom: 4px;">Endereço Comercial</label>
                <input type="text" [(ngModel)]="formEmpresa.endereco" name="endereco" style="width: 100%; height: 38px; border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 0 10px;" />
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;">
                <div>
                  <label style="display: block; font-size: 0.8rem; font-weight: 600; margin-bottom: 4px;">Situação</label>
                  <select [(ngModel)]="formEmpresa.situacao" name="situacao" style="width: 100%; height: 38px; border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 0 10px;">
                    <option value="Ativa">Ativa</option>
                    <option value="Em Abertura">Em Abertura</option>
                    <option value="Regularização">Regularização</option>
                    <option value="Inativa">Inativa</option>
                  </select>
                </div>
                <div>
                  <label style="display: block; font-size: 0.8rem; font-weight: 600; margin-bottom: 4px;">Contador Interno</label>
                  <input type="text" [(ngModel)]="formEmpresa.responsavelInterno" name="responsavelInterno" placeholder="Waldo Ferreira" style="width: 100%; height: 38px; border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 0 10px;" />
                </div>
              </div>
            </div>

            <div class="modal-footer" style="padding: 14px 24px; border-top: 1px solid var(--border-color); display: flex; justify-content: flex-end; gap: 10px;">
              <button type="button" class="btn btn-sm btn-outline-navy" (click)="fecharForm()">Cancelar</button>
              <button type="submit" class="btn btn-sm btn-primary">Salvar Registro</button>
            </div>
          </form>
        </div>
      </div>
    }
  `
})
export class EmpresasComponent implements OnInit {
  private dataService = inject(DataService);
  private route = inject(ActivatedRoute);

  filtros: any = {
    busca: '',
    regime: 'Todos',
    situacao: 'Todas',
    ordem: 'nomeAsc'
  };

  empresasList: any[] = [];
  empresaSelecionada: any = null;
  modalDetalhesAberto = false;
  modalFormAberto = false;
  abaAtiva = 'tab-geral';

  formEmpresa: any = {};

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['busca']) this.filtros.busca = params['busca'];
      if (params['situacao']) this.filtros.situacao = params['situacao'];
      if (params['regime']) this.filtros.regime = params['regime'];
      this.aplicarFiltros();
    });
  }

  aplicarFiltros() {
    this.empresasList = this.dataService.getEmpresas(this.filtros);
  }

  getRegimeBadgeClass(regime: string): string {
    switch (regime) {
      case 'Simples Nacional': return 'blue-tag';
      case 'Lucro Presumido': return 'gold-tag';
      case 'Lucro Real': return 'purple-tag';
      default: return '';
    }
  }

  getSituacaoClass(sit: string): string {
    switch (sit) {
      case 'Ativa': return 'ativa';
      case 'Em Abertura': return 'abertura';
      case 'Regularização': return 'regularizacao';
      case 'Inativa': return 'inativa';
      default: return 'pendente';
    }
  }

  abrirDetalhes(emp: any) {
    this.empresaSelecionada = emp;
    this.abaAtiva = 'tab-geral';
    this.modalDetalhesAberto = true;
  }

  fecharDetalhes() {
    this.modalDetalhesAberto = false;
    this.empresaSelecionada = null;
  }

  abrirModalNovaEmpresa() {
    this.formEmpresa = {
      situacao: 'Ativa',
      regimeTributario: 'Simples Nacional',
      responsavelInterno: 'Waldo Ferreira'
    };
    this.modalFormAberto = true;
  }

  editarEmpresa(emp: any) {
    this.formEmpresa = { ...emp };
    this.modalFormAberto = true;
  }

  fecharForm() {
    this.modalFormAberto = false;
    this.formEmpresa = {};
  }

  salvarEmpresa() {
    if (!this.formEmpresa.nomeFantasia || !this.formEmpresa.cnpj) {
      alert('Preencha os campos obrigatórios (Nome Fantasia e CNPJ).');
      return;
    }
    this.dataService.saveEmpresa(this.formEmpresa);
    this.fecharForm();
    this.aplicarFiltros();
  }

  alternarSituacao(id: number) {
    this.dataService.desativarEmpresa(id);
    this.aplicarFiltros();
  }

  exportarCSV() {
    this.dataService.exportToCSV('empresas_clientes', this.empresasList);
  }

  getImpostosDaEmpresa(empresaId: number) {
    return this.dataService.getImpostos({ empresaId });
  }

  getFolhasDaEmpresa(empresaId: number) {
    return this.dataService.getFolha({ empresaId });
  }

  getServicosDaEmpresa(empresaId: number) {
    return this.dataService.getServicos({ empresaId });
  }

  getNotasDaEmpresa(empresaId: number) {
    return this.dataService.getNotas({ empresaId });
  }

  getParcelamentosDaEmpresa(empresaId: number) {
    return this.dataService.getParcelamentos({ empresaId });
  }

  getDocumentosDaEmpresa(empresaId: number) {
    return this.dataService.getDocumentos({ empresaId });
  }
}
