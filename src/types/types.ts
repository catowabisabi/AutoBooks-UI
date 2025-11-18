export interface App {
  id: string;
  name: string;
  icon: string;
  description?: string;
  color: string;
}

export interface MenuItem {
  id: string;
  label: string;
  href: string;
  icon: string;
}

export interface AppConfig {
  id: string;
  name: string;
  icon: string;
  color: string;
  menuItems: MenuItem[];
}
