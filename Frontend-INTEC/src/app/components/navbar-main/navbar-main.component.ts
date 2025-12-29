import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { RouterModule } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, Inject } from '@angular/core';


@Component({
  selector: 'app-navbar-main',
  templateUrl: './navbar-main.component.html',
  styleUrl: './navbar-main.component.css',
  standalone: true,
  imports: [RouterModule, CommonModule],
})
export class NavbarMainComponent implements OnInit{
  userName: string = 'Usuario';
  userImage: string | null = null;
  @ViewChild('sidebar', { static: true }) sidebarRef!: ElementRef;
  @ViewChild('logo', { static: true }) logoRef!: ElementRef;
  isSubmenuOpen: { [key: string]: boolean } = {};
  isSidebarCollapsed: boolean = false;

  constructor(private renderer: Renderer2,  @Inject(PLATFORM_ID) private platformId: Object) {}
  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const userObj = JSON.parse(user);
        this.userName = userObj.name_user || userObj.name || userObj.nombre || 'Usuario';
        this.userImage = userObj.photo || null;
      } catch (e) {
        console.error('Error al parsear usuario:', e);
      }
    }
  }
  }

  

  toggleSidebar(): void {
    const sidebar = this.sidebarRef.nativeElement;
    const logo = this.logoRef.nativeElement;
  
    const isCollapsed = sidebar.classList.contains('collapsed');
  
    if (isCollapsed) {
      this.renderer.removeClass(sidebar, 'collapsed');
      this.renderer.setStyle(logo, 'display', 'flex');
      this.isSidebarCollapsed = false;
    } else {
      this.renderer.addClass(sidebar, 'collapsed');
      this.renderer.setStyle(logo, 'display', 'none');
      this.isSubmenuOpen = {};
      this.isSidebarCollapsed = true;
    }
  
    const texts = sidebar.querySelectorAll('.menu-text') as NodeListOf<HTMLElement>;
    texts.forEach(el => {
      el.style.display = isCollapsed ? 'inline' : 'none';
    });
  }
  
  


  toggleSubmenu(menu: string): void {
    const sidebar = this.sidebarRef.nativeElement;
    if (sidebar.classList.contains('collapsed')) {
      return;
    }
  
    // Cerrar todos los otros submenús
    Object.keys(this.isSubmenuOpen).forEach(key => {
      if (key !== menu) {
        this.isSubmenuOpen[key] = false;
      }
    });
  
    // Alternar el estado del submenú actual
    this.isSubmenuOpen[menu] = !this.isSubmenuOpen[menu];
  }
  

  expandSidebarIfCollapsed(): void {
    const sidebar = this.sidebarRef.nativeElement;
    const logo = this.logoRef.nativeElement;
  
    if (sidebar.classList.contains('collapsed')) {
      this.renderer.removeClass(sidebar, 'collapsed');
      this.renderer.setStyle(logo, 'display', 'flex');
  
      const texts = sidebar.querySelectorAll('.menu-text') as NodeListOf<HTMLElement>;
      texts.forEach(el => {
        el.style.display = 'inline';
      });
    }
  }

}
