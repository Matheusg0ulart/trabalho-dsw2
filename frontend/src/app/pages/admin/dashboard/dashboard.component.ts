import { Component, OnInit, AfterViewInit, inject, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DataService } from '../../../services/data.service';

declare const Chart: any;

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <!-- Banner Informativo -->
    <div class="admin-banner-notice" style="margin-bottom: 24px; padding: 14px 18px; background-color: var(--primary-light); border: 1px solid rgba(37,99,235,0.2); border-radius: var(--radius-md); display: flex; align-items: center; justify-content: space-between;">
      <div class="notice-text" style="display: flex; align-items: center; gap: 12px; font-size: 0.88rem; color: var(--navy-800);">
        <i class="fa-solid fa-circle-info" style="font-size: 1.2rem; color: var(--primary);"></i>
        <div>
          <strong>Painel conectado ao banco de dados</strong> — Indicadores e registros são carregados da API do sistema e atualizados conforme os cadastros do escritório.
        </div>
      </div>
    </div>

    <!-- Grade de Indicadores Principais (KPIs) -->
    <div class="kpi-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 18px; margin-bottom: 24px;">
      <!-- Empresas Ativas -->
      <a routerLink="/admin/empresas" [queryParams]="{situacao: 'Ativa'}" class="kpi-card">
        <div class="kpi-header">
          <span class="kpi-title">Empresas Ativas</span>
          <div class="kpi-icon blue"><i class="fa-solid fa-building-circle-check"></i></div>
        </div>
        <div class="kpi-value">{{ kpis.empresasAtivas }}</div>
        <div class="kpi-sub"><i class="fa-solid fa-arrow-trend-up text-green"></i> <span>{{ kpis.empresasProcesso }}</span> em abertura/regularização</div>
      </a>

      <!-- Obrigações Fiscais Pendentes -->
      <a routerLink="/admin/impostos" [queryParams]="{situacao: 'Pendente'}" class="kpi-card">
        <div class="kpi-header">
          <span class="kpi-title">Obrigações Pendentes</span>
          <div class="kpi-icon gold"><i class="fa-solid fa-receipt"></i></div>
        </div>
        <div class="kpi-value">{{ kpis.impostosPendentes }}</div>
        <div class="kpi-sub"><i class="fa-solid fa-clock" style="color: var(--warning);"></i> <span>{{ kpis.impostosProximos }}</span> próximas ao vencimento</div>
      </a>

      <!-- Obrigações Atrasadas -->
      <a routerLink="/admin/impostos" [queryParams]="{situacao: 'Atrasada'}" class="kpi-card">
        <div class="kpi-header">
          <span class="kpi-title">Obrigações em Atraso</span>
          <div class="kpi-icon red"><i class="fa-solid fa-triangle-exclamation"></i></div>
        </div>
        <div class="kpi-value" style="color: var(--danger);">{{ kpis.impostosAtrasados }}</div>
        <div class="kpi-sub"><i class="fa-solid fa-circle-exclamation" style="color: var(--danger);"></i> Exige emissão com juros/multa</div>
      </a>

      <!-- Folha de Pagamento -->
      <a routerLink="/admin/folha" class="kpi-card">
        <div class="kpi-header">
          <span class="kpi-title">Folhas a Processar</span>
          <div class="kpi-icon purple"><i class="fa-solid fa-users"></i></div>
        </div>
        <div class="kpi-value">{{ kpis.folhaPendente }}</div>
        <div class="kpi-sub"><i class="fa-solid fa-calendar-check" style="color: var(--info);"></i> Competência ativa do mês</div>
      </a>
    </div>

    <!-- Grade Secundária de Indicadores -->
    <div class="kpi-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 18px; margin-bottom: 24px;">
      <!-- Serviços Abertos -->
      <a routerLink="/admin/servicos" class="kpi-card">
        <div class="kpi-header">
          <span class="kpi-title">Serviços em Aberto</span>
          <div class="kpi-icon blue"><i class="fa-solid fa-list-check"></i></div>
        </div>
        <div class="kpi-value">{{ kpis.servicosAbertos }}</div>
        <div class="kpi-sub"><span style="color: var(--danger); font-weight: 700;">{{ kpis.servicosAtrasados }}</span> serviços com prazo vencido</div>
      </a>

      <!-- Notas Fiscais -->
      <a routerLink="/admin/notas-fiscais" class="kpi-card">
        <div class="kpi-header">
          <span class="kpi-title">Notas Aguardando</span>
          <div class="kpi-icon gold"><i class="fa-solid fa-file-invoice"></i></div>
        </div>
        <div class="kpi-value">{{ kpis.notasPendentes }}</div>
        <div class="kpi-sub"><i class="fa-solid fa-paper-plane" style="color: var(--gold);"></i> Solicitações de clientes</div>
      </a>

      <!-- Parcelamentos Ativos -->
      <a routerLink="/admin/parcelamentos" class="kpi-card">
        <div class="kpi-header">
          <span class="kpi-title">Parcelamentos Ativos</span>
          <div class="kpi-icon green"><i class="fa-solid fa-hand-holding-dollar"></i></div>
        </div>
        <div class="kpi-value">{{ kpis.parcelamentosAtivos }}</div>
        <div class="kpi-sub"><i class="fa-solid fa-shield-check" style="color: var(--success);"></i> Acordos RFB, PGFN e Prefeituras</div>
      </a>

      <!-- Documentos Pendentes -->
      <a routerLink="/admin/documentos" class="kpi-card">
        <div class="kpi-header">
          <span class="kpi-title">Documentos Pendentes</span>
          <div class="kpi-icon purple"><i class="fa-solid fa-folder-open"></i></div>
        </div>
        <div class="kpi-value">{{ kpis.documentosPendentes }}</div>
        <div class="kpi-sub"><i class="fa-solid fa-hourglass-half" style="color: var(--purple);"></i> Aguardando envio de clientes</div>
      </a>
    </div>

    <!-- Gráficos Gerenciais -->
    <div class="charts-grid-2" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 24px; margin-bottom: 24px;">
      <div class="chart-card" style="background: var(--bg-card); padding: 22px; border-radius: var(--radius-lg); border: 1px solid var(--border-color); box-shadow: var(--shadow-card);">
        <div class="chart-card-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <h3 style="font-family: var(--font-heading); font-size: 1.05rem; font-weight: 700; color: var(--text-primary);">Obrigações Fiscais por Situação</h3>
          <span class="badge-tag" style="font-size: 0.7rem;">Mês Vigente</span>
        </div>
        <div class="chart-canvas-container" style="height: 260px; position: relative;">
          <canvas id="chartImpostosSituacao"></canvas>
        </div>
      </div>

      <div class="chart-card" style="background: var(--bg-card); padding: 22px; border-radius: var(--radius-lg); border: 1px solid var(--border-color); box-shadow: var(--shadow-card);">
        <div class="chart-card-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <h3 style="font-family: var(--font-heading); font-size: 1.05rem; font-weight: 700; color: var(--text-primary);">Empresas por Regime Tributário</h3>
          <span class="badge-tag gold-tag" style="font-size: 0.7rem;">Carteira Ativa</span>
        </div>
        <div class="chart-canvas-container" style="height: 260px; position: relative;">
          <canvas id="chartRegimes"></canvas>
        </div>
      </div>
    </div>

    <!-- Seções Críticas: Prazos Imediatos e Atividades Recentes -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 24px;">
      <!-- Prazos Críticos -->
      <div class="table-card" style="background: var(--bg-card); padding: 24px; border-radius: var(--radius-lg); border: 1px solid var(--border-color); box-shadow: var(--shadow-card);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px;">
          <div>
            <h3 style="font-family: var(--font-heading); font-size: 1.15rem; color: var(--text-primary); font-weight: 700; margin: 0;">
              <i class="fa-solid fa-triangle-exclamation" style="color: var(--danger); margin-right: 6px;"></i>
              Prazos Críticos & Vencimentos Imediatos
            </h3>
            <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 4px;">Itens que demandam ação prioritária da equipe contábil hoje</p>
          </div>
          <a routerLink="/admin/agenda" class="btn btn-sm btn-contador" style="font-size: 0.8rem; padding: 6px 12px;">Ver Agenda</a>
        </div>

        <div class="table-responsive">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Empresa</th>
                <th>Vencimento</th>
                <th>Status</th>
                <th>Ação</th>
              </tr>
            </thead>
            <tbody>
              @for (item of prazosCriticos; track item.id) {
                <tr>
                  <td><span class="badge-tag" style="font-size: 0.68rem;">{{ item.tipoBadge }}</span></td>
                  <td>
                    <strong>{{ item.empresa }}</strong><br>
                    <span style="font-size: 0.75rem; color: var(--text-muted);">{{ item.titulo }}</span>
                  </td>
                  <td>
                    <strong [style.color]="item.isAtrasada ? 'var(--danger)' : 'var(--warning)'">
                      {{ item.prazo }}
                    </strong>
                  </td>
                  <td>
                    <span class="status-badge" [ngClass]="item.isAtrasada ? 'atrasada' : 'pendente'">
                      {{ item.isAtrasada ? 'Atrasado' : 'Vence Hoje' }}
                    </span>
                  </td>
                  <td>
                    <a [routerLink]="item.link" class="btn-icon-action" title="Resolver">
                      <i class="fa-solid fa-arrow-right"></i>
                    </a>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Feed de Atividades Recentes -->
      <div class="table-card" style="background: var(--bg-card); padding: 24px; border-radius: var(--radius-lg); border: 1px solid var(--border-color); box-shadow: var(--shadow-card);">
        <h3 style="font-family: var(--font-heading); font-size: 1.15rem; color: var(--text-primary); font-weight: 700; margin-bottom: 4px;">
          <i class="fa-solid fa-clock-rotate-left" style="color: var(--primary); margin-right: 6px;"></i>
          Atividades Recentes
        </h3>
        <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 18px;">Registros demonstrativos das rotinas do escritório</p>

        <div style="display: flex; flex-direction: column; gap: 14px;">
          <div style="display: flex; gap: 12px; align-items: flex-start; padding-bottom: 12px; border-bottom: 1px solid var(--border-color);">
            <div class="kpi-icon green" style="width: 34px; height: 34px; font-size: 0.85rem;"><i class="fa-solid fa-check"></i></div>
            <div>
              <strong style="font-size: 0.85rem; display: block;">CND Federal Emitida</strong>
              <span style="font-size: 0.78rem; color: var(--text-secondary);">Inovare Engenharia - Certidão Negativa válida até abr/2027</span>
              <span style="font-size: 0.7rem; color: var(--text-muted); display: block; margin-top: 2px;">16/10 às 11:20 por Ricardo Mendes</span>
            </div>
          </div>

          <div style="display: flex; gap: 12px; align-items: flex-start; padding-bottom: 12px; border-bottom: 1px solid var(--border-color);">
            <div class="kpi-icon blue" style="width: 34px; height: 34px; font-size: 0.85rem;"><i class="fa-solid fa-file-invoice"></i></div>
            <div>
              <strong style="font-size: 0.85rem; display: block;">Guia DAS Transmitida</strong>
              <span style="font-size: 0.78rem; color: var(--text-secondary);">Empório Lima - Competência 09/2026 no valor de R$ 11.450,00</span>
              <span style="font-size: 0.7rem; color: var(--text-muted); display: block; margin-top: 2px;">18/10 às 15:40 por Carlos Silveira</span>
            </div>
          </div>

          <div style="display: flex; gap: 12px; align-items: flex-start; padding-bottom: 12px; border-bottom: 1px solid var(--border-color);">
            <div class="kpi-icon purple" style="width: 34px; height: 34px; font-size: 0.85rem;"><i class="fa-solid fa-users"></i></div>
            <div>
              <strong style="font-size: 0.85rem; display: block;">Folha 09/2026 Fechada</strong>
              <span style="font-size: 0.78rem; color: var(--text-secondary);">Clínica Saúde & Vida - Holerites e pró-labore enviados</span>
              <span style="font-size: 0.7rem; color: var(--text-muted); display: block; margin-top: 2px;">05/10 às 16:10 por Beatriz Oliveira</span>
            </div>
          </div>

          <div style="display: flex; gap: 12px; align-items: flex-start;">
            <div class="kpi-icon gold" style="width: 34px; height: 34px; font-size: 0.85rem;"><i class="fa-solid fa-file-signature"></i></div>
            <div>
              <strong style="font-size: 0.85rem; display: block;">DBE Deferido na Receita</strong>
              <span style="font-size: 0.78rem; color: var(--text-secondary);">Nexus Digital - Processo de abertura avançado para a Prefeitura</span>
              <span style="font-size: 0.7rem; color: var(--text-muted); display: block; margin-top: 2px;">14/10 às 09:30 por Juliana Martins</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit, AfterViewInit {
  private dataService = inject(DataService);
  private el = inject(ElementRef);

  get kpis() {
    return this.dataService.getDashboardKPIs();
  }

  prazosCriticos: any[] = [];

  ngOnInit() {
    this.carregarPrazosCriticos();
  }

  ngAfterViewInit() {
    if (typeof window !== 'undefined') {
      setTimeout(() => this.renderCharts(), 100);
    }
  }

  carregarPrazosCriticos() {
    const impostos = this.dataService.getImpostos().filter(
      (i: any) => i.situacao === 'Atrasada' || i.vencimento === '2026-10-20'
    );
    const servicos = this.dataService.getServicos().filter(
      (s: any) => s.prazoEntrega <= '2026-10-20' && s.situacao !== 'Concluído'
    );

    const list: any[] = [];

    impostos.forEach((i: any) => {
      const emp = this.dataService.getEmpresaById(i.empresaId);
      list.push({
        id: `imp-${i.id}`,
        tipoBadge: 'Fiscal',
        titulo: i.tipo,
        empresa: emp ? emp.nomeFantasia : 'Empresa',
        prazo: i.vencimento,
        isAtrasada: i.situacao === 'Atrasada',
        link: '/admin/impostos'
      });
    });

    servicos.forEach((s: any) => {
      const emp = this.dataService.getEmpresaById(s.empresaId);
      list.push({
        id: `serv-${s.id}`,
        tipoBadge: 'Serviço',
        titulo: s.titulo,
        empresa: emp ? emp.nomeFantasia : 'Geral',
        prazo: s.prazoEntrega,
        isAtrasada: s.prazoEntrega < '2026-10-20',
        link: '/admin/servicos'
      });
    });

    this.prazosCriticos = list.slice(0, 5);
  }

  renderCharts() {
    if (typeof Chart === 'undefined') return;

    // Chart 1: Impostos por Situação
    const ctx1 = this.el.nativeElement.querySelector('#chartImpostosSituacao');
    if (ctx1) {
      const impostos = this.dataService.getImpostos();
      const concluidos = impostos.filter((i: any) => i.situacao === 'Concluída' || i.situacao === 'Entregue').length;
      const pendentes = impostos.filter((i: any) => i.situacao === 'Pendente' || i.situacao === 'Pronta para Entrega').length;
      const emAndamento = impostos.filter((i: any) => i.situacao === 'Em Andamento' || i.situacao === 'Aguardando Documentos').length;
      const atrasadas = impostos.filter((i: any) => i.situacao === 'Atrasada').length;

      new Chart(ctx1, {
        type: 'doughnut',
        data: {
          labels: ['Concluídas', 'Pendentes', 'Em Andamento', 'Atrasadas'],
          datasets: [{
            data: [concluidos, pendentes, emAndamento, atrasadas],
            backgroundColor: ['#10b981', '#f59e0b', '#3b82f6', '#ef4444'],
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom' } },
          cutout: '65%'
        }
      });
    }

    // Chart 2: Empresas por Regime
    const ctx2 = this.el.nativeElement.querySelector('#chartRegimes');
    if (ctx2) {
      const empresas = this.dataService.getEmpresas();
      const simples = empresas.filter((e: any) => e.regimeTributario === 'Simples Nacional').length;
      const presumido = empresas.filter((e: any) => e.regimeTributario === 'Lucro Presumido').length;
      const real = empresas.filter((e: any) => e.regimeTributario === 'Lucro Real').length;

      new Chart(ctx2, {
        type: 'pie',
        data: {
          labels: ['Simples Nacional', 'Lucro Presumido', 'Lucro Real'],
          datasets: [{
            data: [simples, presumido, real],
            backgroundColor: ['#2563eb', '#d97706', '#8b5cf6'],
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom' } }
        }
      });
    }
  }
}
