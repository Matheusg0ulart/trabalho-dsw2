import { Component, OnInit, AfterViewInit, OnDestroy, inject, ElementRef, Renderer2 } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './landing.component.html',
  styles: [`
    :host {
      display: block;
      width: 100%;
    }
  `]
})
export class LandingComponent implements OnInit, AfterViewInit, OnDestroy {
  private el = inject(ElementRef);
  private renderer = inject(Renderer2);
  private document = inject(DOCUMENT);

  private listeners: (() => void)[] = [];

  ngOnInit() {
    // Aplicação inicial do tema público
    if (typeof window !== 'undefined') {
      const theme = localStorage.getItem('WALDO_PUBLIC_THEME');
      if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        this.renderer.setAttribute(this.document.documentElement, 'data-theme', 'dark');
      } else {
        this.renderer.removeAttribute(this.document.documentElement, 'data-theme');
      }
    }
  }

  ngAfterViewInit() {
    if (typeof window === 'undefined') return;

    this.initNavbar();
    this.initThemeToggle();
    this.initServices();
    this.initSimulador();
    this.initFaq();
    this.initContact();
    this.initWhatsApp();
    this.initScrollTop();
  }

  ngOnDestroy() {
    this.listeners.forEach(unlisten => unlisten());
  }

  private initNavbar() {
    const navbar = this.el.nativeElement.querySelector('#navbar');
    const navToggle = this.el.nativeElement.querySelector('#navToggle');
    const navMenu = this.el.nativeElement.querySelector('#navMenu');
    const navLinks = this.el.nativeElement.querySelectorAll('.nav-link');

    const onScroll = () => {
      if (window.scrollY > 40) {
        navbar?.classList.add('scrolled');
      } else {
        navbar?.classList.remove('scrolled');
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    this.listeners.push(() => window.removeEventListener('scroll', onScroll));

    if (navToggle && navMenu) {
      const toggleHandler = () => {
        const isExp = navToggle.getAttribute('aria-expanded') === 'true';
        navToggle.setAttribute('aria-expanded', isExp ? 'false' : 'true');
        navMenu.classList.toggle('active', !isExp);
        const icon = navToggle.querySelector('i');
        if (icon) {
          icon.className = !isExp ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
        }
      };
      navToggle.addEventListener('click', toggleHandler);
      this.listeners.push(() => navToggle.removeEventListener('click', toggleHandler));

      navLinks.forEach((link: HTMLElement) => {
        const clickLink = () => {
          navMenu.classList.remove('active');
          navToggle.setAttribute('aria-expanded', 'false');
          const icon = navToggle.querySelector('i');
          if (icon) icon.className = 'fa-solid fa-bars';
        };
        link.addEventListener('click', clickLink);
        this.listeners.push(() => link.removeEventListener('click', clickLink));
      });
    }
  }

  private initThemeToggle() {
    const toggleBtns = this.el.nativeElement.querySelectorAll('.btn-theme-toggle-public');
    toggleBtns.forEach((btn: HTMLElement) => {
      const handler = () => {
        const isDark = this.document.documentElement.getAttribute('data-theme') === 'dark';
        if (isDark) {
          this.renderer.removeAttribute(this.document.documentElement, 'data-theme');
          localStorage.setItem('WALDO_PUBLIC_THEME', 'light');
        } else {
          this.renderer.setAttribute(this.document.documentElement, 'data-theme', 'dark');
          localStorage.setItem('WALDO_PUBLIC_THEME', 'dark');
        }
      };
      btn.addEventListener('click', handler);
      this.listeners.push(() => btn.removeEventListener('click', handler));
    });
  }

  private initServices() {
    const tabBtns = this.el.nativeElement.querySelectorAll('.services-tab-btn');
    const cards = this.el.nativeElement.querySelectorAll('.service-card-modern');
    const toggleBtns = this.el.nativeElement.querySelectorAll('.btn-service-toggle');
    const serviceCtaLinks = this.el.nativeElement.querySelectorAll('.service-details-cta');

    tabBtns.forEach((btn: HTMLElement) => {
      const handler = () => {
        tabBtns.forEach((b: HTMLElement) => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');

        const cat = btn.dataset['category'];
        cards.forEach((card: HTMLElement) => {
          if (cat === 'todos' || card.dataset['category'] === cat) {
            card.style.display = 'flex';
          } else {
            card.style.display = 'none';
          }
        });
      };
      btn.addEventListener('click', handler);
      this.listeners.push(() => btn.removeEventListener('click', handler));
    });

    toggleBtns.forEach((btn: HTMLElement) => {
      const handler = () => {
        const isExp = btn.getAttribute('aria-expanded') === 'true';
        const targetId = btn.getAttribute('aria-controls');
        const target = targetId ? this.el.nativeElement.querySelector(`#${targetId}`) : null;
        if (!target) return;

        btn.setAttribute('aria-expanded', isExp ? 'false' : 'true');
        target.classList.toggle('expanded', !isExp);
        const span = btn.querySelector('span');
        if (span) span.textContent = isExp ? 'Saiba mais' : 'Menos detalhes';
      };
      btn.addEventListener('click', handler);
      this.listeners.push(() => btn.removeEventListener('click', handler));
    });

    serviceCtaLinks.forEach((link: HTMLElement) => {
      const handler = () => {
        const sName = link.dataset['serviceSelect'];
        const msgInput = this.el.nativeElement.querySelector('#mensagem') as HTMLTextAreaElement;
        if (msgInput && sName) {
          msgInput.value = `Olá! Tenho interesse no serviço de ${sName}. Gostaria de entender o escopo e receber uma proposta para minha empresa.`;
          msgInput.focus();
        }
      };
      link.addEventListener('click', handler);
      this.listeners.push(() => link.removeEventListener('click', handler));
    });
  }

  private initSimulador() {
    const rangeInput = this.el.nativeElement.querySelector('#faturamentoRange') as HTMLInputElement;
    const textInput = this.el.nativeElement.querySelector('#faturamentoInput') as HTMLInputElement;
    const rangeDisplay = this.el.nativeElement.querySelector('#rangeValueDisplay');
    const segmentoSelect = this.el.nativeElement.querySelector('#tipoSegmento') as HTMLSelectElement;
    const objetivoBtns = this.el.nativeElement.querySelectorAll('.option-btn');
    const contextInfo = this.el.nativeElement.querySelector('#simContextInfo');

    const regimeRecomendado = this.el.nativeElement.querySelector('#regimeRecomendado');
    const aliquotaEfetiva = this.el.nativeElement.querySelector('#aliquotaEfetiva');
    const impostoAtual = this.el.nativeElement.querySelector('#impostoAtual');
    const impostoOtimizado = this.el.nativeElement.querySelector('#impostoOtimizado');
    const economiaAnual = this.el.nativeElement.querySelector('#economiaAnual');
    const whatsappBtn = this.el.nativeElement.querySelector('#btnSimuladorWhatsApp') as HTMLAnchorElement;

    if (!rangeInput || !segmentoSelect) return;

    let objetivo = 'abrir';
    const objLabels: Record<string, string> = {
      abrir: 'Abrir Novo CNPJ',
      trocar: 'Trocar de Contador',
      mei: 'Migrar de MEI para ME',
      existente: 'Otimizar Empresa Ativa'
    };

    const formatCurrency = (v: number) =>
      new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

    const calcular = () => {
      const fat = parseFloat(rangeInput.value) || 50000;
      if (textInput) textInput.value = formatCurrency(fat);
      if (rangeDisplay) rangeDisplay.textContent = formatCurrency(fat);

      const seg = segmentoSelect.value;
      let aliqNormal = 0.155;
      let aliqOtima = 0.06;
      let regimeTxt = 'Simples Nacional (Anexo III - Fator R)';
      let descAliq = 'Alíquota estimada em ~6.0% condicionado a folha/pró-labore >= 28%';

      if (seg === 'comercio') {
        aliqNormal = 0.095;
        aliqOtima = 0.04;
        regimeTxt = 'Simples Nacional (Anexo I - Comércio)';
        descAliq = 'Alíquota inicial em ~4.0% com segregação de ICMS-ST e monofásicos';
      } else if (seg === 'industria') {
        aliqNormal = 0.115;
        aliqOtima = 0.055;
        regimeTxt = 'Simples Nacional (Anexo II - Indústria)';
        descAliq = 'Alíquota estimada em ~5.5% com apropriação de IPI e ICMS';
      } else if (fat > 180000) {
        aliqNormal = 0.195;
        aliqOtima = 0.1333;
        regimeTxt = 'Lucro Presumido Estruturado';
        descAliq = 'Presunção de 32% (IRPJ/CSLL) e retenções de 4,65%';
      }

      const vlrAtual = fat * aliqNormal;
      const vlrOtimo = fat * aliqOtima;
      const econ = (vlrAtual - vlrOtimo) * 12;

      if (regimeRecomendado) regimeRecomendado.textContent = regimeTxt;
      if (aliquotaEfetiva) aliquotaEfetiva.textContent = descAliq;
      if (impostoAtual) impostoAtual.textContent = `${formatCurrency(vlrAtual)} /mês`;
      if (impostoOtimizado) impostoOtimizado.textContent = `${formatCurrency(vlrOtimo)} /mês`;
      if (economiaAnual) economiaAnual.textContent = `${formatCurrency(econ)} /ano`;

      if (whatsappBtn) {
        const msg = encodeURIComponent(
          `Olá Waldo Ferreira! Realizei a simulação tributária pelo site:\n- Objetivo: ${objLabels[objetivo] || objetivo}\n- Segmento: ${seg.toUpperCase()}\n- Faturamento Médio: ${formatCurrency(fat)}/mês\n- Cenário: ${regimeTxt}\n- Diferença Anual Projetada: ${formatCurrency(econ)}/ano\nGostaria de agendar uma avaliação para minha empresa.`
        );
        whatsappBtn.href = `https://wa.me/5511999999999?text=${msg}`;
      }
    };

    rangeInput.addEventListener('input', calcular);
    segmentoSelect.addEventListener('change', calcular);
    this.listeners.push(() => rangeInput.removeEventListener('input', calcular));
    this.listeners.push(() => segmentoSelect.removeEventListener('change', calcular));

    objetivoBtns.forEach((btn: HTMLElement) => {
      const handler = () => {
        objetivoBtns.forEach((b: HTMLElement) => b.classList.remove('selected'));
        btn.classList.add('selected');
        objetivo = btn.dataset['value'] || 'abrir';
        calcular();
      };
      btn.addEventListener('click', handler);
      this.listeners.push(() => btn.removeEventListener('click', handler));
    });

    calcular();
  }

  private initFaq() {
    const faqQuestions = this.el.nativeElement.querySelectorAll('.faq-question');
    faqQuestions.forEach((btn: HTMLElement) => {
      const handler = () => {
        const isExp = btn.getAttribute('aria-expanded') === 'true';
        const answer = btn.nextElementSibling as HTMLElement;
        btn.setAttribute('aria-expanded', isExp ? 'false' : 'true');
        if (answer) {
          answer.hidden = isExp;
        }
      };
      btn.addEventListener('click', handler);
      this.listeners.push(() => btn.removeEventListener('click', handler));
    });
  }

  private initContact() {
    const form = this.el.nativeElement.querySelector('#contactForm');
    const feedback = this.el.nativeElement.querySelector('#formFeedback');
    if (!form) return;

    const handler = (e: Event) => {
      e.preventDefault();
      const nome = (this.el.nativeElement.querySelector('#nome') as HTMLInputElement)?.value;
      const email = (this.el.nativeElement.querySelector('#email') as HTMLInputElement)?.value;
      const telefone = (this.el.nativeElement.querySelector('#telefone') as HTMLInputElement)?.value;

      if (!nome || !email || !telefone) {
        if (feedback) {
          feedback.style.display = 'block';
          feedback.style.backgroundColor = '#fee2e2';
          feedback.style.color = '#b91c1c';
          feedback.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> Preencha todos os campos obrigatórios.';
        }
        return;
      }

      if (feedback) {
        feedback.style.display = 'block';
        feedback.style.backgroundColor = '#ecfdf5';
        feedback.style.color = '#047857';
        feedback.innerHTML = '<i class="fa-solid fa-circle-check"></i> Mensagem enviada com sucesso! Retornaremos em breve.';
      }
      (form as HTMLFormElement).reset();
    };

    form.addEventListener('submit', handler);
    this.listeners.push(() => form.removeEventListener('submit', handler));
  }

  private initWhatsApp() {
    const popover = this.el.nativeElement.querySelector('#whatsappPopover');
    const closeBtn = this.el.nativeElement.querySelector('#popoverCloseBtn');
    if (closeBtn && popover) {
      const handler = () => (popover.style.display = 'none');
      closeBtn.addEventListener('click', handler);
      this.listeners.push(() => closeBtn.removeEventListener('click', handler));
    }
  }

  private initScrollTop() {
    const btn = this.el.nativeElement.querySelector('#scrollTopBtn');
    if (btn) {
      const handler = () => window.scrollTo({ top: 0, behavior: 'smooth' });
      btn.addEventListener('click', handler);
      this.listeners.push(() => btn.removeEventListener('click', handler));
    }
  }
}
