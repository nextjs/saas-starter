
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { getCandidates } from '@/lib/db/queries';

export default function CandidatesPage() {
  // const allCandidates = getCandidates();
  interface Candidate {
    id: string;
    name: string;
    email: string;
    status: Status;
    rating: string;
    userId: string;
    lastModified: Date;
  }

  enum Status {
    Pending = 'Pending',
    Completed= 'Completed',
  }


  const candidates: Candidate[] = [
    { id: '1', name: 'John Doe', email: 'john@example.com', status: Status.Pending, rating: '5', userId: '1', lastModified: new Date('2023-10-01') },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', status: Status.Pending, rating: '4', userId: '2', lastModified: new Date('2023-10-02') },
    { id: '3', name: 'Alice Johnson', email: 'alice@example.com', status: Status.Pending, rating: '3', userId: '3', lastModified: new Date('2023-10-03') },
  ];

  return (
    <div>
      <Card>
    
        <CardHeader>
          <CardTitle>Candidates Table</CardTitle>
        </CardHeader>
        <div className="flex p-4">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={() => {
        const name = prompt('Enter candidate name:') || 'New Candidate';
        const email = prompt('Enter candidate email:') || 'new@example.com';
        const statusInput = prompt('Enter candidate status:') || 'Pending';
        const status = statusInput === 'Completed' ? Status.Completed : Status.Pending;
        const rating = prompt('Enter candidate rating:') || '5';

        const newCandidate: Candidate = {
          id: (candidates.length + 1).toString(),
          name,
          email,
          status,
          rating,
          userId: (candidates.length + 1).toString(),
          lastModified: new Date(),
        };
        candidates.push(newCandidate);
        const tableBody = document.getElementById('candidates');
        if (tableBody) {
          const newRow = document.createElement('tr');
          newRow.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${newCandidate.name}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${newCandidate.email}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${newCandidate.status}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${newCandidate.rating}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${newCandidate.lastModified.toLocaleDateString()}</td>
          `;
          tableBody.appendChild(newRow);
        }
        }}
        >
          Add Candidate
        </button>
      </div>
        
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
            <tbody className="bg-white divide-y divide-gray-200" id='candidates'>
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
