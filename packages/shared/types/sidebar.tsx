export interface SidebarLink {
  name: string;
  path: string;
  icon?: any;
  description?: string;
  badge?: string;
  external?: boolean;
}

export interface SidebarSection {
  id: string;
  title: string;
  icon?: any;
  links: SidebarLink[];
  defaultOpen?: boolean;
  badge?: string;
}

export interface SidebarConfig {
  sections: SidebarSection[];
  showSearch?: boolean;
  showQuickLinks?: boolean;
  quickLinks?: SidebarLink[];
  title?: string;
  logo?: any;
}
