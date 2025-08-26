import { Link } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { useGetUserInstitutionsQuery } from '../../../../../redux/Auth/authApi';
import { Phone } from 'lucide-react';

const About = () => {

  const {data:InstitutionData,isLoading:loading} = useGetUserInstitutionsQuery();
  const inst = Array.isArray(InstitutionData) ? InstitutionData[0] : undefined;
  const tables = [
    { status: 'Email:', info: inst?.email },
    { status: 'Website:', info: inst?.website },
    { status: 'Phone Number:', info: inst?.phone },
    { status: 'Location', info: inst?.address },
    { status: 'Description:', info: inst?.description },
  ];

  const renderTable = (table, index) => {
    return (
      <TableRow key={index} className="border-0">
        <TableCell className="text-sm text-secondary-foreground py-2">
          {table.status}
        </TableCell>
        <TableCell className="text-sm text-mono py-2">{table.info}</TableCell>
      </TableRow>
    );
  };

  return (
    <Card>
      <CardHeader className="ps-8">
        <CardTitle>About</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableBody>
            {tables.map((table, index) => {
              return renderTable(table, index);
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export { About };
