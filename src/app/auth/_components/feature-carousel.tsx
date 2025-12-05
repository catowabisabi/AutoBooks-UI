'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  BarChart3, 
  FileText, 
  Brain, 
  Calendar, 
  Users, 
  TrendingUp,
  Database,
  MessageSquare,
  PieChart,
  Lightbulb
} from 'lucide-react';

// ERP System Features for the carousel
const carouselItems = [
  {
    title: 'AI-Powered Analytics',
    titleZh: 'AI 驅動分析',
    description: 'Ask questions in natural language and get instant visualizations. Our AI analyzes your data and generates charts automatically.',
    descriptionZh: '用自然語言提問，即時獲得視覺化結果。AI 分析您的數據並自動生成圖表。',
    Icon: BarChart3,
    gradient: 'from-blue-500 to-cyan-500'
  },
  {
    title: 'Intelligent Document Assistant',
    titleZh: '智能文件助手',
    description: 'Upload documents and chat with AI to extract insights, summarize content, and find information instantly.',
    descriptionZh: '上傳文件並與 AI 對話，即時提取洞察、摘要內容、查找資訊。',
    Icon: FileText,
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    title: 'Smart Planning Assistant',
    titleZh: '智能規劃助手',
    description: 'AI-powered project planning with task breakdown, timeline suggestions, and resource allocation optimization.',
    descriptionZh: 'AI 驅動的專案規劃，包含任務分解、時間線建議和資源分配優化。',
    Icon: Calendar,
    gradient: 'from-green-500 to-emerald-500'
  },
  {
    title: 'Brainstorming Workspace',
    titleZh: '腦力激盪工作區',
    description: 'Collaborate with AI to generate ideas, organize thoughts, and develop strategies for any business challenge.',
    descriptionZh: '與 AI 協作產生創意、整理思路，為任何商業挑戰制定策略。',
    Icon: Lightbulb,
    gradient: 'from-yellow-500 to-orange-500'
  },
  {
    title: 'Financial Analytics',
    titleZh: '財務分析',
    description: 'Comprehensive financial reporting with AI-generated insights, trend analysis, and forecasting capabilities.',
    descriptionZh: '全面的財務報告，配備 AI 生成的洞察、趨勢分析和預測功能。',
    Icon: TrendingUp,
    gradient: 'from-red-500 to-rose-500'
  },
  {
    title: 'Knowledge Base Integration',
    titleZh: '知識庫整合',
    description: 'Build your company knowledge base and let AI provide accurate, context-aware answers from your documents.',
    descriptionZh: '建立公司知識庫，讓 AI 從您的文件中提供準確的上下文感知答案。',
    Icon: Database,
    gradient: 'from-indigo-500 to-violet-500'
  }
];

export function FeatureCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-scroll functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === carouselItems.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Manual navigation
  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const currentItem = carouselItems[currentIndex];

  return (
    <div className='relative flex h-full flex-col justify-center'>
      <div className='relative h-[400px] overflow-hidden'>
        <AnimatePresence mode='wait'>
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className='absolute inset-0 flex flex-col items-center justify-center px-4'
          >
            {/* Feature Card */}
            <div className='flex min-h-[320px] w-full max-w-lg flex-col items-center justify-center rounded-3xl border border-white/20 bg-white/10 p-8 shadow-lg backdrop-blur-sm'>
              {/* Icon */}
              <div className={cn(
                'mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br',
                currentItem.gradient
              )}>
                {currentItem.Icon && <currentItem.Icon className='h-10 w-10 text-white' />}
              </div>
              
              {/* Title - Bilingual */}
              <h3 className='mb-2 text-center text-2xl font-bold text-white'>
                {currentItem.title}
              </h3>
              <h4 className='mb-4 text-center text-lg font-medium text-white/80'>
                {currentItem.titleZh}
              </h4>
              
              {/* Description - English */}
              <p className='mb-2 text-center text-sm text-white/90 leading-relaxed'>
                {currentItem.description}
              </p>
              
              {/* Description - Chinese */}
              <p className='text-center text-sm text-white/70 leading-relaxed'>
                {currentItem.descriptionZh}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Indicators */}
      <div className='mt-8 flex justify-center gap-2'>
        {carouselItems.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={cn(
              'h-2 w-2 rounded-full transition-all duration-300',
              currentIndex === index
                ? 'w-6 bg-white'
                : 'bg-white/50 hover:bg-white/70'
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
