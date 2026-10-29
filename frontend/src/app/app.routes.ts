import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/landing/landing.component').then(m => m.LandingComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'admin',
    loadComponent: () => import('./pages/admin/admin-layout.component').then(m => m.AdminLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/admin/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'empresas',
        loadComponent: () => import('./pages/admin/empresas/empresas.component').then(m => m.EmpresasComponent)
      },
      {
        path: 'impostos',
        loadComponent: () => import('./pages/admin/impostos/impostos.component').then(m => m.ImpostosComponent)
      },
      {
        path: 'folha',
        loadComponent: () => import('./pages/admin/folha/folha.component').then(m => m.FolhaComponent)
      },
      {
        path: 'servicos',
        loadComponent: () => import('./pages/admin/servicos/servicos.component').then(m => m.ServicosComponent)
      },
      {
        path: 'notas-fiscais',
        loadComponent: () => import('./pages/admin/notas-fiscais/notas-fiscais.component').then(m => m.NotasFiscaisComponent)
      },
      {
        path: 'parcelamentos',
        loadComponent: () => import('./pages/admin/parcelamentos/parcelamentos.component').then(m => m.ParcelamentosComponent)
      },
      {
        path: 'documentos',
        loadComponent: () => import('./pages/admin/documentos/documentos.component').then(m => m.DocumentosComponent)
      },
      {
        path: 'agenda',
        loadComponent: () => import('./pages/admin/agenda/agenda.component').then(m => m.AgendaComponent)
      },
      {
        path: 'relatorios',
        loadComponent: () => import('./pages/admin/relatorios/relatorios.component').then(m => m.RelatoriosComponent)
      },
      {
        path: 'usuarios',
        loadComponent: () => import('./pages/admin/usuarios/usuarios.component').then(m => m.UsuariosComponent)
      },
      {
        path: 'notificacoes',
        loadComponent: () => import('./pages/admin/notificacoes/notificacoes.component').then(m => m.NotificacoesComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
