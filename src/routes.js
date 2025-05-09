import React from 'react'

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
const Login = React.lazy(() => import('./views/pages/login/Login'))
const Colors = React.lazy(() => import('./views/theme/colors/Colors'))
const Typography = React.lazy(() => import('./views/theme/typography/Typography'))

// Aluminum section
const AluminumHeatFurnaceT4 = React.lazy(() => import('./views/aluminum/heat-furnace/T4'))
const AluminumHeatFurnaceT5 = React.lazy(() => import('./views/aluminum/heat-furnace/T5'))
const AluminumPreheatingFurnaceG1 = React.lazy(() => import('./views/aluminum/preheating-furnace/G1'))
const AluminumPreheatingFurnaceG2 = React.lazy(() => import('./views/aluminum/preheating-furnace/G2'))
const AluminumPreheatingFurnaceG3 = React.lazy(() => import('./views/aluminum/preheating-furnace/G3'))
const AluminumReports = React.lazy(() => import('./views/aluminum/reports/Reports'))

// Steel section
const SteelPreheatingFurnaceDemo1 = React.lazy(() => import('./views/steel/preheating-furnace/Demo1'))
const SteelPreheatingFurnaceDemo2 = React.lazy(() => import('./views/steel/preheating-furnace/Demo2'))
const SteelPreheatingFurnaceDemo3 = React.lazy(() => import('./views/steel/preheating-furnace/Demo3'))
const SteelHeatFurnaceDemo1 = React.lazy(() => import('./views/steel/heat-furnace/Demo1'))
const SteelHeatFurnaceDemo2 = React.lazy(() => import('./views/steel/heat-furnace/Demo2'))
const SteelHeatFurnaceDemo3 = React.lazy(() => import('./views/steel/heat-furnace/Demo3'))

// Base
const Accordion = React.lazy(() => import('./views/base/accordion/Accordion'))
const Breadcrumbs = React.lazy(() => import('./views/base/breadcrumbs/Breadcrumbs'))
const Cards = React.lazy(() => import('./views/base/cards/Cards'))
const Carousels = React.lazy(() => import('./views/base/carousels/Carousels'))
const Collapses = React.lazy(() => import('./views/base/collapses/Collapses'))
const ListGroups = React.lazy(() => import('./views/base/list-groups/ListGroups'))
const Navs = React.lazy(() => import('./views/base/navs/Navs'))
const Paginations = React.lazy(() => import('./views/base/paginations/Paginations'))
const Placeholders = React.lazy(() => import('./views/base/placeholders/Placeholders'))
const Popovers = React.lazy(() => import('./views/base/popovers/Popovers'))
const Progress = React.lazy(() => import('./views/base/progress/Progress'))
const Spinners = React.lazy(() => import('./views/base/spinners/Spinners'))
const Tabs = React.lazy(() => import('./views/base/tabs/Tabs'))
const Tables = React.lazy(() => import('./views/base/tables/Tables'))
const Tooltips = React.lazy(() => import('./views/base/tooltips/Tooltips'))

// Buttons
const Buttons = React.lazy(() => import('./views/buttons/buttons/Buttons'))
const ButtonGroups = React.lazy(() => import('./views/buttons/button-groups/ButtonGroups'))
const Dropdowns = React.lazy(() => import('./views/buttons/dropdowns/Dropdowns'))

//Forms
const ChecksRadios = React.lazy(() => import('./views/forms/checks-radios/ChecksRadios'))
const FloatingLabels = React.lazy(() => import('./views/forms/floating-labels/FloatingLabels'))
const FormControl = React.lazy(() => import('./views/forms/form-control/FormControl'))
const InputGroup = React.lazy(() => import('./views/forms/input-group/InputGroup'))
const Layout = React.lazy(() => import('./views/forms/layout/Layout'))
const Range = React.lazy(() => import('./views/forms/range/Range'))
const Select = React.lazy(() => import('./views/forms/select/Select'))
const Validation = React.lazy(() => import('./views/forms/validation/Validation'))

const Charts = React.lazy(() => import('./views/charts/Charts'))

// Icons
const CoreUIIcons = React.lazy(() => import('./views/icons/coreui-icons/CoreUIIcons'))
const Flags = React.lazy(() => import('./views/icons/flags/Flags'))
const Brands = React.lazy(() => import('./views/icons/brands/Brands'))

// Notifications
const Alerts = React.lazy(() => import('./views/notifications/alerts/Alerts'))
const Badges = React.lazy(() => import('./views/notifications/badges/Badges'))
const Modals = React.lazy(() => import('./views/notifications/modals/Modals'))
const Toasts = React.lazy(() => import('./views/notifications/toasts/Toasts'))

//User settings
const Profile = React.lazy(() => import('./views/profile/Profile'))
   
const Widgets = React.lazy(() => import('./views/widgets/Widgets'))

const routes = [
  { path: '/login', name: 'Login', element: Login },
  { path: '/profile', name: 'Profile', element: Profile },
  // Aluminum section
  { path: '/aluminum/heat-furnace/t4', name: 'T4', element: AluminumHeatFurnaceT4 },
  { path: '/aluminum/heat-furnace/t5', name: 'T5', element: AluminumHeatFurnaceT5 },
  { path: '/aluminum/preheating-furnace/g1', name: 'AP3', element: AluminumPreheatingFurnaceG1 },
  { path: '/aluminum/preheating-furnace/g2', name: 'AP2', element: AluminumPreheatingFurnaceG2 },
  { path: '/aluminum/preheating-furnace/g3', name: 'AP1', element: AluminumPreheatingFurnaceG3 },
  { path: '/aluminum/heat-furnace/heat-furnace-report', name: 'Alu Reports', element: AluminumReports },

  // Steel section
  { path: '/steel/preheating-furnace/demo1', name: 'Demo1', element: SteelPreheatingFurnaceDemo1 },
  { path: '/steel/preheating-furnace/demo2', name: 'Demo2', element: SteelPreheatingFurnaceDemo2 },
  { path: '/steel/preheating-furnace/demo3', name: 'Demo3', element: SteelPreheatingFurnaceDemo3 },
  { path: '/steel/heat-furnace/demo1', name: 'Demo1', element: SteelHeatFurnaceDemo1 },
  { path: '/steel/heat-furnace/demo2', name: 'Demo2', element: SteelHeatFurnaceDemo2 },
  { path: '/steel/heat-furnace/demo3', name: 'Demo3', element: SteelHeatFurnaceDemo3 },

  { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  { path: '/theme', name: 'Theme', element: Colors, exact: true },
  { path: '/theme/colors', name: 'Colors', element: Colors },
  { path: '/theme/typography', name: 'Typography', element: Typography },
  { path: '/base', name: 'Base', element: Cards, exact: true },
  { path: '/base/accordion', name: 'Accordion', element: Accordion },
  { path: '/base/breadcrumbs', name: 'Breadcrumbs', element: Breadcrumbs },
  { path: '/base/cards', name: 'Cards', element: Cards },
  { path: '/base/carousels', name: 'Carousel', element: Carousels },
  { path: '/base/collapses', name: 'Collapse', element: Collapses },
  { path: '/base/list-groups', name: 'List Groups', element: ListGroups },
  { path: '/base/navs', name: 'Navs', element: Navs },
  { path: '/base/paginations', name: 'Paginations', element: Paginations },
  { path: '/base/placeholders', name: 'Placeholders', element: Placeholders },
  { path: '/base/popovers', name: 'Popovers', element: Popovers },
  { path: '/base/progress', name: 'Progress', element: Progress },
  { path: '/base/spinners', name: 'Spinners', element: Spinners },
  { path: '/base/tabs', name: 'Tabs', element: Tabs },
  { path: '/base/tables', name: 'Tables', element: Tables },
  { path: '/base/tooltips', name: 'Tooltips', element: Tooltips },
  { path: '/buttons', name: 'Buttons', element: Buttons, exact: true },
  { path: '/buttons/buttons', name: 'Buttons', element: Buttons },
  { path: '/buttons/dropdowns', name: 'Dropdowns', element: Dropdowns },
  { path: '/buttons/button-groups', name: 'Button Groups', element: ButtonGroups },
  { path: '/charts', name: 'Charts', element: Charts },
  { path: '/forms', name: 'Forms', element: FormControl, exact: true },
  { path: '/forms/form-control', name: 'Form Control', element: FormControl },
  { path: '/forms/select', name: 'Select', element: Select },
  { path: '/forms/checks-radios', name: 'Checks & Radios', element: ChecksRadios },
  { path: '/forms/range', name: 'Range', element: Range },
  { path: '/forms/input-group', name: 'Input Group', element: InputGroup },
  { path: '/forms/floating-labels', name: 'Floating Labels', element: FloatingLabels },
  { path: '/forms/layout', name: 'Layout', element: Layout },
  { path: '/forms/validation', name: 'Validation', element: Validation },
  { path: '/icons', exact: true, name: 'Icons', element: CoreUIIcons },
  { path: '/icons/coreui-icons', name: 'CoreUI Icons', element: CoreUIIcons },
  { path: '/icons/flags', name: 'Flags', element: Flags },
  { path: '/icons/brands', name: 'Brands', element: Brands },
  { path: '/notifications', name: 'Notifications', element: Alerts, exact: true },
  { path: '/notifications/alerts', name: 'Alerts', element: Alerts },
  { path: '/notifications/badges', name: 'Badges', element: Badges },
  { path: '/notifications/modals', name: 'Modals', element: Modals },
  { path: '/notifications/toasts', name: 'Toasts', element: Toasts },
  { path: '/widgets', name: 'Widgets', element: Widgets },
]

export default routes
