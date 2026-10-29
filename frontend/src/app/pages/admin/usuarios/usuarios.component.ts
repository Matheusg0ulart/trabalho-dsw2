import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../../services/data.service';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Navegação de Abas -->
    <div class="tabs-nav" style="display: flex; gap: 12px; margin-bottom: 24px; border-bottom: 1px solid var(--border-color); padding-bottom: 8px;">
      <button
        type="button"
        class="tab-btn"
        [class.active]="abaAtiva === 'usuarios'"
        (click)="abaAtiva = 'usuarios'"
        style="padding: 8px 16px; border: none; background: none; font-weight: 600; cursor: pointer; color: var(--text-secondary); border-radius: var(--radius-sm);"
        [style.color]="abaAtiva === 'usuarios' ? 'var(--primary)' : 'var(--text-secondary)'"
        [style.border-bottom]="abaAtiva === 'usuarios' ? '2px solid var(--primary)' : 'none'"
      >
        <i class="fa-solid fa-users" style="margin-right: 6px;"></i> Equipe & Acessos
      </button>
      <button
        type="button"
        class="tab-btn"
        [class.active]="abaAtiva === 'escritorio'"
        (click)="abaAtiva = 'escritorio'"
        style="padding: 8px 16px; border: none; background: none; font-weight: 600; cursor: pointer; color: var(--text-secondary); border-radius: var(--radius-sm);"
        [style.color]="abaAtiva === 'escritorio' ? 'var(--primary)' : 'var(--text-secondary)'"
        [style.border-bottom]="abaAtiva === 'escritorio' ? '2px solid var(--primary)' : 'none'"
      >
        <i class="fa-solid fa-building-user" style="margin-right: 6px;"></i> Dados do Escritório
      </button>
    </div>

    <!-- Aba 1: Equipe & Acessos -->
    @if (abaAtiva === 'usuarios') {
      <div>
        <div class="action-toolbar">
          <div class="filter-group">
            <span style="font-size: 0.85rem; color: var(--text-secondary);">
              Total de colaboradores: <strong>{{ usuarios.length }}</strong>
            </span>
          </div>

          <div>
            <button type="button" class="btn btn-primary" (click)="abrirModalNovo()">
              <i class="fa-solid fa-user-plus"></i> Novo Colaborador
            </button>
          </div>
        </div>

        <div class="table-card">
          <div class="table-responsive">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Nome & Usuário</th>
                  <th>E-mail</th>
                  <th>Cargo</th>
                  <th>Perfil de Acesso</th>
                  <th>Data Cadastro</th>
                  <th>Situação</th>
                  <th style="text-align: right;">Ações</th>
                </tr>
              </thead>
              <tbody>
                @for (u of usuarios; track u.id) {
                  <tr>
                    <td>
                      <div style="display: flex; align-items: center; gap: 10px;">
                        <div class="user-avatar-mini" style="width: 32px; height: 32px; font-size: 0.78rem;">{{ u.avatar || 'U' }}</div>
                        <strong>{{ u.nome }}</strong>
                      </div>
                    </td>
                    <td><span style="font-size: 0.84rem; color: var(--text-secondary);">{{ u.email }}</span></td>
                    <td>{{ u.cargo }}</td>
                    <td>
                      <span class="badge-tag" [class.gold-tag]="u.perfil === 'Administrador'" style="font-size: 0.72rem;">
                        {{ u.perfil }}
                      </span>
                    </td>
                    <td>{{ formatarData(u.dataCadastro) }}</td>
                    <td>
                      <span class="status-badge" [ngClass]="u.situacao.toLowerCase()">
                        {{ u.situacao }}
                      </span>
                    </td>
                    <td style="text-align: right;">
                      <div class="action-btn-group" style="justify-content: flex-end;">
                        <button type="button" class="btn-icon-action" title="Editar Usuário" (click)="editarUsuario(u)">
                          <i class="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button
                          type="button"
                          class="btn-icon-action"
                          [class.danger]="u.situacao === 'Ativo'"
                          [class.success]="u.situacao !== 'Ativo'"
                          [title]="u.situacao === 'Ativo' ? 'Desativar' : 'Ativar'"
                          (click)="alternarSituacao(u.id)"
                        >
                          <i class="fa-solid" [class.fa-user-slash]="u.situacao === 'Ativo'" [class.fa-user-check]="u.situacao !== 'Ativo'"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    }

    <!-- Aba 2: Dados do Escritório -->
    @if (abaAtiva === 'escritorio') {
      <div class="table-card" style="padding: 32px; max-width: 860px;">
        <div style="margin-bottom: 24px;">
          <h3 style="font-family: var(--font-heading); font-size: 1.25rem; color: var(--navy-950); font-weight: 700; margin: 0 0 6px;">
            Identidade Institucional do Escritório
          </h3>
          <p style="font-size: 0.85rem; color: var(--text-muted); margin: 0;">Informações exibidas na landing page pública e nos relatórios</p>
        </div>

        <form (ngSubmit)="salvarEscritorio()">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 18px;">
            <div class="form-field">
              <label>Nome Fantasia</label>
              <input type="text" [(ngModel)]="escritorio.nomeFantasia" name="nomeFantasia" required>
            </div>
            <div class="form-field">
              <label>Razão Social</label>
              <input type="text" [(ngModel)]="escritorio.razaoSocial" name="razaoSocial" required>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; margin-top: 14px;">
            <div class="form-field">
              <label>CNPJ do escritório</label>
              <input type="text" [(ngModel)]="escritorio.cnpj" name="cnpj" required>
            </div>
            <div class="form-field">
              <label>Registro CRC</label>
              <input type="text" [(ngModel)]="escritorio.crc" name="crc" required>
            </div>
            <div class="form-field">
              <label>Contador Responsável</label>
              <input type="text" [(ngModel)]="escritorio.responsavel" name="responsavel" required>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; margin-top: 14px;">
            <div class="form-field">
              <label>Telefone Fixo</label>
              <input type="text" [(ngModel)]="escritorio.telefone" name="telefone" required>
            </div>
            <div class="form-field">
              <label>WhatsApp Direto</label>
              <input type="text" [(ngModel)]="escritorio.whatsapp" name="whatsapp" required>
            </div>
            <div class="form-field">
              <label>E-mail Geral</label>
              <input type="email" [(ngModel)]="escritorio.email" name="email" required>
            </div>
          </div>

          <div class="form-field" style="margin-top: 14px;">
            <label>Endereço Presencial</label>
            <input type="text" [(ngModel)]="escritorio.endereco" name="endereco" required>
          </div>

          <div class="form-field" style="margin-top: 14px;">
            <label>Horário de Atendimento</label>
            <input type="text" [(ngModel)]="escritorio.horario" name="horario" required>
          </div>

          <div style="margin-top: 24px; display: flex; align-items: center; gap: 14px;">
            <button type="submit" class="btn btn-primary">
              <i class="fa-solid fa-floppy-disk"></i> Salvar Dados do Escritório
            </button>
            @if (mensagemSucessoEscritorio) {
              <span class="text-green" style="font-size: 0.85rem; font-weight: 600;">
                <i class="fa-solid fa-check"></i> Dados do escritório salvos com sucesso!
              </span>
            }
          </div>
        </form>
      </div>
    }

    <!-- Modal Novo / Editar Usuário -->
    @if (modalAberto) {
      <div class="modal-backdrop" style="position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px;">
        <div class="modal-dialog" style="background: var(--bg-card); width: 100%; max-width: 600px; border-radius: var(--radius-lg); box-shadow: var(--shadow-xl); overflow: hidden;">
          <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid var(--border-color);">
            <h3 style="font-family: var(--font-heading); font-size: 1.15rem; color: var(--text-primary); font-weight: 700; margin: 0;">
              {{ usuarioForm.id ? 'Editar: ' + usuarioForm.nome : 'Cadastrar Novo Colaborador' }}
            </h3>
            <button type="button" (click)="fecharModal()" style="border: none; background: none; font-size: 1.2rem; cursor: pointer; color: var(--text-secondary);">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <form (ngSubmit)="salvarUsuario()">
            <div class="modal-body" style="padding: 24px; display: flex; flex-direction: column; gap: 16px;">
              <div class="form-field">
                <label>Nome Completo *</label>
                <input type="text" [(ngModel)]="usuarioForm.nome" name="nome" required placeholder="Ex: Roberto Alves de Souza">
              </div>

              <div class="form-field">
                <label>E-mail Corporativo *</label>
                <input type="email" [(ngModel)]="usuarioForm.email" name="email" required placeholder="Ex: roberto&#64;waldo.com.br">
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                <div class="form-field">
                  <label>Cargo / Função *</label>
                  <input type="text" [(ngModel)]="usuarioForm.cargo" name="cargo" required placeholder="Ex: Assistente Fiscal">
                </div>

                <div class="form-field">
                  <label>Perfil de Acesso *</label>
                  <select [(ngModel)]="usuarioForm.perfil" name="perfil" required>
                    <option value="Administrador">Administrador</option>
                    <option value="Contador">Contador</option>
                    <option value="Assistente">Assistente Fiscal/Contábil</option>
                    <option value="Visualizador">Visualizador (Somente Leitura)</option>
                  </select>
                </div>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                <div class="form-field">
                  <label>Situação *</label>
                  <select [(ngModel)]="usuarioForm.situacao" name="situacao" required>
                    <option value="Ativo">Ativo</option>
                    <option value="Inativo">Inativo</option>
                  </select>
                </div>

                <div class="form-field">
                  <label>Senha de Acesso {{ usuarioForm.id ? '(Deixe em branco para manter)' : '*' }}</label>
                  <input type="password" [(ngModel)]="usuarioForm.senha" name="senha" [required]="!usuarioForm.id" placeholder="Mínimo 8 caracteres">
                </div>
              </div>
            </div>

            <div class="modal-footer" style="padding: 16px 24px; border-top: 1px solid var(--border-color); display: flex; justify-content: flex-end; gap: 10px;">
              <button type="button" class="btn btn-secondary" (click)="fecharModal()">Cancelar</button>
              <button type="submit" class="btn btn-primary">
                <i class="fa-solid fa-floppy-disk"></i> Salvar Usuário
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `
})
export class UsuariosComponent implements OnInit {
  private dataService = inject(DataService);

  abaAtiva: 'usuarios' | 'escritorio' = 'usuarios';
  usuarios: any[] = [];
  escritorio: any = {};
  mensagemSucessoEscritorio: boolean = false;

  modalAberto: boolean = false;
  usuarioForm: any = {
    id: null,
    nome: '',
    email: '',
    cargo: '',
    perfil: 'Contador',
    situacao: 'Ativo',
    senha: ''
  };

  ngOnInit() {
    this.carregarDados();
  }

  carregarDados() {
    this.usuarios = this.dataService.getUsuarios();
    this.escritorio = { ...(this.dataService.getEscritorio() || {}) };
  }

  abrirModalNovo() {
    this.usuarioForm = {
      id: null,
      nome: '',
      email: '',
      cargo: '',
      perfil: 'Contador',
      situacao: 'Ativo',
      senha: ''
    };
    this.modalAberto = true;
  }

  editarUsuario(u: any) {
    this.usuarioForm = {
      id: u.id,
      nome: u.nome,
      email: u.email,
      cargo: u.cargo,
      perfil: u.perfil,
      situacao: u.situacao,
      senha: ''
    };
    this.modalAberto = true;
  }

  fecharModal() {
    this.modalAberto = false;
  }

  salvarUsuario() {
    if (!this.usuarioForm.id && this.usuarioForm.senha.length < 8) {
      alert('A senha deve ter no mínimo 8 caracteres.');
      return;
    }

    this.dataService.saveUsuario(this.usuarioForm);
    this.carregarDados();
    this.fecharModal();
  }

  alternarSituacao(id: number) {
    this.dataService.alternarSituacaoUsuario(id);
    this.carregarDados();
  }

  salvarEscritorio() {
    this.dataService.saveEscritorio(this.escritorio);
    this.mensagemSucessoEscritorio = true;
    setTimeout(() => {
      this.mensagemSucessoEscritorio = false;
    }, 3000);
  }

  formatarData(dataStr: string): string {
    if (!dataStr) return '-';
    const [y, m, d] = dataStr.split('-');
    return `${d}/${m}/${y}`;
  }
}
