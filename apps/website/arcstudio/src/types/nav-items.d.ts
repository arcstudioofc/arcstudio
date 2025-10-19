interface NavItemBase {
  href?: string;
  label?: string;
  icon?: React.ReactNode;
  children?: Record<string, NavItemBase>;
}

interface NavItem extends NavItemBase {
  position?: "left" | "right";
}


interface NavbarItems {
  isCompact: Record<string, NavItemBase>;
  notCompact: Record<string, NavItem>;
}
