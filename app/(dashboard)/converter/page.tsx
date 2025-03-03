import UploadArea from '@/components/UploadArea';
import UploadedFiles from '@/components/UploadedFiles';
import ConversionLibrary from '@/components/ConversionLibrary';

export default async function ConverterPage() {
  return (
    <main>
      <UploadArea />
      <UploadedFiles />
      <ConversionLibrary />
    </main>
  );
}