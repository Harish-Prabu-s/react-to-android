import Layout from '@/components/Layout';
import { Search } from 'lucide-react';

export default function DiscoverPage() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-primary rounded-full mb-4">
            <Search className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Discover</h1>
          <p className="text-gray-600">Find new people to connect with</p>
        </div>
      </div>
    </Layout>
  );
}
