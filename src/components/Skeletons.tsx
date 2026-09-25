import React from 'react';
import Skeleton from './ui/Skeleton';
import { cn } from '../lib/utils';

export const DashboardSkeleton = () => (
  <div className="h-full px-6 pt-3 pb-12 overflow-y-auto scrollbar-hide space-y-8">
    {/* Daily Mission Card Skeleton */}
    <Skeleton className="w-full h-48" borderRadius="32px" />
    
    {/* Live Activity Ticker Skeleton */}
    <Skeleton className="w-full h-10" borderRadius="9999px" />
    
    {/* Quick Access Skeleton */}
    <div className="grid grid-cols-3 gap-4">
      <Skeleton className="h-20" borderRadius="16px" />
      <Skeleton className="h-20" borderRadius="16px" />
      <Skeleton className="h-20" borderRadius="16px" />
    </div>

    {/* Study Goals Skeleton */}
    <Skeleton className="w-full h-32" borderRadius="24px" />

    {/* Mastery Graph Skeleton */}
    <div className="glass-card p-6">
      <Skeleton className="w-24 h-4 mb-4" />
      <div className="flex gap-2 items-end h-20">
        {[...Array(7)].map((_, i) => (
          <Skeleton key={i} className="flex-1" height={`${Math.random() * 60 + 40}%`} />
        ))}
      </div>
    </div>

    {/* Active Courses Skeleton */}
    <div className="space-y-4">
      <Skeleton className="w-32 h-6 mb-4" />
      <Skeleton className="w-full h-20" borderRadius="24px" />
      <Skeleton className="w-full h-20" borderRadius="24px" />
    </div>
  </div>
);

export const AITutorSkeleton = () => (
  <div className="flex flex-col h-full bg-dark-bg">
    {/* Header Skeleton */}
    <div className="px-6 pt-2 pb-4 border-b border-white/5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10" borderRadius="12px" />
        <div className="space-y-2">
          <Skeleton className="w-24 h-4" />
          <Skeleton className="w-32 h-2" />
        </div>
      </div>
      <div className="flex gap-2">
        <Skeleton className="w-10 h-10" borderRadius="12px" />
        <Skeleton className="w-10 h-10" borderRadius="12px" />
      </div>
    </div>
    
    {/* Messages Skeleton */}
    <div className="flex-1 px-6 py-6 space-y-8 overflow-hidden">
      <div className="flex justify-start">
        <Skeleton className="w-3/4 h-32" borderRadius="24px 24px 24px 4px" />
      </div>
      <div className="flex justify-end">
        <Skeleton className="w-1/2 h-16" borderRadius="24px 24px 4px 24px" />
      </div>
      <div className="flex justify-start">
        <Skeleton className="w-full h-48" borderRadius="24px 24px 24px 4px" />
      </div>
    </div>

    {/* Input Area Skeleton */}
    <div className="p-6">
      <Skeleton className="w-full h-14" borderRadius="32px" />
    </div>
  </div>
);

export const LecturesSkeleton = () => (
  <div className="h-full px-6 py-8 space-y-8 overflow-y-auto">
    <div className="flex items-center justify-between">
      <Skeleton className="w-40 h-8" />
      <Skeleton className="w-24 h-10" borderRadius="12px" />
    </div>
    
    <Skeleton className="w-full h-12" borderRadius="16px" />
    
    <div className="flex gap-2 pb-4 overflow-hidden">
      <Skeleton className="w-20 h-8" borderRadius="9999px" />
      <Skeleton className="w-20 h-8" borderRadius="9999px" />
      <Skeleton className="w-20 h-8" borderRadius="9999px" />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[...Array(6)].map((_, i) => (
        <Skeleton key={i} className="w-full h-40" borderRadius="24px" />
      ))}
    </div>
  </div>
);

export const CommunitySkeleton = () => (
  <div className="h-full flex flex-col">
    <div className="p-6 border-b border-white/5 space-y-4">
      <Skeleton className="w-32 h-6" />
      <div className="flex gap-2">
        <Skeleton className="flex-1 h-10" borderRadius="9999px" />
        <Skeleton className="w-10 h-10" borderRadius="12px" />
      </div>
    </div>
    <div className="flex-1 p-6 space-y-6 overflow-hidden">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="glass-card p-4 space-y-3">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10" borderRadius="9999px" />
            <div className="space-y-1">
              <Skeleton className="w-24 h-3" />
              <Skeleton className="w-16 h-2" />
            </div>
          </div>
          <Skeleton className="w-full h-4" />
          <Skeleton className="w-3/4 h-4" />
          <div className="flex gap-4 pt-2">
            <Skeleton className="w-12 h-4" />
            <Skeleton className="w-12 h-4" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const MissionsSkeleton = () => (
  <div className="h-full px-6 py-8 space-y-8 overflow-y-auto">
    <div className="flex items-center justify-between">
      <Skeleton className="w-40 h-8" />
      <Skeleton className="w-10 h-10" borderRadius="12px" />
    </div>

    <div className="glass-card p-6 flex items-center justify-between">
      <div className="space-y-2">
        <Skeleton className="w-48 h-4" />
        <Skeleton className="w-32 h-3" />
      </div>
      <Skeleton className="w-16 h-16" borderRadius="9999px" />
    </div>

    <div className="space-y-4">
      <Skeleton className="w-32 h-4" />
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex gap-4 items-center">
          <Skeleton className="w-12 h-12" borderRadius="12px" />
          <div className="flex-1 space-y-2">
            <Skeleton className="w-3/4 h-4" />
            <Skeleton className="w-1/2 h-2" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const AnalyticsSkeleton = () => (
  <div className="h-full px-6 py-8 space-y-8 overflow-y-auto">
    <Skeleton className="w-32 h-8" />
    
    <div className="grid grid-cols-2 gap-4">
      <Skeleton className="h-32" borderRadius="24px" />
      <Skeleton className="h-32" borderRadius="24px" />
    </div>
    
    <div className="glass-card p-6 space-y-6">
      <Skeleton className="w-40 h-6" />
      <Skeleton className="w-full h-48" borderRadius="16px" />
    </div>

    <div className="space-y-4">
      <Skeleton className="w-32 h-4" />
      <div className="grid grid-cols-2 gap-4">
         <Skeleton className="h-24" borderRadius="16px" />
         <Skeleton className="h-24" borderRadius="16px" />
      </div>
    </div>
  </div>
);

export const ProfileSkeleton = () => (
  <div className="h-full px-6 py-8 space-y-8 overflow-y-auto bg-dark-bg">
    <div className="flex items-center justify-between pt-4">
      <Skeleton className="w-24 h-6 opacity-40" />
      <div className="flex gap-2">
        <Skeleton className="w-9 h-9" borderRadius="12px" />
        <Skeleton className="w-9 h-9" borderRadius="12px" />
      </div>
    </div>

    <div className="flex flex-col items-center gap-4 py-6">
      <Skeleton className="w-24 h-24" borderRadius="32px" />
      <div className="space-y-2 items-center flex flex-col">
        <Skeleton className="w-40 h-6" />
        <Skeleton className="w-32 h-3" />
      </div>
    </div>

    <div className="grid grid-cols-3 gap-4">
      <Skeleton className="h-16" borderRadius="20px" />
      <Skeleton className="h-16" borderRadius="20px" />
      <Skeleton className="h-16" borderRadius="20px" />
    </div>

    <div className="space-y-4">
       <Skeleton className="w-48 h-8" borderRadius="12px" />
       <Skeleton className="w-full h-32" borderRadius="24px" />
       <Skeleton className="w-full h-16" borderRadius="24px" />
    </div>
  </div>
);

export const QuizzesSkeleton = () => (
  <div className="h-full px-6 pt-3 pb-6 overflow-y-auto">
    <Skeleton className="w-48 h-8" borderRadius="12px" />
    
    <div className="glass-card p-6 border-none">
      <div className="flex items-center gap-4 mb-6">
        <Skeleton className="w-12 h-12" borderRadius="12px" />
        <div className="space-y-2">
          <Skeleton className="w-32 h-4" />
          <Skeleton className="w-24 h-2" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-24" borderRadius="20px" />
        <Skeleton className="h-24" borderRadius="20px" />
      </div>
    </div>

    <div className="space-y-4">
      <Skeleton className="w-32 h-5" />
      {[...Array(3)].map((_, i) => (
        <div key={i} className="glass-card p-4 flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="w-40 h-4" />
            <Skeleton className="w-20 h-2" />
          </div>
          <Skeleton className="w-10 h-10" borderRadius="12px" />
        </div>
      ))}
    </div>
  </div>
);

export const NotificationsSkeleton = () => (
  <div className="h-full px-6 py-8 space-y-8 overflow-y-auto">
    <div className="flex items-center justify-between">
      <Skeleton className="w-48 h-8" />
      <Skeleton className="w-20 h-6" borderRadius="9999px" />
    </div>
    
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex gap-4 p-4 glass-card border-none">
          <Skeleton className="w-10 h-10 shrink-0" borderRadius="12px" />
          <div className="flex-1 space-y-2">
            <Skeleton className="w-3/4 h-4" />
            <Skeleton className="w-full h-3" />
            <Skeleton className="w-20 h-2" />
          </div>
        </div>
      ))}
    </div>
  </div>
);
