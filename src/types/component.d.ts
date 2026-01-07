export interface CardDetailprops {
  title: string;
  value: string;
  description: string;
  bgColor: string;
  iconColor: string; // Warna untuk ikon
  Icon: IconType; // Untuk menerima ikon sebagai props
  onClick?: () => void; // Optional click handler untuk filter
  isActive?: boolean; // Optional active state
};