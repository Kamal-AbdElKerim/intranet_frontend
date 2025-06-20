

export const MENUITEMS = [
  {
    menutitle: 'MAIN',
  },
  // {
  //   icon: (<i className="side-menu__icon bx bx-home"></i>),
  //   type: 'sub',
  //   Name: '',
  //   active: false,
  //   selected: false,
  //    dirchange: false,
  //   title: 'Dashboards',
  //   badge: '',
  //   badgetxt: '12',
  //   class: 'badge !bg-warning/10 !text-warning !py-[0.25rem] !px-[0.45rem] !text-[0.75em] ms-2',
  //   children: [
  //     { path: `${import.meta.env.BASE_URL}dashboards/crm`, type: 'link', active: false, selected: false, dirchange: false, title: 'CRM' },
  //     { path: `${import.meta.env.BASE_URL}dashboards/ecommerce`, type: 'link', active: false, selected: false, dirchange: false, title: 'Ecommerce' },
  //     { path: `${import.meta.env.BASE_URL}dashboards/crypto`, type: 'link', active: false, selected: false, dirchange: false, title: 'Crypto' },
  //     { path: `${import.meta.env.BASE_URL}dashboards/jobs`, type: 'link', active: false, selected: false, dirchange: false, title: 'Jobs' },
  //     { path: `${import.meta.env.BASE_URL}dashboards/nft`, type: 'link', active: false, selected: false, dirchange: false, title: 'NFT' },
  //     { path: `${import.meta.env.BASE_URL}dashboards/sales`, type: 'link', active: false, selected: false, dirchange: false, title: 'Sales' },
  //     { path: `${import.meta.env.BASE_URL}dashboards/analytics`, type: 'link', active: false, selected: false, dirchange: false, title: 'Analytics' },
  //     { path: `${import.meta.env.BASE_URL}dashboards/projects`, type: 'link', active: false, selected: false, dirchange: false, title: 'Projects' },
  //     { path: `${import.meta.env.BASE_URL}dashboards/hrm`, type: 'link', active: false, selected: false, dirchange: false, title: 'HRM' },
  //     { path: `${import.meta.env.BASE_URL}dashboards/stocks`, type: 'link', active: false, selected: false, dirchange: false, title: 'Stocks' },
  //     { path: `${import.meta.env.BASE_URL}dashboards/courses`, type: 'link', active: false, selected: false, dirchange: false, title: 'Courses' },
  //     { path: `${import.meta.env.BASE_URL}dashboards/personal`, type: 'link', active: false, selected: false, dirchange: false, title: 'Personal' }
  //   ]
  // },
  {
    path: `${import.meta.env.BASE_URL}DemandesAdministratives/dashboards`,
    icon: (<i className="side-menu__icon bx bx-home"></i>),
    type: "link",
    selected: false,
    dirchange: false,
    active: false,
    title: "Dashboard",
  },

  {
    menutitle: "PAGES",
  },
  {
    path: `${import.meta.env.BASE_URL}DemandesAdministratives/listeDemandes`,
    icon: (<i className="mdi mdi-format-list-bulleted side-menu__icon mb-2"></i>),
    type: "link",
    selected: false,
    dirchange: false,
    active: false,
    title: "les Demandes",
  },
  {
    path: `${import.meta.env.BASE_URL}DemandesAdministratives/listeDemandesValidation`,
    icon: (<i className="mdi mdi-page-next-outline side-menu__icon mb-2"></i>),
    type: "link",
    selected: false,
    dirchange: false,
    active: false,
    title: "les Demandes (Validation)",
  },
  {
    menutitle: 'GENERAL',
  },
  {
    path: `${import.meta.env.BASE_URL}admin/Users`,
    icon: (<i className="mdi mdi-account-group side-menu__icon mb-2"></i>),
    type: "link",
    selected: false,
    dirchange: false,
    active: false,
    title: "Users",
  },
  // {
  //   path: `${import.meta.env.BASE_URL}DemandesAdministratives/admin/Users`,
  //   icon: (<i className="mdi mdi-security side-menu__icon mb-2"></i>),
  //   type: "link",
  //   selected: false,
  //   dirchange: false,
  //   active: false,
  //   title: "Users",
  // },
  
 
];