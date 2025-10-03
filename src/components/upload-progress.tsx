"use client";

import { motion } from "motion/react";

interface UploadProgressProps {
  progress: number;
  status: string;
}

export function UploadProgress({ progress, status }: UploadProgressProps) {
  return (
    <div className="space-y-6 py-8">
      {/* Status and Progress */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <motion.span
            key={status}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-medium text-foreground"
          >
            {status}
          </motion.span>
          <span className="text-muted-foreground font-mono">{progress}%</span>
        </div>

        {/* Progress Bar */}
        <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
          <motion.div
            className="h-full bg-gradient-to-r from-[#6366f1] to-[#8b5cf6]"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Animated Loading Dots */}
      <div className="flex items-center justify-center">
        <div className="flex space-x-2">
          {[0, 150, 300].map((delay, index) => (
            <motion.div
              key={index}
              className="h-2 w-2 rounded-full bg-[#6366f1]"
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: delay / 1000,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
