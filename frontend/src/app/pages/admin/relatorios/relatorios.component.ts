import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../../services/data.service';

@Component({
  selector: 'app-relatorios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Barra de Filtros e Ações de Exportação -->
    <div class="action-toolbar">
      <div class="filter-group">
        <select [(ngModel)]="tipoRelatorio" (ngModelChange)="gerarRelatorio()" class="filter-select" style="min-width: 250px;">
          <option value="impostos">Obrigações & Guias Fiscais</option>
          <option value="folha">Folha de Pagamento & Colaboradores</option>
          <option value="servicos">Serviços & Tarefas Operacionais</option>
          <option value="empresas">Carteira de Clientes & Regimes</option>
          <option value="parcelamentos">Acordos & Parcelamentos Tributários</option>
          <option value="documentos">Controle de Documentos de Clientes</option>
        </select>

        <select [(ngModel)]="filtroEmpresa" (ngModelChange)="gerarRelatorio()" class="filter-select">
          <option value="Todas">Empresa: Todas</option>
          @for (emp of empresas; track emp.id) {
            <option [value]="emp.id">{{ emp.nomeFantasia }}</option>
          }
        </select>
      </div>

      <div style="display: flex; gap: 10px;">
        <button type="button" class="btn btn-primary" (click)="exportarCSV()">
          <i class="fa-solid fa-file-csv"></i> Exportar Relatório (CSV)
        </button>
        <button type="button" class="btn btn-secondary" (click)="imprimir()">
          <i class="fa-solid fa-print"></i> Imprimir
        </button>
      </div>
    </div>

    <!-- KPIs Dinâmicos do Relatório -->
    <div class="kpi-grid" style="margin-bottom: 24px;">
      @for (kpi of kpis; track kpi.title) {
        <div class="kpi-card">
          <span class="kpi-title">{{ kpi.title }}</span>
          <div class="kpi-value" [ngClass]="kpi.colorClass" [style.color]="kpi.colorStyle" [style.font-size]="kpi.fontSize">
            {{ kpi.value }}
          </div>
        </div>
      }
    </div>

    <!-- Cartão com a Tabela Dinâmica do Relatório -->
    <div class="table-card">
      <div style="padding: 18px 24px; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
        <h3 style="font-family: var(--font-heading); font-size: 1.1rem; color: var(--text-primary); font-weight: 700; margin: 0;">
          {{ tituloRelatorio }}
        </h3>
        <span class="badge-tag" style="font-size: 0.72rem;">{{ registros.length }} registros</span>
      </div>

      <div class="table-responsive">
        <table class="admin-table">
          <!-- Tabela de Impostos -->
          @if (tipoRelatorio === 'impostos') {
            <thead>
              <tr>
                <th>Empresa</th>
                <th>Tributo</th>
                <th>Competência</th>
                <th>Vencimento</th>
                <th>Valor</th>
                <th>Responsável</th>
                <th>Situação</th>
                <th>Protocolo</th>
              </tr>
            </thead>
            <tbody>
              @for (item of registros; track item.id) {
                <tr>
                  <td><strong>{{ getNomeEmpresa(item.empresaId) }}</strong></td>
                  <td>{{ item.tipo }}</td>
                  <td>{{ item.competencia }}</td>
                  <td>{{ formatarData(item.vencimento) }}</td>
                  <td><strong>{{ formatarMoeda(item.valor) }}</strong></td>
                  <td>{{ item.responsavel }}</td>
                  <td><span class="status-badge" [ngClass]="item.situacao.toLowerCase().split(' ').join('-')">{{ item.situacao }}</span></td>
                  <td><code>{{ item.protocolo || '-' }}</code></td>
                </tr>
              }
            </tbody>
          }

          <!-- Tabela de Folha -->
          @if (tipoRelatorio === 'folha') {
            <thead>
              <tr>
                <th>Empresa</th>
                <th>Competência</th>
                <th>Prazo Legal</th>
                <th>Funcionários</th>
                <th>Responsável</th>
                <th>Status</th>
                <th>Data Entrega</th>
              </tr>
            </thead>
            <tbody>
              @for (item of registros; track item.id) {
                <tr>
                  <td><strong>{{ getNomeEmpresa(item.empresaId) }}</strong></td>
                  <td>{{ item.competencia }}</td>
                  <td>{{ item.prazoPrevisto }}</td>
                  <td>{{ item.totalFuncionarios }} vidas</td>
                  <td>{{ item.responsavel }}</td>
                  <td><span class="status-badge" [ngClass]="item.situacao.toLowerCase().split(' ').join('-')">{{ item.situacao }}</span></td>
                  <td>{{ item.dataEntrega ? formatarData(item.dataEntrega) : '-' }}</td>
                </tr>
              }
            </tbody>
          }

          <!-- Tabela de Serviços -->
          @if (tipoRelatorio === 'servicos') {
            <thead>
              <tr>
                <th>Título</th>
                <th>Empresa</th>
                <th>Categoria</th>
                <th>Prioridade</th>
                <th>Responsável</th>
                <th>Prazo</th>
                <th>Situação</th>
              </tr>
            </thead>
            <tbody>
              @for (item of registros; track item.id) {
                <tr>
                  <td><strong>{{ item.titulo }}</strong></td>
                  <td>{{ getNomeEmpresa(item.empresaId) }}</td>
                  <td>{{ item.categoria }}</td>
                  <td>{{ item.prioridade }}</td>
                  <td>{{ item.responsavel }}</td>
                  <td>{{ formatarData(item.prazoEntrega) }}</td>
                  <td><span class="status-badge" [ngClass]="item.situacao.toLowerCase().split(' ').join('-')">{{ item.situacao }}</span></td>
                </tr>
              }
            </tbody>
          }

          <!-- Tabela de Empresas -->
          @if (tipoRelatorio === 'empresas') {
            <thead>
              <tr>
                <th>Empresa</th>
                <th>Razão Social</th>
                <th>CNPJ</th>
                <th>Regime</th>
                <th>Responsável</th>
                <th>Contador Interno</th>
                <th>Situação</th>
              </tr>
            </thead>
            <tbody>
              @for (item of registros; track item.id) {
                <tr>
                  <td><strong>{{ item.nomeFantasia }}</strong></td>
                  <td>{{ item.razaoSocial }}</td>
                  <td><code>{{ item.cnpj }}</code></td>
                  <td>{{ item.regimeTributario }}</td>
                  <td>{{ item.responsavel }}</td>
                  <td>{{ item.responsavelInterno }}</td>
                  <td><span class="status-badge" [ngClass]="item.situacao.toLowerCase().split(' ').join('-')">{{ item.situacao }}</span></td>
                </tr>
              }
            </tbody>
          }

          <!-- Tabela de Parcelamentos -->
          @if (tipoRelatorio === 'parcelamentos') {
            <thead>
              <tr>
                <th>Empresa</th>
                <th>Órgão</th>
                <th>Acordo</th>
                <th>Adesão</th>
                <th>Parcelas Pagas</th>
                <th>Valor Parcela</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              @for (item of registros; track item.id) {
                <tr>
                  <td><strong>{{ getNomeEmpresa(item.empresaId) }}</strong></td>
                  <td>{{ item.orgao }}</td>
                  <td><code>{{ item.numeroAcordo }}</code></td>
                  <td>{{ formatarData(item.dataAdesao) }}</td>
                  <td>{{ item.parcelasPagas }} / {{ item.totalParcelas }}</td>
                  <td>{{ formatarMoeda(item.valorParcela) }}</td>
                  <td><span class="status-badge" [ngClass]="item.situacao.toLowerCase().split(' ').join('-')">{{ item.situacao }}</span></td>
                </tr>
              }
            </tbody>
          }

          <!-- Tabela de Documentos -->
          @if (tipoRelatorio === 'documentos') {
            <thead>
              <tr>
                <th>Empresa</th>
                <th>Documento</th>
                <th>Categoria</th>
                <th>Solicitado em</th>
                <th>Prazo</th>
                <th>Responsável</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              @for (item of registros; track item.id) {
                <tr>
                  <td><strong>{{ getNomeEmpresa(item.empresaId) }}</strong></td>
                  <td>{{ item.nome }}</td>
                  <td>{{ item.categoria }}</td>
                  <td>{{ formatarData(item.dataSolicitacao) }}</td>
                  <td>{{ formatarData(item.prazoEnvio) }}</td>
                  <td>{{ item.responsavel }}</td>
                  <td><span class="status-badge" [ngClass]="item.situacao.toLowerCase().split(' ').join('-')">{{ item.situacao }}</span></td>
                </tr>
              }
            </tbody>
          }
        </table>
      </div>
    </div>
  `
})
export class RelatoriosComponent implements OnInit {
  private dataService = inject(DataService);

  empresas: any[] = [];
  tipoRelatorio: string = 'impostos';
  filtroEmpresa: string = 'Todas';

  tituloRelatorio: string = '';
  kpis: any[] = [];
  registros: any[] = [];

  ngOnInit() {
    this.empresas = this.dataService.getEmpresas();
    this.gerarRelatorio();
  }

  getNomeEmpresa(empresaId: number): string {
    const emp = this.dataService.getEmpresaById(empresaId);
    return emp ? emp.nomeFantasia : '';
  }

  gerarRelatorio() {
    const empFilter = this.filtroEmpresa !== 'Todas' ? { empresaId: Number(this.filtroEmpresa) } : {};

    if (this.tipoRelatorio === 'impostos') {
      this.tituloRelatorio = 'Relatório Analítico de Obrigações & Impostos Fiscais';
      const impostos = this.dataService.getImpostos(empFilter);
      this.registros = impostos;

      const concluidos = impostos.filter((i: any) => i.situacao === 'Concluída' || i.situacao === 'Entregue').length;
      const pendentes = impostos.filter((i: any) => i.situacao === 'Pendente' || i.situacao === 'Em Andamento').length;
      const valorTotal = impostos.reduce((a: number, c: any) => a + (Number(c.valor) || 0), 0);

      this.kpis = [
        { title: 'Total de Obrigações', value: impostos.length },
        { title: 'Concluídas / Transmitidas', value: concluidos, colorClass: 'text-green' },
        { title: 'Pendentes de Envio', value: pendentes, colorStyle: 'var(--warning)' },
        { title: 'Total em Guias', value: this.formatarMoeda(valorTotal), fontSize: '1.4rem' }
      ];
    } else if (this.tipoRelatorio === 'folha') {
      this.tituloRelatorio = 'Relatório de Folha de Pagamento & Encargos';
      const folhas = this.dataService.getFolha(empFilter);
      this.registros = folhas;

      const fechadas = folhas.filter((f: any) => f.situacao === 'Fechada' || f.situacao === 'Entregue').length;
      const totalVidas = folhas.reduce((a: number, c: any) => a + (Number(c.totalFuncionarios) || 0), 0);

      this.kpis = [
        { title: 'Folhas Analisadas', value: folhas.length },
        { title: 'Folhas Fechadas', value: fechadas, colorClass: 'text-green' },
        { title: 'Total de Vidas Atendidas', value: `${totalVidas} colaboradores` },
        { title: 'Prazos de Pagamento', value: '5º dia útil', fontSize: '1.25rem' }
      ];
    } else if (this.tipoRelatorio === 'servicos') {
      this.tituloRelatorio = 'Relatório de Serviços & Produtividade da Equipe';
      const servicos = this.dataService.getServicos(empFilter);
      this.registros = servicos;

      const concluidos = servicos.filter((s: any) => s.situacao === 'Concluído').length;
      const abertos = servicos.filter((s: any) => s.situacao !== 'Concluído').length;
      const taxa = servicos.length ? Math.round((concluidos / servicos.length) * 100) : 0;

      this.kpis = [
        { title: 'Total de Serviços', value: servicos.length },
        { title: 'Concluídos com Sucesso', value: concluidos, colorClass: 'text-green' },
        { title: 'Em Andamento / Abertos', value: abertos, colorStyle: 'var(--primary)' },
        { title: 'Taxa de Resolução', value: `${taxa}%`, fontSize: '1.4rem' }
      ];
    } else if (this.tipoRelatorio === 'empresas') {
      this.tituloRelatorio = 'Resumo da Carteira de Clientes & Regimes Tributários';
      const empresas = this.dataService.getEmpresas();
      this.registros = empresas;

      const ativas = empresas.filter((e: any) => e.situacao === 'Ativa').length;
      const simples = empresas.filter((e: any) => e.regimeTributario === 'Simples Nacional').length;

      this.kpis = [
        { title: 'Total de Empresas', value: empresas.length },
        { title: 'Empresas Ativas', value: ativas, colorClass: 'text-green' },
        { title: 'Simples Nacional', value: simples, colorStyle: 'var(--gold)' },
        { title: 'Lucro Presumido', value: empresas.length - simples, colorStyle: 'var(--purple)' }
      ];
    } else if (this.tipoRelatorio === 'parcelamentos') {
      this.tituloRelatorio = 'Relatório de Parcelamentos Tributários';
      const parcelamentos = this.dataService.getParcelamentos();
      this.registros = parcelamentos;

      this.kpis = [
        { title: 'Acordos Ativos', value: parcelamentos.length },
        { title: 'Órgãos Principais', value: 'RFB / PGFN / PMSP', fontSize: '1.15rem' },
        { title: 'Controle de Débitos', value: 'Em Dia', colorClass: 'text-green' },
        { title: 'Transações Especiais', value: 'Simples / PPI' }
      ];
    } else if (this.tipoRelatorio === 'documentos') {
      this.tituloRelatorio = 'Relatório de Pendências de Documentos de Clientes';
      const docs = this.dataService.getDocumentos();
      this.registros = docs;

      const recebidos = docs.filter((d: any) => d.situacao === 'Recebido' || d.situacao === 'Aprovado').length;
      const pendentes = docs.filter((d: any) => d.situacao === 'Solicitado' || d.situacao === 'Aguardando Cliente').length;
      const taxa = docs.length ? Math.round((recebidos / docs.length) * 100) : 0;

      this.kpis = [
        { title: 'Total Solicitado', value: docs.length },
        { title: 'Recebidos / Aprovados', value: recebidos, colorClass: 'text-green' },
        { title: 'Aguardando Cliente', value: pendentes, colorStyle: 'var(--warning)' },
        { title: 'Taxa de Retorno', value: `${taxa}%`, fontSize: '1.4rem' }
      ];
    }
  }

  exportarCSV() {
    const tipo = this.tipoRelatorio;
    const empFilter = this.filtroEmpresa !== 'Todas' ? { empresaId: Number(this.filtroEmpresa) } : {};
    let rows: any[] = [];
    const filename = `relatorio_${tipo}_waldo_contabilidade`;

    if (tipo === 'impostos') {
      rows = this.dataService.getImpostos(empFilter).map((i: any) => ({
        'Empresa': this.getNomeEmpresa(i.empresaId),
        'Tributo': i.tipo,
        'Competência': i.competencia,
        'Vencimento': i.vencimento,
        'Valor (R$)': i.valor,
        'Responsável': i.responsavel,
        'Situação': i.situacao,
        'Protocolo': i.protocolo || ''
      }));
    } else if (tipo === 'folha') {
      rows = this.dataService.getFolha(empFilter).map((f: any) => ({
        'Empresa': this.getNomeEmpresa(f.empresaId),
        'Competência': f.competencia,
        'Prazo': f.prazoPrevisto,
        'Colaboradores': f.totalFuncionarios,
        'Responsável': f.responsavel,
        'Situação': f.situacao,
        'Data Entrega': f.dataEntrega || ''
      }));
    } else if (tipo === 'servicos') {
      rows = this.dataService.getServicos(empFilter).map((s: any) => ({
        'Título': s.titulo,
        'Empresa': this.getNomeEmpresa(s.empresaId),
        'Categoria': s.categoria,
        'Prioridade': s.prioridade,
        'Responsável': s.responsavel,
        'Prazo': s.prazoEntrega,
        'Situação': s.situacao
      }));
    } else if (tipo === 'empresas') {
      rows = this.dataService.getEmpresas().map((e: any) => ({
        'Nome Fantasia': e.nomeFantasia,
        'Razão Social': e.razaoSocial,
        'CNPJ': e.cnpj,
        'Regime': e.regimeTributario,
        'Responsável': e.responsavel,
        'Situação': e.situacao
      }));
    } else if (tipo === 'parcelamentos') {
      rows = this.dataService.getParcelamentos().map((p: any) => ({
        'Empresa': this.getNomeEmpresa(p.empresaId),
        'Órgão': p.orgao,
        'Acordo': p.numeroAcordo,
        'Parcelas': `${p.parcelasPagas}/${p.totalParcelas}`,
        'Valor (R$)': p.valorParcela,
        'Situação': p.situacao
      }));
    } else if (tipo === 'documentos') {
      rows = this.dataService.getDocumentos().map((d: any) => ({
        'Empresa': this.getNomeEmpresa(d.empresaId),
        'Documento': d.nome,
        'Categoria': d.categoria,
        'Prazo': d.prazoEnvio,
        'Responsável': d.responsavel,
        'Situação': d.situacao
      }));
    }

    this.dataService.exportToCSV(filename, rows);
  }

  imprimir() {
    if (typeof window !== 'undefined') {
      window.print();
    }
  }

  formatarData(dataStr: string): string {
    if (!dataStr) return '-';
    const [y, m, d] = dataStr.split('-');
    return `${d}/${m}/${y}`;
  }

  formatarMoeda(val: number): string {
    return (Number(val) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
}
