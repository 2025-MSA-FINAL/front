export default function ChartCard({ title, metadata, children, height }) {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 w-full">
      <h2 className="text-lg font-bold text-[#242424] mb-4">{title}</h2>

      <div className="w-full"
           style={{ height: height || '320px' }}  
           > 
        {children}
      </div>

      {metadata && (
        <div className="mt-4 text-xs text-[#9CA3AF] text-center">
          {metadata}
        </div>
      )}
    </div>
  );
}