import React, { useEffect } from 'react';
import { View, Animated, ViewProps } from 'react-native';
import { cn } from '@/utils/cn';

interface SkeletonProps extends ViewProps {
  className?: string;
}

export const Skeleton = ({ className, ...props }: SkeletonProps) => {
  const animatedValue = new Animated.Value(0);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[{ opacity }]}
      className={cn('bg-slate-200 rounded-lg', className)}
      {...props}
    />
  );
};
