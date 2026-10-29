import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DEFAULT_DATA } from './default-data';
import { AuthService } from './auth.service';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  private readonly STORAGE_KEY = 'WALDO_CONTABILIDADE_DEMO_DATA_V1';
  public data: any;

  constructor() {
    this.data = this.load();
    if (this.isBrowser) {
      this.hydrateFromApi();
    }
  }

  get isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  load(): any {
    if (this.isBrowser) {
      try {
        const raw = localStorage.getItem(this.STORAGE_KEY);
        if (raw) {
          return JSON.parse(raw);
        }
      } catch (e) {
        console.warn('Não foi possível carregar do localStorage, usando padrões.', e);
      }
    }
    return JSON.parse(JSON.stringify(DEFAULT_DATA));
  }

  save(): void {
    if (this.isBrowser) {
      try {
        const safeCopy = JSON.parse(JSON.stringify(this.data));
        if (safeCopy.usuarios) {
          safeCopy.usuarios.forEach((u: any) => delete u.senha);
        }
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(safeCopy));
      } catch (e) {
        console.error('Erro ao salvar no localStorage', e);
      }
    }
  }

  async hydrateFromApi() {
    const authHeader = this.auth.getAuthHeader();
    if (!authHeader || this.auth.isDemoMode()) return;

    try {
      const headers = new HttpHeaders({ Authorization: `Basic ${authHeader}` });
      const [empresas, impostos, folhas, servicos, notas, parcelamentos, docs, notifs] = await Promise.all([
        firstValueFrom(this.http.get<any[]>('/api/empresas?size=100', { headers })).catch(() => null),
        firstValueFrom(this.http.get<any[]>('/api/impostos?size=100', { headers })).catch(() => null),
        firstValueFrom(this.http.get<any[]>('/api/folhas?size=100', { headers })).catch(() => null),
        firstValueFrom(this.http.get<any[]>('/api/servicos?size=100', { headers })).catch(() => null),
        firstValueFrom(this.http.get<any[]>('/api/notas-fiscais?size=100', { headers })).catch(() => null),
        firstValueFrom(this.http.get<any[]>('/api/parcelamentos?size=100', { headers })).catch(() => null),
        firstValueFrom(this.http.get<any[]>('/api/documentos?size=100', { headers })).catch(() => null),
        firstValueFrom(this.http.get<any[]>('/api/notificacoes?size=100', { headers })).catch(() => null),
      ]);

      if (empresas) this.data.empresas = Array.isArray(empresas) ? empresas : ((empresas as any).content || []);
      if (impostos) this.data.impostos = Array.isArray(impostos) ? impostos : ((impostos as any).content || []);
      if (folhas) this.data.folha = Array.isArray(folhas) ? folhas : ((folhas as any).content || []);
      if (servicos) this.data.servicos = Array.isArray(servicos) ? servicos : ((servicos as any).content || []);
      if (notas) this.data.notasFiscais = Array.isArray(notas) ? notas : ((notas as any).content || []);
      if (parcelamentos) this.data.parcelamentos = Array.isArray(parcelamentos) ? parcelamentos : ((parcelamentos as any).content || []);
      if (docs) this.data.documentos = Array.isArray(docs) ? docs : ((docs as any).content || []);
      if (notifs) this.data.notificacoes = Array.isArray(notifs) ? notifs : ((notifs as any).content || []);

      this.save();
    } catch (e) {
      console.warn('API hydration fallback to cached data', e);
    }
  }

  // ==========================================
  // EMPRESAS
  // ==========================================
  getEmpresas(filtros: any = {}) {
    let list = [...this.data.empresas];
    if (filtros.busca) {
      const q = filtros.busca.toLowerCase();
      list = list.filter((e: any) =>
        (e.razaoSocial && e.razaoSocial.toLowerCase().includes(q)) ||
        (e.nomeFantasia && e.nomeFantasia.toLowerCase().includes(q)) ||
        (e.cnpj && e.cnpj.includes(q))
      );
    }
    if (filtros.situacao && filtros.situacao !== 'Todas') {
      list = list.filter((e: any) => e.situacao === filtros.situacao);
    }
    if (filtros.regime && filtros.regime !== 'Todos') {
      list = list.filter((e: any) => e.regimeTributario === filtros.regime);
    }
    if (filtros.ordem) {
      switch (filtros.ordem) {
        case 'nomeAsc':
          list.sort((a: any, b: any) => (a.nomeFantasia || '').localeCompare(b.nomeFantasia || ''));
          break;
        case 'nomeDesc':
          list.sort((a: any, b: any) => (b.nomeFantasia || '').localeCompare(a.nomeFantasia || ''));
          break;
        case 'inicioAsc':
          list.sort((a: any, b: any) => (a.dataInicio || '').localeCompare(b.dataInicio || ''));
          break;
        case 'inicioDesc':
          list.sort((a: any, b: any) => (b.dataInicio || '').localeCompare(a.dataInicio || ''));
          break;
      }
    }
    return list;
  }

  getEmpresaById(id: number | string) {
    return this.data.empresas.find((e: any) => Number(e.id) === Number(id));
  }

  saveEmpresa(empresaData: any) {
    if (empresaData.id) {
      const index = this.data.empresas.findIndex((e: any) => Number(e.id) === Number(empresaData.id));
      if (index !== -1) {
        this.data.empresas[index] = { ...this.data.empresas[index], ...empresaData };
        this.save();
        return this.data.empresas[index];
      }
    } else {
      const newId = this.data.empresas.length > 0 ? Math.max(...this.data.empresas.map((e: any) => Number(e.id))) + 1 : 1;
      const newEmpresa = {
        id: newId,
        ...empresaData,
        dataInicio: empresaData.dataInicio || new Date().toISOString().split('T')[0],
        situacao: empresaData.situacao || 'Ativa'
      };
      this.data.empresas.push(newEmpresa);
      this.save();
      return newEmpresa;
    }
  }

  desativarEmpresa(id: number | string) {
    const emp = this.getEmpresaById(id);
    if (emp) {
      emp.situacao = (emp.situacao === 'Inativa') ? 'Ativa' : 'Inativa';
      this.save();
      return emp;
    }
    return null;
  }

  // ==========================================
  // IMPOSTOS & OBRIGAÇÕES FISCAIS
  // ==========================================
  getImpostos(filtros: any = {}) {
    let list = [...this.data.impostos];
    if (filtros.busca) {
      const q = filtros.busca.toLowerCase();
      list = list.filter((item: any) => {
        const emp = this.getEmpresaById(item.empresaId);
        const empNome = emp ? emp.nomeFantasia.toLowerCase() : '';
        return (item.tipo && item.tipo.toLowerCase().includes(q)) ||
               empNome.includes(q) ||
               (item.protocolo && item.protocolo.toLowerCase().includes(q));
      });
    }
    if (filtros.empresaId && filtros.empresaId !== 'Todas') {
      list = list.filter((i: any) => Number(i.empresaId) === Number(filtros.empresaId));
    }
    if (filtros.competencia && filtros.competencia !== 'Todas') {
      list = list.filter((i: any) => i.competencia === filtros.competencia);
    }
    if (filtros.situacao && filtros.situacao !== 'Todas') {
      list = list.filter((i: any) => i.situacao === filtros.situacao);
    }
    return list;
  }

  saveImposto(data: any) {
    if (data.id) {
      const idx = this.data.impostos.findIndex((i: any) => Number(i.id) === Number(data.id));
      if (idx !== -1) {
        this.data.impostos[idx] = { ...this.data.impostos[idx], ...data };
        this.save();
        return this.data.impostos[idx];
      }
    } else {
      const newId = this.data.impostos.length > 0 ? Math.max(...this.data.impostos.map((i: any) => Number(i.id))) + 1 : 101;
      const newImposto = { id: newId, ...data };
      this.data.impostos.push(newImposto);
      this.save();
      return newImposto;
    }
  }

  concluirImposto(id: number | string) {
    const imp = this.data.impostos.find((i: any) => Number(i.id) === Number(id));
    if (imp) {
      imp.situacao = 'Concluída';
      imp.protocolo = imp.protocolo || `REC-${Date.now().toString().slice(-6)}`;
      this.save();
      return imp;
    }
    return null;
  }

  // ==========================================
  // FOLHA DE PAGAMENTO
  // ==========================================
  getFolha(filtros: any = {}) {
    let list = [...this.data.folha];
    if (filtros.empresaId && filtros.empresaId !== 'Todas') {
      list = list.filter((f: any) => Number(f.empresaId) === Number(filtros.empresaId));
    }
    if (filtros.competencia && filtros.competencia !== 'Todas') {
      list = list.filter((f: any) => f.competencia === filtros.competencia);
    }
    if (filtros.situacao && filtros.situacao !== 'Todas') {
      list = list.filter((f: any) => f.situacao === filtros.situacao);
    }
    return list;
  }

  updateFolhaStatus(id: number | string, novaSituacao: string) {
    const f = this.data.folha.find((item: any) => Number(item.id) === Number(id));
    if (f) {
      f.situacao = novaSituacao;
      if (novaSituacao === 'Fechada' && !f.dataFechamento) {
        f.dataFechamento = new Date().toISOString().split('T')[0];
      }
      if (novaSituacao === 'Entregue' && !f.dataEntrega) {
        f.dataEntrega = new Date().toISOString().split('T')[0];
      }
      this.save();
      return f;
    }
    return null;
  }

  // ==========================================
  // SERVIÇOS E TAREFAS
  // ==========================================
  getServicos(filtros: any = {}) {
    let list = [...this.data.servicos];
    if (filtros.empresaId && filtros.empresaId !== 'Todas') {
      list = list.filter((s: any) => Number(s.empresaId) === Number(filtros.empresaId));
    }
    if (filtros.situacao && filtros.situacao !== 'Todas') {
      list = list.filter((s: any) => s.situacao === filtros.situacao);
    }
    if (filtros.prioridade && filtros.prioridade !== 'Todas') {
      list = list.filter((s: any) => s.prioridade === filtros.prioridade);
    }
    if (filtros.responsavel && filtros.responsavel !== 'Todos') {
      list = list.filter((s: any) => s.responsavel === filtros.responsavel);
    }
    return list;
  }

  saveServico(data: any) {
    if (data.id) {
      const idx = this.data.servicos.findIndex((s: any) => Number(s.id) === Number(data.id));
      if (idx !== -1) {
        this.data.servicos[idx] = { ...this.data.servicos[idx], ...data };
        this.save();
        return this.data.servicos[idx];
      }
    } else {
      const newId = this.data.servicos.length > 0 ? Math.max(...this.data.servicos.map((s: any) => Number(s.id))) + 1 : 301;
      const newServ = {
        id: newId,
        ...data,
        dataAbertura: data.dataAbertura || new Date().toISOString().split('T')[0],
        situacao: data.situacao || 'Aberto'
      };
      this.data.servicos.push(newServ);
      this.save();
      return newServ;
    }
  }

  concluirServico(id: number | string) {
    const serv = this.data.servicos.find((s: any) => Number(s.id) === Number(id));
    if (serv) {
      serv.situacao = 'Concluído';
      serv.dataConclusao = new Date().toISOString().split('T')[0];
      this.save();
      return serv;
    }
    return null;
  }

  // ==========================================
  // NOTAS FISCAIS
  // ==========================================
  getNotas(filtros: any = {}) {
    let list = [...this.data.notasFiscais];
    if (filtros.empresaId && filtros.empresaId !== 'Todas') {
      list = list.filter((n: any) => Number(n.empresaId) === Number(filtros.empresaId));
    }
    if (filtros.situacao && filtros.situacao !== 'Todas') {
      list = list.filter((n: any) => n.situacao === filtros.situacao);
    }
    return list;
  }

  saveNota(data: any) {
    if (data.id) {
      const idx = this.data.notasFiscais.findIndex((n: any) => Number(n.id) === Number(data.id));
      if (idx !== -1) {
        this.data.notasFiscais[idx] = { ...this.data.notasFiscais[idx], ...data };
        this.save();
        return this.data.notasFiscais[idx];
      }
    } else {
      const newId = this.data.notasFiscais.length > 0 ? Math.max(...this.data.notasFiscais.map((n: any) => Number(n.id))) + 1 : 401;
      const newNota = {
        id: newId,
        ...data,
        dataSolicitacao: data.dataSolicitacao || new Date().toISOString().split('T')[0],
        situacao: data.situacao || 'Solicitada'
      };
      this.data.notasFiscais.push(newNota);
      this.save();
      return newNota;
    }
  }

  emitirNota(id: number | string) {
    const nota = this.data.notasFiscais.find((n: any) => Number(n.id) === Number(id));
    if (nota) {
      nota.situacao = 'Emitida';
      this.save();
      return nota;
    }
    return null;
  }

  // ==========================================
  // PARCELAMENTOS
  // ==========================================
  getParcelamentos(filtros: any = {}) {
    let list = [...this.data.parcelamentos];
    if (filtros.empresaId && filtros.empresaId !== 'Todas') {
      list = list.filter((p: any) => Number(p.empresaId) === Number(filtros.empresaId));
    }
    if (filtros.situacao && filtros.situacao !== 'Todas') {
      list = list.filter((p: any) => p.situacao === filtros.situacao);
    }
    return list;
  }

  pagarParcela(parcelamentoId: number | string, parcelaNumero: number | string) {
    const parc = this.data.parcelamentos.find((p: any) => Number(p.id) === Number(parcelamentoId));
    if (parc && parc.parcelasRecentes) {
      const p = parc.parcelasRecentes.find((item: any) => Number(item.numero) === Number(parcelaNumero));
      if (p) {
        p.situacao = 'Paga';
        p.dataPagamento = new Date().toISOString().split('T')[0];
        parc.parcelasPagas = (Number(parc.parcelasPagas) || 0) + 1;
        this.save();
        return p;
      }
    }
    return null;
  }

  // ==========================================
  // DOCUMENTOS
  // ==========================================
  getDocumentos(filtros: any = {}) {
    let list = [...this.data.documentos];
    if (filtros.empresaId && filtros.empresaId !== 'Todas') {
      list = list.filter((d: any) => Number(d.empresaId) === Number(filtros.empresaId));
    }
    if (filtros.situacao && filtros.situacao !== 'Todas') {
      list = list.filter((d: any) => d.situacao === filtros.situacao);
    }
    if (filtros.categoria && filtros.categoria !== 'Todas') {
      list = list.filter((d: any) => d.categoria && d.categoria.includes(filtros.categoria));
    }
    return list;
  }

  saveDocumento(data: any) {
    if (data.id) {
      const idx = this.data.documentos.findIndex((d: any) => Number(d.id) === Number(data.id));
      if (idx !== -1) {
        this.data.documentos[idx] = { ...this.data.documentos[idx], ...data };
        this.save();
        return this.data.documentos[idx];
      }
    } else {
      const newId = this.data.documentos.length > 0 ? Math.max(...this.data.documentos.map((d: any) => Number(d.id))) + 1 : 601;
      const newDoc = {
        id: newId,
        ...data,
        dataSolicitacao: data.dataSolicitacao || new Date().toISOString().split('T')[0],
        situacao: data.situacao || 'Solicitado'
      };
      this.data.documentos.push(newDoc);
      this.save();
      return newDoc;
    }
  }

  aprovarDocumento(id: number | string) {
    const doc = this.data.documentos.find((d: any) => Number(d.id) === Number(id));
    if (doc) {
      doc.situacao = 'Aprovado';
      this.save();
      return doc;
    }
    return null;
  }

  // ==========================================
  // USUÁRIOS
  // ==========================================
  getUsuarios() {
    return [...this.data.usuarios];
  }

  saveUsuario(data: any) {
    if (data.id) {
      const idx = this.data.usuarios.findIndex((u: any) => Number(u.id) === Number(data.id));
      if (idx !== -1) {
        this.data.usuarios[idx] = { ...this.data.usuarios[idx], ...data };
        this.save();
        return this.data.usuarios[idx];
      }
    } else {
      const newId = this.data.usuarios.length > 0 ? Math.max(...this.data.usuarios.map((u: any) => Number(u.id))) + 1 : 1;
      const initials = (data.nome || 'US').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
      const newU = {
        id: newId,
        ...data,
        dataCadastro: new Date().toISOString().split('T')[0],
        avatar: initials
      };
      this.data.usuarios.push(newU);
      this.save();
      return newU;
    }
  }

  alternarSituacaoUsuario(id: number | string) {
    const u = this.data.usuarios.find((user: any) => Number(user.id) === Number(id));
    if (u) {
      u.situacao = (u.situacao === 'Ativo') ? 'Inativo' : 'Ativo';
      this.save();
      return u;
    }
    return null;
  }

  // ==========================================
  // ESCRITÓRIO
  // ==========================================
  getEscritorio() {
    return { ...this.data.escritorio };
  }

  saveEscritorio(data: any) {
    this.data.escritorio = { ...this.data.escritorio, ...data };
    this.save();
    return this.data.escritorio;
  }

  // ==========================================
  // NOTIFICAÇÕES
  // ==========================================
  getNotificacoes() {
    return [...this.data.notificacoes];
  }

  getNaoLidasCount(): number {
    return this.data.notificacoes.filter((n: any) => !n.lida).length;
  }

  marcarNotificacaoComoLida(id: number | string) {
    const notif = this.data.notificacoes.find((n: any) => Number(n.id) === Number(id));
    if (notif) {
      notif.lida = true;
      this.save();
      return notif;
    }
    return null;
  }

  marcarTodasNotificacoesComoLidas() {
    this.data.notificacoes.forEach((n: any) => (n.lida = true));
    this.save();
  }

  // ==========================================
  // DASHBOARD KPI DERIVADOS
  // ==========================================
  getDashboardKPIs() {
    const empresasAtivas = this.data.empresas.filter((e: any) => e.situacao === 'Ativa').length;
    const empresasProcesso = this.data.empresas.filter((e: any) => e.situacao === 'Em Abertura' || e.situacao === 'Regularização').length;

    const impostosPendentes = this.data.impostos.filter((i: any) => i.situacao === 'Pendente' || i.situacao === 'Em Andamento' || i.situacao === 'Aguardando Documentos').length;
    const impostosProximos = this.data.impostos.filter((i: any) => {
      if (i.situacao === 'Concluída') return false;
      return i.vencimento >= '2026-10-20' && i.vencimento <= '2026-10-25';
    }).length;
    const impostosConcluidos = this.data.impostos.filter((i: any) => i.situacao === 'Concluída' || i.situacao === 'Entregue').length;
    const impostosAtrasados = this.data.impostos.filter((i: any) => i.situacao === 'Atrasada' || (i.vencimento < '2026-10-20' && i.situacao !== 'Concluída')).length;

    const folhaPendente = this.data.folha.filter((f: any) => f.situacao !== 'Fechada' && f.situacao !== 'Entregue').length;

    const servicosAbertos = this.data.servicos.filter((s: any) => s.situacao === 'Aberto' || s.situacao === 'Em Andamento' || s.situacao.includes('Aguardando')).length;
    const servicosAtrasados = this.data.servicos.filter((s: any) => s.prazoEntrega < '2026-10-20' && s.situacao !== 'Concluído').length;

    const notasPendentes = this.data.notasFiscais.filter((n: any) => n.situacao === 'Solicitada' || n.situacao === 'Pronta para Emissão' || n.situacao === 'Atrasada').length;
    const parcelamentosAtivos = this.data.parcelamentos.filter((p: any) => p.situacao === 'Ativo' || p.situacao === 'Com Atraso').length;
    const documentosPendentes = this.data.documentos.filter((d: any) => d.situacao === 'Solicitado' || d.situacao === 'Aguardando Cliente' || d.situacao === 'Pendente de Correção').length;

    return {
      empresasAtivas,
      empresasProcesso,
      impostosPendentes,
      impostosProximos,
      impostosConcluidos,
      impostosAtrasados,
      folhaPendente,
      servicosAbertos,
      servicosAtrasados,
      notasPendentes,
      parcelamentosAtivos,
      documentosPendentes
    };
  }

  // ==========================================
  // AGENDA GERADA DINAMICAMENTE
  // ==========================================
  getAgendaEventos(filtros: any = {}) {
    let eventos: any[] = [];

    // Impostos
    this.data.impostos.forEach((imp: any) => {
      const emp = this.getEmpresaById(imp.empresaId);
      eventos.push({
        id: `imp-${imp.id}`,
        data: imp.vencimento,
        tipo: 'imposto',
        categoria: 'Fiscal / Impostos',
        titulo: `${imp.tipo} - ${emp ? emp.nomeFantasia : 'Empresa'}`,
        detalhes: `Vencimento: ${imp.vencimento} | Valor: R$ ${(Number(imp.valor) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} | Situação: ${imp.situacao}`,
        situacao: imp.situacao,
        empresaId: imp.empresaId,
        cor: imp.situacao === 'Atrasada' ? 'var(--danger)' : 'var(--primary)',
        url: '/admin/impostos'
      });
    });

    // Folha
    this.data.folha.forEach((f: any) => {
      const emp = this.getEmpresaById(f.empresaId);
      eventos.push({
        id: `folha-${f.id}`,
        data: '2026-10-25',
        tipo: 'folha',
        categoria: 'Folha de Pagamento',
        titulo: `Folha ${f.competencia} - ${emp ? emp.nomeFantasia : 'Empresa'}`,
        detalhes: `Prazo: ${f.prazoPrevisto} | Status: ${f.situacao}`,
        situacao: f.situacao,
        empresaId: f.empresaId,
        cor: 'var(--info)',
        url: '/admin/folha'
      });
    });

    // Serviços
    this.data.servicos.forEach((s: any) => {
      const emp = this.getEmpresaById(s.empresaId);
      eventos.push({
        id: `serv-${s.id}`,
        data: s.prazoEntrega,
        tipo: 'servico',
        categoria: 'Serviços & Tarefas',
        titulo: `${s.titulo} (${emp ? emp.nomeFantasia : 'Geral'})`,
        detalhes: `Responsável: ${s.responsavel} | Prioridade: ${s.prioridade}`,
        situacao: s.situacao,
        empresaId: s.empresaId,
        cor: 'var(--purple)',
        url: '/admin/servicos'
      });
    });

    // Parcelamentos
    this.data.parcelamentos.forEach((parc: any) => {
      const emp = this.getEmpresaById(parc.empresaId);
      (parc.parcelasRecentes || []).forEach((p: any) => {
        eventos.push({
          id: `parc-${parc.id}-${p.numero}`,
          data: p.vencimento,
          tipo: 'parcelamento',
          categoria: 'Parcelamentos',
          titulo: `Parc. ${p.numero}/${parc.totalParcelas} ${parc.orgao} (${emp ? emp.nomeFantasia : ''})`,
          detalhes: `Valor: R$ ${(Number(p.valor) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} | Status: ${p.situacao}`,
          situacao: p.situacao,
          empresaId: parc.empresaId,
          cor: 'var(--warning)',
          url: '/admin/parcelamentos'
        });
      });
    });

    if (filtros.empresaId && filtros.empresaId !== 'Todas') {
      eventos = eventos.filter(e => Number(e.empresaId) === Number(filtros.empresaId));
    }
    if (filtros.categoria && filtros.categoria !== 'Todas') {
      eventos = eventos.filter(e => e.categoria.includes(filtros.categoria));
    }

    eventos.sort((a, b) => (a.data || '').localeCompare(b.data || ''));
    return eventos;
  }

  // ==========================================
  // EXPORTAÇÃO CSV REAL COM UTF-8 BOM
  // ==========================================
  exportToCSV(filename: string, rows: any[]) {
    if (!this.isBrowser) return;
    if (!rows || !rows.length) {
      alert('Nenhum registro para exportar.');
      return;
    }
    const separator = ';';
    const keys = Object.keys(rows[0]);
    let csvContent = '\uFEFF';

    csvContent += keys.join(separator) + '\r\n';

    rows.forEach(row => {
      const values = keys.map(k => {
        let val = row[k] === null || row[k] === undefined ? '' : String(row[k]);
        if (val.includes(separator) || val.includes('\n') || val.includes('"')) {
          val = `"${val.replace(/"/g, '""')}"`;
        }
        return val;
      });
      csvContent += values.join(separator) + '\r\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
