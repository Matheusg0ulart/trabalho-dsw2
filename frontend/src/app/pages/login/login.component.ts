import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="login-body">
      <div class="login-card">
        <div class="login-header">
          <div class="brand-logo" style="justify-content: center; margin-bottom: 14px; display: flex; align-items: center; gap: 12px;">
            <div class="logo-icon" style="width: 44px; height: 44px; background: linear-gradient(135deg, #1e293b, #0f172a); border: 1px solid rgba(217, 119, 6, 0.4); color: var(--gold-500); border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; font-size: 1.3rem;">
              <i class="fa-solid fa-scale-balanced"></i>
            </div>
            <div class="logo-text" style="text-align: left;">
              <span class="brand-name" style="display: block; font-family: var(--font-heading); font-weight: 800; font-size: 1.15rem; color: var(--navy-950); letter-spacing: -0.02em;">WALDO FERREIRA</span>
              <span class="brand-sub" style="display: block; font-size: 0.68rem; font-weight: 700; color: var(--gold-600); letter-spacing: 0.12em; text-transform: uppercase;">ASSESSORIA CONTÁBIL</span>
            </div>
          </div>
          <h2 style="font-family: var(--font-heading); font-size: 1.45rem; color: var(--navy-950); margin: 0;">Sistema de Gestão Interna</h2>
          <p style="font-size: 0.86rem; color: var(--slate-500); margin-top: 4px;">Acesso restrito à equipe contábil do escritório</p>
        </div>

        <!-- Banner de Status de Navegação -->
        @if (statusMessage) {
          <div [ngStyle]="statusStyle" style="margin-bottom: 16px; padding: 12px 14px; border-radius: var(--radius-md); font-size: 0.85rem; line-height: 1.4;">
            <i [class]="statusIcon" style="margin-right: 6px;"></i>
            <span [innerHTML]="statusMessage"></span>
          </div>
        }

        <!-- Alerta de Acesso Seguro -->
        <div class="demo-mode-alert" style="margin-bottom: 16px;">
          <i class="fa-solid fa-shield-halved" style="font-size: 1.25rem; color: var(--gold-500); margin-top: 2px;"></i>
          <div>
            <strong>Acesso seguro ao sistema</strong><br>
            Entre com o e-mail e a senha cadastrados no banco de dados do escritório.
          </div>
        </div>

        <form (ngSubmit)="autenticar()" class="contact-form" novalidate>
          <div class="form-field" style="margin-bottom: 16px;">
            <label for="loginEmail" style="display: block; font-size: 0.84rem; font-weight: 600; color: var(--slate-700); margin-bottom: 6px;">E-mail corporativo</label>
            <div style="position: relative;">
              <input
                type="email"
                id="loginEmail"
                name="email"
                [(ngModel)]="email"
                required
                maxlength="180"
                placeholder="seu.nome@waldocontabilidade.com.br"
                style="padding-left: 38px; width: 100%; height: 46px; border: 1px solid var(--slate-300); border-radius: var(--radius-md); font-size: 0.95rem; box-sizing: border-box;"
              />
              <i class="fa-solid fa-envelope" style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--slate-400);"></i>
            </div>
          </div>

          <div class="form-field" style="margin-bottom: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <label for="loginPassword" style="font-size: 0.84rem; font-weight: 600; color: var(--slate-700);">Senha</label>
              <a href="#" (click)="esqueciSenha($event)" style="font-size: 0.78rem; color: var(--navy-800); font-weight: 600;">Esqueceu a senha?</a>
            </div>
            <div class="input-password-wrap" style="position: relative;">
              <input
                [type]="showPassword ? 'text' : 'password'"
                id="loginPassword"
                name="password"
                [(ngModel)]="password"
                required
                maxlength="100"
                placeholder="Sua senha"
                style="padding-left: 38px; padding-right: 44px; width: 100%; height: 46px; border: 1px solid var(--slate-300); border-radius: var(--radius-md); font-size: 0.95rem; box-sizing: border-box;"
              />
              <i class="fa-solid fa-lock" style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--slate-400);"></i>
              <button
                type="button"
                class="toggle-password-btn"
                (click)="togglePassword()"
                aria-label="Mostrar ou ocultar senha"
                style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: var(--slate-400); font-size: 1rem;"
              >
                <i class="fa-solid" [ngClass]="showPassword ? 'fa-eye-slash' : 'fa-eye'"></i>
              </button>
            </div>
          </div>

          <button
            type="submit"
            [disabled]="loading"
            class="btn btn-primary btn-full btn-lg"
            style="margin-top: 8px; width: 100%; height: 48px; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 8px;"
          >
            <i class="fa-solid fa-right-to-bracket"></i>
            <span>{{ loading ? 'Validando acesso...' : 'Acessar Área do Contador' }}</span>
          </button>

          <button
            type="button"
            (click)="acessarDemo()"
            class="btn btn-gold btn-full btn-lg"
            style="margin-top: 10px; width: 100%; height: 48px; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 8px; background: #d97706; color: #fff; border: none; border-radius: var(--radius-md); cursor: pointer;"
          >
            <i class="fa-solid fa-eye"></i> Acessar Demonstração para Apresentação
          </button>
          <p style="font-size: 0.78rem; color: var(--slate-500); margin: 8px 0 0; text-align: center;">
            Usa dados fictícios neste navegador e não acessa o banco de dados.
          </p>

          @if (errorMessage) {
            <div style="margin-top: 12px; padding: 10px 14px; border-radius: var(--radius-md); font-size: 0.86rem; background-color: #fee2e2; color: #b91c1c; border: 1px solid #fecaca; display: flex; align-items: center; gap: 8px;">
              <i class="fa-solid fa-circle-exclamation"></i>
              <span>{{ errorMessage }}</span>
            </div>
          }
        </form>

        <div style="text-align: center; margin-top: 24px; padding-top: 18px; border-top: 1px solid var(--slate-200);">
          <a routerLink="/" style="display: inline-flex; align-items: center; gap: 6px; font-size: 0.88rem; color: var(--slate-600); font-weight: 600; text-decoration: none;">
            <i class="fa-solid fa-arrow-left"></i> Voltar à Landing Page Pública
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      min-height: 100vh;
    }
  `]
})
export class LoginComponent implements OnInit {
  private auth = inject(AuthService);
  private dataService = inject(DataService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  email = '';
  password = '';
  showPassword = false;
  loading = false;
  errorMessage = '';

  statusMessage = '';
  statusStyle: any = {};
  statusIcon = '';

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const motivo = params['motivo'];
      if (motivo === 'acesso_restrito') {
        this.statusStyle = { backgroundColor: '#fffbeb', border: '1px solid #fde68a', color: '#92400e' };
        this.statusIcon = 'fa-solid fa-lock';
        this.statusMessage = '<strong>Sessão requerida:</strong> entre com sua conta cadastrada para acessar o sistema.';
      } else if (motivo === 'sessao_expirada') {
        this.statusStyle = { backgroundColor: '#fef3c7', border: '1px solid #fcd34d', color: '#92400e' };
        this.statusIcon = 'fa-solid fa-clock-rotate-left';
        this.statusMessage = '<strong>Sessão encerrada:</strong> entre novamente para continuar.';
      } else if (motivo === 'token_invalido') {
        this.statusStyle = { backgroundColor: '#fee2e2', border: '1px solid #fca5a5', color: '#991b1b' };
        this.statusIcon = 'fa-solid fa-shield-virus';
        this.statusMessage = '<strong>Credenciais inválidas:</strong> entre novamente com sua conta.';
      } else if (motivo === 'logout') {
        this.statusStyle = { backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534' };
        this.statusIcon = 'fa-solid fa-circle-check';
        this.statusMessage = '<strong>Sessão encerrada com sucesso.</strong>';
      }
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  esqueciSenha(e: Event) {
    e.preventDefault();
    alert('Para redefinir sua senha, solicite ajuda ao administrador do escritório.');
  }

  async autenticar() {
    this.errorMessage = '';
    const email = this.email.trim();
    const senha = this.password;

    if (!email || !senha) {
      this.errorMessage = 'Informe seu e-mail e sua senha.';
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      this.errorMessage = 'Por favor, insira um formato de e-mail válido (exemplo: usuario@dominio.com.br).';
      return;
    }

    this.loading = true;
    try {
      await this.auth.login(email, senha);
      await this.dataService.hydrateFromApi();
      this.router.navigate(['/admin/dashboard']);
    } catch (err: any) {
      this.loading = false;
      this.errorMessage = (err.status === 401)
        ? 'E-mail ou senha incorretos.'
        : (err.message || 'Falha ao autenticar. Confira sua conexão e tente novamente.');
    }
  }

  acessarDemo() {
    this.auth.loginDemo();
    this.dataService.data = this.dataService.load();
    this.router.navigate(['/admin/dashboard']);
  }
}
