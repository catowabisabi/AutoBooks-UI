import DashboardWorkspace from '../_components/dashboard-workspace';

export default async function DashboardEditorPage({
  params
}: {
  params: Promise<{ dashboardId: string }>;
}) {
  const { dashboardId } = await params;

  return <DashboardWorkspace dashboardId={dashboardId} />;
}
