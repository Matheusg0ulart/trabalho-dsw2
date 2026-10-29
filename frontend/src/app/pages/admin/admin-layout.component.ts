import { Component, OnInit, OnDestroy, inject, Renderer2 } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet, NavigationEnd } from '@angular/router';
import { AuthService, UserSession } from '../../services/auth.service';
import { DataService } from '../../services/data.service';
import { FormsModule } from '@angular/forms';
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet, FormsModule],
  template: `
    <aside class="admin-sidebar" [class.mobile-open]="mobileSidebarOpen">
      <div class="sidebar-header">
        <a routerLink="/admin/dashboard" class="sidebar-brand">
          <div class="logo-icon"><i class="fa-solid fa-scale-balanced"></i></div>
          <div>
            <div class="brand-title">WALDO GESTÃO</div>
            <div class="brand-badge">SISTEMA CONTÁBIL</div>
          </div>
        </a>
        <button class="sidebar-close-btn" (click)="toggleMobileSidebar()" aria-label="Fechar menu lateral">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>

      <nav class="sidebar-nav">
        <div class="nav-category">Geral</div>
        <a routerLink="/admin/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="sidebar-link" (click)="closeMobileSidebar()">
          <i class="fa-solid fa-chart-line"></i>
          <span>Dashboard Principal</span>
        </a>
        <a routerLink="/admin/empresas" routerLinkActive="active" class="sidebar-link" (click)="closeMobileSidebar()">
          <i class="fa-solid fa-building"></i>
          <span>Empresas & Clientes</span>
        </a>

        <div class="nav-category">Operação & Conformidade</div>
        <a routerLink="/admin/impostos" routerLinkActive="active" class="sidebar-link" (click)="closeMobileSidebar()">
          <i class="fa-solid fa-receipt"></i>
          <span>Impostos & Fiscal</span>
          <span class="counter-badge" [ngClass]="kpis.impostosAtrasados > 0 ? 'danger' : 'warning'">
            {{ kpis.impostosPendentes }}
          </span>
        </a>
        <a routerLink="/admin/folha" routerLinkActive="active" class="sidebar-link" (click)="closeMobileSidebar()">
          <i class="fa-solid fa-users"></i>
          <span>Folha de Pagamento</span>
          <span class="counter-badge warning">{{ kpis.folhaPendente }}</span>
        </a>
        <a routerLink="/admin/servicos" routerLinkActive="active" class="sidebar-link" (click)="closeMobileSidebar()">
          <i class="fa-solid fa-list-check"></i>
          <span>Serviços & Tarefas</span>
          <span class="counter-badge" [ngClass]="kpis.servicosAtrasados > 0 ? 'danger' : ''">
            {{ kpis.servicosAbertos }}
          </span>
        </a>
        <a routerLink="/admin/notas-fiscais" routerLinkActive="active" class="sidebar-link" (click)="closeMobileSidebar()">
          <i class="fa-solid fa-file-invoice"></i>
          <span>Notas Fiscais</span>
          <span class="counter-badge">{{ kpis.notasPendentes }}</span>
        </a>
        <a routerLink="/admin/parcelamentos" routerLinkActive="active" class="sidebar-link" (click)="closeMobileSidebar()">
          <i class="fa-solid fa-hand-holding-dollar"></i>
          <span>Parcelamentos</span>
        </a>
        <a routerLink="/admin/documentos" routerLinkActive="active" class="sidebar-link" (click)="closeMobileSidebar()">
          <i class="fa-solid fa-folder-open"></i>
          <span>Documentos & Anexos</span>
          <span class="counter-badge warning">{{ kpis.documentosPendentes }}</span>
        </a>

        <div class="nav-category">Gestão & Controle</div>
        <a routerLink="/admin/agenda" routerLinkActive="active" class="sidebar-link" (click)="closeMobileSidebar()">
          <i class="fa-solid fa-calendar-days"></i>
          <span>Agenda & Prazos</span>
        </a>
        <a routerLink="/admin/relatorios" routerLinkActive="active" class="sidebar-link" (click)="closeMobileSidebar()">
          <i class="fa-solid fa-file-excel"></i>
          <span>Relatórios & Exportação</span>
        </a>
        <a routerLink="/admin/usuarios" routerLinkActive="active" class="sidebar-link" (click)="closeMobileSidebar()">
          <i class="fa-solid fa-user-gear"></i>
          <span>Usuários & Perfis</span>
        </a>
        <a routerLink="/admin/notificacoes" routerLinkActive="active" class="sidebar-link" (click)="closeMobileSidebar()">
          <i class="fa-solid fa-bell"></i>
          <span>Central de Alertas</span>
          @if (unreadNotifs > 0) {
            <span class="counter-badge danger">{{ unreadNotifs }}</span>
          }
        </a>
      </nav>

      <div class="sidebar-footer">
        <div class="user-mini-card">
          <div class="user-avatar-mini">{{ userAvatar }}</div>
          <div class="user-info-text">
            <strong>{{ currentUser?.nome || 'Waldo Ferreira' }}</strong>
            <span>{{ currentUser?.cargo || 'Contador Responsável' }}</span>
          </div>
        </div>
        <button (click)="logout()" class="btn-sidebar-exit" style="background: none; border: 1px solid rgba(255,255,255,0.1); cursor: pointer;">
          <i class="fa-solid fa-arrow-right-from-bracket"></i>
          <span>{{ isDemo ? 'Encerrar Demonstração' : 'Sair do Sistema' }}</span>
        </button>
      </div>
    </aside>

    <main class="admin-main">
      <header class="admin-topbar">
        <div class="topbar-left">
          <button class="menu-toggle-btn" (click)="toggleMobileSidebar()" aria-label="Abrir menu lateral" style="display: inline-block;">
            <i class="fa-solid fa-bars"></i>
          </button>
          <div class="page-header-info">
            <div class="page-breadcrumb">
              <a routerLink="/">Site Público</a>
              <i class="fa-solid fa-chevron-right" style="font-size: 0.65rem; margin: 0 4px;"></i>
              <span>Gestão Interna</span>
            </div>
            <h1>Waldo Ferreira Gestão Contábil</h1>
          </div>
        </div>

        <div class="topbar-right">
          <div class="topbar-search">
            <i class="fa-solid fa-magnifying-glass"></i>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              (keyup.enter)="onGlobalSearch()"
              placeholder="Buscar empresa ou CNPJ... (Enter)"
            />
          </div>

          @if (isDemo) {
            <div class="demo-status-pill">
              <span class="pulse-dot"></span>
              <span>Modo Demo</span>
            </div>
          }

          <!-- Dropdown Notificações -->
          <div style="position: relative;">
            <button class="topbar-btn-icon" (click)="toggleNotifDropdown()" aria-label="Notificações">
              <i class="fa-regular fa-bell"></i>
              @if (unreadNotifs > 0) {
                <span class="notif-badge">{{ unreadNotifs }}</span>
              }
            </button>
            @if (notifOpen) {
              <div class="notif-dropdown" style="display: block;">
                <div class="notif-header">
                  <span>Notificações & Alertas</span>
                  <a routerLink="/admin/notificacoes" (click)="notifOpen = false" style="font-size: 0.76rem; color: var(--primary);">Ver Todas</a>
                </div>
                <div class="notif-list">
                  @for (notif of recentNotifs; track notif.id) {
                    <div class="notif-item" [class.lida]="notif.lida" (click)="markAsRead(notif.id)">
                      <i class="fa-solid" [ngClass]="getNotifIcon(notif.tipo)" style="font-size: 1.1rem; margin-top: 3px;"></i>
                      <div>
                        <strong style="display: block; font-size: 0.85rem;">{{ notif.titulo }}</strong>
                        <p style="font-size: 0.78rem; margin: 2px 0 4px; color: var(--text-secondary);">{{ notif.mensagem }}</p>
                        <span style="font-size: 0.7rem; color: var(--text-muted);">{{ notif.data }}</span>
                      </div>
                    </div>
                  }
                </div>
              </div>
            }
          </div>

          <!-- Alternador de Tema -->
          <button type="button" class="topbar-btn-icon theme-toggle-btn" (click)="toggleTheme()" title="Alternar modo claro / escuro">
            <i class="fa-solid" [ngClass]="isDark ? 'fa-sun' : 'fa-moon'"></i>
          </button>

          <!-- Link Landing Page -->
          <a routerLink="/" class="btn-icon-action" title="Ir para a Landing Page Pública" style="width: 40px; height: 40px; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; text-decoration: none; color: inherit;">
            <i class="fa-solid fa-globe"></i>
          </a>
        </div>
      </header>

      <div class="admin-content">
        <router-outlet></router-outlet>
      </div>
    </main>
  `,
  styles: [`
    :host {
      display: flex;
      width: 100%;
      min-height: 100vh;
      background-color: var(--bg-main);
    }
    @media (max-width: 991px) {
      .admin-sidebar {
        transform: translateX(-100%);
      }
      .admin-sidebar.mobile-open {
        transform: translateX(0);
      }
      .admin-main {
        margin-left: 0 !important;
        width: 100% !important;
      }
      .sidebar-close-btn {
        display: block !important;
      }
    }
  `]
})
export class AdminLayoutComponent implements OnInit, OnDestroy {
  private auth = inject(AuthService);
  public dataService = inject(DataService);
  private router = inject(Router);
  private renderer = inject(Renderer2);
  private document = inject(DOCUMENT);

  currentUser: UserSession | null = null;
  userAvatar = 'WF';
  isDemo = false;
  isDark = false;
  mobileSidebarOpen = false;
  notifOpen = false;
  searchQuery = '';

  private routerSub?: Subscription;

  get kpis() {
    return this.dataService.getDashboardKPIs();
  }

  get unreadNotifs() {
    return this.dataService.getNaoLidasCount();
  }

  get recentNotifs() {
    return this.dataService.getNotificacoes().slice(0, 5);
  }

  ngOnInit() {
    this.renderer.addClass(this.document.body, 'admin-body');

    this.currentUser = this.auth.getUser();
    this.isDemo = this.auth.isDemoMode();

    if (this.currentUser?.nome) {
      const parts = this.currentUser.nome.trim().split(' ');
      this.userAvatar = parts.length > 1
        ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
        : parts[0].slice(0, 2).toUpperCase();
    }

    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('WALDO_ADMIN_THEME') || 'light';
      this.isDark = savedTheme === 'dark';
      if (this.isDark) {
        this.renderer.setAttribute(this.document.documentElement, 'data-theme', 'dark');
      }
    }

    this.routerSub = this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe(() => {
      this.closeMobileSidebar();
      this.notifOpen = false;
    });
  }

  ngOnDestroy() {
    this.renderer.removeClass(this.document.body, 'admin-body');
    this.routerSub?.unsubscribe();
  }

  toggleMobileSidebar() {
    this.mobileSidebarOpen = !this.mobileSidebarOpen;
  }

  closeMobileSidebar() {
    this.mobileSidebarOpen = false;
  }

  toggleNotifDropdown() {
    this.notifOpen = !this.notifOpen;
  }

  markAsRead(id: number) {
    this.dataService.marcarNotificacaoComoLida(id);
  }

  getNotifIcon(tipo: string): string {
    switch (tipo) {
      case 'critico': return 'fa-triangle-exclamation text-danger';
      case 'alerta': return 'fa-circle-exclamation text-warning';
      case 'sucesso': return 'fa-circle-check text-success';
      default: return 'fa-circle-info text-info';
    }
  }

  toggleTheme() {
    this.isDark = !this.isDark;
    if (this.isDark) {
      this.renderer.setAttribute(this.document.documentElement, 'data-theme', 'dark');
      localStorage.setItem('WALDO_ADMIN_THEME', 'dark');
    } else {
      this.renderer.removeAttribute(this.document.documentElement, 'data-theme');
      localStorage.setItem('WALDO_ADMIN_THEME', 'light');
    }
  }

  onGlobalSearch() {
    if (!this.searchQuery.trim()) return;
    this.router.navigate(['/admin/empresas'], { queryParams: { busca: this.searchQuery.trim() } });
  }

  logout() {
    this.auth.logout();
  }
}
