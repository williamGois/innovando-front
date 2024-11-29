import { ScrollArea } from '@/components/ui/scroll-area';
import EmployeeFormUpdate from './employee-form-update';
import PageContainer from '@/components/layout/page-container';

export default function EmployeeViewPage() {
  return (
    <PageContainer>
      <EmployeeFormUpdate />
    </PageContainer>
  );
}
