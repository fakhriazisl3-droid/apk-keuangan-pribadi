import React from 'react';
import * as Icons from 'lucide-react';

interface IconResolverProps {
  name: string;
  className?: string;
  size?: number;
  color?: string;
}

export const IconResolver: React.FC<IconResolverProps> = ({
  name,
  className = 'w-5 h-5',
  size,
  color,
}) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const IconComponent = (Icons as any)[name] || Icons.CircleDollarSign;
  return <IconComponent className={className} size={size} color={color} />;
};
