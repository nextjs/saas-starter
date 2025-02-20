import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { getCandidates } from '@/lib/db/queries';

export default async function CandidatesPage() {
  // const allCandidates = await getCandidates();
  interface Candidate {
    id: string;
    name: string;
    email: string;
    status: string;
    rating: string;
    userId: string;
    lastModified: Date;
  }

  interface User {
    id: string;
  }

  const candidates: Candidate[] = [
    { id: '1', name: 'John Doe', email: 'john@example.com', status: 'Active', rating: '5', userId: '1', lastModified: new Date('2023-10-01') },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', status: 'Inactive', rating: '4', userId: '2', lastModified: new Date('2023-10-02') },
    { id: '3', name: 'Alice Johnson', email: 'alice@example.com', status: 'Active', rating: '3', userId: '3', lastModified: new Date('2023-10-03') },
  ];

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Candidates Table</CardTitle>
        </CardHeader>
        <CardContent>
            <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                Email
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                Rating
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                Last Modified
              </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {candidates.map((candidate) => (
              <tr key={candidate.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{candidate.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{candidate.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{candidate.status}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{candidate.rating}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{candidate.lastModified.toLocaleDateString()}</td>
              </tr>
              ))}
            </tbody>
            </table>
        </CardContent>
      </Card>
    </div>
  );
}
