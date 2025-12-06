import DashboardModule from "./modules/dashboard/DashboardModule";
import AppsModule from "./modules/apps/AppsModule";
import PagesModule from "./modules/pages/PagesModule";
import SdmModule from "./modules/sdm/SdmModule";

const AppRoutes = [
  {
    index: true,
    element: <DashboardModule />,
    layout: 'blank'
  },
  {
    path: '/dashboard',
    element: <DashboardModule />,
    layout: 'blank'
  },
  {
    path: '/apps',
    element: <AppsModule />,
    layout: 'blank'
  },
  {
    path: '/pages',
    element: <PagesModule />
  },
  {
    path: '/sdm',
    element: <SdmModule />
  },
  {
    path: '/sdm/:id',
    element: <SdmModule />
  }
];

export default AppRoutes;
