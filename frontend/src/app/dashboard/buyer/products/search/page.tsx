'use client';
import { motion } from 'framer-motion';
import { Search, Filter } from 'lucide-react';

export default function ProductSearch() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex justify-between items-center mb-6">
         <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Product Search</h1>
         <div className="flex gap-2">
            <div className="relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
               <input type="text" placeholder="Search products..." className="pl-10 pr-4 py-2 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <button className="p-2 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-gray-200"><Filter size={20} className="text-gray-600" /></button>
         </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
         {[1,2,3,4,5,6].map((i) => (
             <div key={i} className="rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1" style={{ border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)' }}>
                <div className="h-48 bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
                <div className="p-4">
                   <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                   <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
                   <div className="flex justify-between items-center mt-4">
                     <span className="text-sm text-gray-500">Local Farmer</span>
                     <span className="font-bold text-primary-600">/ton</span>
                   </div>
                </div>
             </div>
         ))}
      </div>
    </motion.div>
  );
}
